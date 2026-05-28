import { Chunk, Effect, Match, Stream, String as EffectString, Schedule, Ref, identity } from "effect";
import { Command } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import type { StandardCommand } from "@effect/platform/Command";
import { EnvService } from "./EnvService";
import { RunnerPropsRef } from "../RunnerPropsRef";
import { StdOut, StdErr, ExitCode, type RunnerCallbacks } from "../types";
import type { Run } from "@open-bento/tfe";

type ExecStartProps = {
    run: Run
    url: string
    opts?: {
        workingDir?: string;
        env?: Record<string, string>;
        runInShell?: string | boolean
        noColor?: boolean
    } & RunnerCallbacks
}

// biome-ignore lint/suspicious/noControlCharactersInRegex: Intentional control characters used to identify and strip ANSI escape sequences.
const NO_ANSI_COLOR = (line: string) => EffectString.replace(/(?:\x1B[@-_]|[\x80-\x9F])[0-?]*[ -/]*[@-~]/g, '')(line)

export class ExecService extends Effect.Service<ExecService>()("runner/ExecService", {
    effect: Effect.gen(function* () {
        const runnerPropsRef = yield* RunnerPropsRef
        const runnerProps = yield* Ref.get(runnerPropsRef)
        const envService = yield* EnvService;
        const queueSemaphore = yield* Effect.makeSemaphore(runnerProps.maxConcurrent);
        const queueCountRef = yield* Ref.make(0);

        const start = (props: ExecStartProps) => {
            const runId = props.run.data.id

            const runCommands = (commands: Command.Command[]) => {

                // Creates a stream to run the commands sequentially
                // Union of StdOut, StdErr and ExitCode
                const commandStreamPipeline = Stream.fromIterable(commands).pipe(
                    Stream.flatMap(
                        (cmd) => {
                            // cmd defaults from props
                            const configuredCmd = cmd.pipe(
                                props.opts?.runInShell ? Command.runInShell(props.opts.runInShell) : identity,
                                props.opts?.workingDir ? Command.workingDirectory(props.opts.workingDir) : identity,
                                props.opts?.env ? Command.env(props.opts.env) : identity
                            )

                            // env wraps the cmd as needed
                            const wrappedCmd = envService.runCommand(props.run, configuredCmd);


                            Effect.runSync(
                                Effect.logInfo(`[EXEC] (${runId}): Running Command: ${(wrappedCmd as StandardCommand).command} ${(wrappedCmd as StandardCommand).args}`)
                            )

                            // Convert each individual cmd process execution into a structured event stream
                            return Stream.unwrap(
                                Effect.gen(function* () {

                                    // Start the process (inherits system environment via NodeContext)
                                    const process = yield* Command.start(wrappedCmd);

                                    // 1. Stream stdout lines tagged as 'Stdout'
                                    const stdoutStream = process.stdout.pipe(
                                        Stream.decodeText(),
                                        Stream.splitLines,
                                        Stream.map(line => new StdOut({ id: runId, data: props.opts?.noColor ? NO_ANSI_COLOR(line) : line }))
                                    )

                                    // 2. Stream stderr lines tagged as 'Stderr'
                                    const stderrStream = process.stderr.pipe(
                                        Stream.decodeText(),
                                        Stream.splitLines,
                                        Stream.map(line => new StdErr({ id: runId, data: props.opts?.noColor ? NO_ANSI_COLOR(line) : line }))
                                    )

                                    // 3. A single-item stream that waits for the exit code
                                    const exitStream = Stream.fromEffect(
                                        process.exitCode.pipe(
                                            Effect.map(code => new ExitCode({ id: runId, data: code }))
                                        )
                                    )

                                    // Merge stdout and stderr concurrently, then append the exit code at the very end
                                    return Stream.merge(stdoutStream, stderrStream).pipe(
                                        Stream.merge(exitStream)
                                    );
                                })
                            );
                        },
                        { concurrency: 1 } // Sequential processing of cmd's
                    )
                )

                // The execution pipeline, launches and environment
                // and then runs the commandStream
                const executionStreamPipeline = Effect.gen(function* () {
                    // Track queue count
                    const queueCount = yield* Ref.updateAndGet(queueCountRef, (n) => n + 1);
                    yield* Effect.logInfo(`[ENV] (${runId}) Added to queue (${queueCount}/${runnerProps.maxConcurrent})`);
                    yield* Effect.addFinalizer(() => Ref.update(queueCountRef, (n) => n - 1));

                    // Bring Env up (with retry)
                    const retryPolicy = Schedule.exponential("200 millis").pipe(
                        Schedule.compose(Schedule.recurs(2)) // 2 retries = 3 total attempts
                    );

                    yield* envService.up(props.run, props.url).pipe(
                        Effect.tapError((err) =>
                            Effect.logWarning(`[ENV] (${runId}): Up failed: ${err.message}. Retrying...`)
                        ),
                        Effect.retry(retryPolicy)
                    );
                    props.opts?.onUp?.(runId);
                    yield* Effect.logInfo(`[ENV] (${runId}): Env Up`);

                    // Env Down finalizer
                    yield* Effect.addFinalizer(() =>
                        Effect.gen(function* () {
                            yield* envService.down(props.run);
                            props.opts?.onDown?.(runId);
                            yield* Effect.logInfo(`[ENV] (${runId}): Env Down`);
                        }).pipe(Effect.orDie)
                    );

                    // Exec Start
                    return yield* commandStreamPipeline.pipe(
                        Stream.tap((event) => Match.value(event).pipe(
                            Match.tag("ExitCode", (exitCode) => {
                                Effect.runSync(
                                    Effect.logInfo(`[EXEC] (${runId}): Command Finished. (exit code: ${exitCode.data})`)
                                )
                                props.opts?.onExitCode?.(exitCode);
                                return Effect.void
                            }),
                            Match.tag("StdOut", (stdOut) => {
                                props.opts?.onStdOut?.(stdOut);
                                return Effect.void;
                            }),
                            Match.tag("StdErr", (stdErr) => {
                                props.opts?.onStdErr?.(stdErr);
                                return Effect.void;
                            }),
                            Match.exhaustive
                        )),
                        Stream.filter((event) => event._tag !== "ExitCode"),
                        (stream) => Stream.runCollect(stream),
                        Effect.map(Chunk.toReadonlyArray)
                    );
                });


                // Run the executionStream wrapped in a scope
                // using semaphores
                return Effect.gen(function* () {
                    const queueCount = yield* Ref.get(queueCountRef);

                    if (queueCount >= runnerProps.maxConcurrent) {
                        yield* Effect.logWarning(`[EXEC] (${runId}) Queue full, waiting...`);
                    }

                    return yield* executionStreamPipeline.pipe(
                        Effect.scoped,
                        queueSemaphore.withPermits(1)
                    );
                });
            }

            return { runCommands };
        };

        return { start } as const
    }),
    dependencies: [NodeContext.layer]
}) { }