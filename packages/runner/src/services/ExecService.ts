import { Chunk, Context, Data, Effect, Layer, Match, Stream, String } from "effect";
import { Command } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { EnvironmentService } from "./environments/EnvironmentService";

export type StartProps = {
    id: string;
    opts?: {
        workingDir?: string;
        env?: Record<string, string>;
        runInShell?: string | boolean
        removeNewLineCharacters?: boolean
        onStdErr?: (v: StdErr) => void
        onStdOut?: (v: StdOut) => void
        onExitCode?: (v: ExitCode) => void
    }
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

export class ExecService extends Effect.Service<ExecService>()("runner/ExecService", {
    effect: Effect.gen(function* () {

        const start = (p: StartProps) => {
            const props = {
                ...p,
                opts: {
                    workingDir: "./",
                    env: {},
                    runInShell: false,
                    removeNewLineCharacters: true,
                    onStdOut: (v) => Effect.logInfo(`[stdout] (${v.id}): ${v.data}`),
                    onStdErr: (v) => Effect.logError(`[stderr] (${v.id}): ${v.data}`),
                    onExitCode: (v) => Effect.logInfo(`[exitcode] (${v.id}): ${v.data}`),
                    ...p.opts,
                }
            } satisfies StartProps & { opts: Required<StartProps['opts']> }

            const runCommands = (commands: Command.Command[]) => {
                // 1. Create a stream from the array of commands
                const streamPipeline = Stream.fromIterable(commands).pipe(
                    Stream.flatMap(
                        (cmd) => {
                            // Apply working directory and optional environment variables
                            let configuredCmd = cmd.pipe(
                                Command.runInShell(props.opts.runInShell),
                                Command.workingDirectory(props.opts.workingDir),
                                Command.env(props.opts.env ?? {})
                            );

                            // Convert each individual process execution into a structured event stream
                            return Stream.unwrapScoped(
                                Effect.gen(function* () {
                                    // Start the process (inherits system environment via NodeContext)
                                    const process = yield* Command.start(configuredCmd);

                                    // 1. Stream stdout lines tagged as 'Stdout'
                                    const stdoutStream = process.stdout.pipe(
                                        Stream.decodeText(),
                                        Stream.map(line => new StdOut({ id: props.id, data: props.opts.removeNewLineCharacters ? String.trim(line) : line }))
                                    )

                                    // 2. Stream stderr lines tagged as 'Stderr'
                                    const stderrStream = process.stderr.pipe(
                                        Stream.decodeText(),
                                        Stream.map(line => new StdErr({ id: props.id, data: props.opts.removeNewLineCharacters ? String.trim(line) : line }))
                                    )

                                    // 3. A single-item stream that waits for the exit code
                                    const exitStream = Stream.fromEffect(
                                        process.exitCode.pipe(
                                            Effect.map(code => new ExitCode({ id: props.id, data: code })
                                            )
                                        )
                                    )

                                    // Merge stdout and stderr concurrently, then append the exit code at the very end
                                    return Stream.merge(stdoutStream, stderrStream).pipe(
                                        Stream.concat(exitStream)
                                    );
                                })
                            );
                        },
                        { concurrency: 1 } // Sequential processing
                    )
                )

                return Effect.gen(function* () {
                    yield* Effect.logInfo(`[EXEC] Started`)
                    yield* Effect.addFinalizer((exit) => Effect.logInfo(`[EXEC] Stopped`));

                    // Execute the stream and compile down to the results array
                    return yield* streamPipeline.pipe(
                        Stream.tap((event) => Match.value(event).pipe(
                            Match.tag("ExitCode", (exitCode) => {
                                props.opts.onExitCode(exitCode);
                                Effect.runSync(Effect.logInfo(`[EXEC] ExitCode: ${exitCode.data}`))
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

                })
            }

            return { runCommands };
        };

        return { start } as const
    }),
    dependencies: [NodeContext.layer]
}) { }