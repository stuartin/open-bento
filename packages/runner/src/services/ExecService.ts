import { Chunk, Data, Effect, Match, Stream, String as EffectString, Schedule, Ref } from "effect";
import { Command } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import type { StandardCommand } from "@effect/platform/Command";
import { NewEnvService } from "./NewEnvService";
import { RunnerPropsRef } from "../RunnerPropsRef";

export type ExecStartProps = {
    id: string;
    opts?: {
        workingDir?: string;
        env?: Record<string, string>;
        runInShell?: string | boolean
        noColor?: boolean
        onUp?: (id: string) => void
        onStdOut?: (out: StdOut) => void
        onStdErr?: (err: StdErr) => void
        onExitCode?: (exit: ExitCode) => void
        onDown?: (id: string) => void
    }
}

export const defaultExecStartOpts: Required<ExecStartProps['opts']> = {
    workingDir: "./",
    env: {},
    runInShell: false,
    noColor: true,
    onUp: () => undefined,
    onStdOut: () => undefined,
    onStdErr: () => undefined,
    onExitCode: () => undefined,
    onDown: () => undefined,
}

export class StdOut extends Data.TaggedClass("StdOut")<{
    readonly id: string;
    readonly data: string
}> { }

export class StdErr extends Data.TaggedClass("StdErr")<{
    readonly id: string;
    readonly data: string
}> { }

export class ExitCode extends Data.TaggedClass("ExitCode")<{
    readonly id: string;
    readonly data: number;
}> { }

export type ExecResult = StdOut | StdErr | ExitCode

// biome-ignore lint/suspicious/noControlCharactersInRegex: Intentional control characters used to identify and strip ANSI escape sequences.
const NO_ANSI_COLOR = (line: string) => EffectString.replace(/(?:\x1B[@-_]|[\x80-\x9F])[0-?]*[ -/]*[@-~]/g, '')(line)

export class ExecService extends Effect.Service<ExecService>()("runner/ExecService", {
    effect: Effect.gen(function* () {
        const runnerPropsRef = yield* RunnerPropsRef
        const runnerProps = yield* Ref.get(runnerPropsRef)
        const envService = yield* NewEnvService;
        const queueSemaphore = yield* Effect.makeSemaphore(runnerProps.maxConcurrent);
        const queueCountRef = yield* Ref.make(0);

        const start = (p: ExecStartProps) => {
            const props = {
                ...p,
                opts: {
                    ...defaultExecStartOpts,
                    ...p.opts,
                }
            } satisfies ExecStartProps & { opts: Required<ExecStartProps['opts']> }

            const runCommands = (commands: Command.Command[]) => {

                // Creates a stream to run the commands sequentially
                // Union of StdOut, StdErr and ExitCode
                const commandStreamPipeline = Stream.fromIterable(commands).pipe(
                    Stream.flatMap(
                        (cmd) => {
                            // 3. Transform the generic command using your EnvService wrapper
                            const wrappedCmd = envService.runCommand(cmd);

                            // 4. Inject manual builder options on top of the environment wrapper
                            const configuredCmd = wrappedCmd.pipe(
                                Command.runInShell(props.opts.runInShell),
                                Command.workingDirectory(props.opts.workingDir),
                                Command.env(props.opts.env ?? {})
                            )

                            Effect.runSync(
                                Effect.logInfo(`[EXEC] (${props.id}): Running Command: ${(configuredCmd as StandardCommand).command} ${(configuredCmd as StandardCommand).args}`)
                            )

                            // Convert each individual process execution into a structured event stream
                            return Stream.unwrap(
                                Effect.gen(function* () {

                                    // Start the process (inherits system environment via NodeContext)
                                    const process = yield* Command.start(configuredCmd);

                                    // 1. Stream stdout lines tagged as 'Stdout'
                                    const stdoutStream = process.stdout.pipe(
                                        Stream.decodeText(),
                                        Stream.splitLines,
                                        Stream.map(line => new StdOut({ id: props.id, data: props.opts.noColor ? NO_ANSI_COLOR(line) : line }))
                                    )

                                    // 2. Stream stderr lines tagged as 'Stderr'
                                    const stderrStream = process.stderr.pipe(
                                        Stream.decodeText(),
                                        Stream.splitLines,
                                        Stream.map(line => new StdErr({ id: props.id, data: props.opts.noColor ? NO_ANSI_COLOR(line) : line }))
                                    )

                                    // 3. A single-item stream that waits for the exit code
                                    const exitStream = Stream.fromEffect(
                                        process.exitCode.pipe(
                                            Effect.map(code => new ExitCode({ id: props.id, data: code }))
                                        )
                                    )

                                    // Merge stdout and stderr concurrently, then append the exit code at the very end
                                    return Stream.merge(stdoutStream, stderrStream).pipe(
                                        Stream.merge(exitStream)
                                    );
                                })
                            );
                        },
                        { concurrency: 1 } // Sequential processing
                    )
                )

                // The execution pipeline, launches and environment
                // and then runs the commandStream
                const executionStreamPipeline = Effect.gen(function* () {
                    // Track queue count
                    const queueCount = yield* Ref.updateAndGet(queueCountRef, (n) => n + 1);
                    yield* Effect.logInfo(`[ENV] (${props.id}) Added to queue (${queueCount}/${runnerProps.maxConcurrent})`);
                    yield* Effect.addFinalizer(() => Ref.update(queueCountRef, (n) => n - 1));

                    // Bring Env up (with retry)
                    const retryPolicy = Schedule.exponential("200 millis").pipe(
                        Schedule.compose(Schedule.recurs(2)) // 2 retries = 3 total attempts
                    );

                    yield* envService.up(props.id).pipe(
                        Effect.tapError((err) =>
                            Effect.logWarning(`[ENV] (${props.id}): Up failed: ${err.message}. Retrying...`)
                        ),
                        Effect.retry(retryPolicy) // Native Effect scheduling engine
                    );
                    props.opts.onUp(props.id);
                    yield* Effect.logInfo(`[ENV] (${props.id}): Env Up`);

                    // Env Down finalizer
                    yield* Effect.addFinalizer(() =>
                        Effect.gen(function* () {
                            yield* envService.down(props.id);
                            props.opts.onDown(props.id);
                            yield* Effect.logInfo(`[ENV] (${props.id}): Env Down`);
                        }).pipe(Effect.orDie)
                    );

                    // Exec Start
                    return yield* commandStreamPipeline.pipe(
                        Stream.tap((event) => Match.value(event).pipe(
                            Match.tag("ExitCode", (exitCode) => {
                                Effect.runSync(
                                    Effect.logInfo(`[EXEC] (${props.id}): Command Finished. (exit code: ${exitCode.data})`)
                                )
                                props.opts.onExitCode(exitCode);
                                return Effect.void
                            }),
                            Match.tag("StdOut", (stdOut) => {
                                props.opts.onStdOut(stdOut);
                                return Effect.void;
                            }),
                            Match.tag("StdErr", (stdErr) => {
                                props.opts.onStdErr(stdErr);
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
                        yield* Effect.logWarning(`[EXEC] (${props.id}) Queue full, waiting...`);
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