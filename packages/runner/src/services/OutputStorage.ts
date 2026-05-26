import { FileSystem, Path } from "@effect/platform";
import { Effect } from "effect";

// OutputStorage service using Effect.Service pattern
export class OutputStorage extends Effect.Service<OutputStorage>()("runner/OutputStorage", {
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const initCommand = (cmdId: string, outputPath: string) =>
      Effect.gen(function* () {
        // Create output directory if it doesn't exist
        yield* fs.makeDirectory(outputPath, { recursive: true });

        const stdoutPath = path.join(outputPath, `${cmdId}.stdout`);
        const stderrPath = path.join(outputPath, `${cmdId}.stderr`);
        const exitcodePath = path.join(outputPath, `${cmdId}.exitcode`);

        yield* fs.writeFileString(stdoutPath, "");
        yield* fs.writeFileString(stderrPath, "");
        yield* fs.writeFileString(exitcodePath, "null");
      });

    const writeStdout = (cmdId: string, outputPath: string, data: string) =>
      Effect.gen(function* () {
        const stdoutPath = path.join(outputPath, `${cmdId}.stdout`);
        yield* fs.writeFileString(stdoutPath, data, { flag: "a" });
      });

    const writeStderr = (cmdId: string, outputPath: string, data: string) =>
      Effect.gen(function* () {
        const stderrPath = path.join(outputPath, `${cmdId}.stderr`);
        yield* fs.writeFileString(stderrPath, data, { flag: "a" });
      });

    const writeExitCode = (cmdId: string, outputPath: string, exitCode: number) =>
      Effect.gen(function* () {
        const exitcodePath = path.join(outputPath, `${cmdId}.exitcode`);
        yield* fs.writeFileString(exitcodePath, exitCode.toString());
      });

    const readOutput = (cmdId: string, outputPath: string) =>
      Effect.gen(function* () {
        const stdoutPath = path.join(outputPath, `${cmdId}.stdout`);
        const stderrPath = path.join(outputPath, `${cmdId}.stderr`);
        const exitcodePath = path.join(outputPath, `${cmdId}.exitcode`);

        const [stdout, stderr, exitCodeStr] = yield* Effect.all([
          fs.readFileString(stdoutPath),
          fs.readFileString(stderrPath),
          fs.readFileString(exitcodePath)
        ]);

        const exitCode = exitCodeStr === "null" ? null : Number.parseInt(exitCodeStr);

        return { stdout, stderr, exitCode };
      });

    const cleanup = (cmdId: string, outputPath: string) =>
      Effect.gen(function* () {
        const stdoutPath = path.join(outputPath, `${cmdId}.stdout`);
        const stderrPath = path.join(outputPath, `${cmdId}.stderr`);
        const exitcodePath = path.join(outputPath, `${cmdId}.exitcode`);

        yield* Effect.all([
          fs.remove(stdoutPath),
          fs.remove(stderrPath),
          fs.remove(exitcodePath)
        ], { concurrency: "unbounded" });
      });

    return {
      initCommand,
      writeStdout,
      writeStderr,
      writeExitCode,
      readOutput,
      cleanup
    } as const;
  }),
}) { }
