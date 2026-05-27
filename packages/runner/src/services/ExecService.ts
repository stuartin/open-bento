import { Chunk, Data, Effect, Match, Stream, String as EffectString } from "effect";
import { Command } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import type { StandardCommand } from "@effect/platform/Command";

export type ExecStartProps = {
    id: string;
    opts?: {
        workingDir?: string;
        env?: Record<string, string>;
        runInShell?: string | boolean
        noColor?: boolean
        onStdOut?: (out: StdOut) => void
        onStdErr?: (err: StdErr) => void
        onExitCode?: (exit: ExitCode) => void
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

// biome-ignore lint/suspicious/noControlCharactersInRegex: Intentional control characters used to identify and strip ANSI escape sequences.
const NO_ANSI_COLOR = (line: string) => EffectString.replace(/(?:\x1B[@-_]|[\x80-\x9F])[0-?]*[ -/]*[@-~]/g, '')(line)

export class ExecService extends Effect.Service<ExecService>()("runner/ExecService", {
    effect: Effect.gen(function* () {

        const start = (p: ExecStartProps) => {
            const props = {
                ...p,
                opts: {
                    workingDir: "./",
                    env: {},
                    runInShell: false,
                    noColor: true,
                    onStdOut: (v) => Effect.logInfo(`[stdout] (${v.id}): ${v.data}`),
                    onStdErr: (v) => Effect.logError(`[stderr] (${v.id}): ${v.data}`),
                    onExitCode: (v) => Effect.logInfo(`[exitcode] (${v.id}): ${v.data}`),
                    ...p.opts,
                }
            } satisfies ExecStartProps & { opts: Required<ExecStartProps['opts']> }

            const runCommands = (commands: Command.Command[]) => {

                // 1. Create a stream from the array of commands
                const streamPipeline = Stream.fromIterable(commands).pipe(
                    Stream.flatMap(
                        (cmd) => {
                            // Apply working directory and optional environment variables
                            const configuredCmd = cmd.pipe(
                                Command.runInShell(props.opts.runInShell),
                                Command.workingDirectory(props.opts.workingDir),
                                Command.env(props.opts.env ?? {})
                            )

                            Effect.runSync(
                                Effect.logInfo(`[EXEC] ${(configuredCmd as StandardCommand).command} ${(configuredCmd as StandardCommand).args}`)
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

                return Effect.gen(function* () {
                    yield* Effect.logInfo(`[EXEC] Started`)
                    yield* Effect.addFinalizer(() => Effect.logInfo(`[EXEC] Stopped`));

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

                }).pipe(
                    Effect.scoped
                )
            }

            return { runCommands };
        };

        return { start } as const
    }),
    dependencies: [NodeContext.layer]
}) { }