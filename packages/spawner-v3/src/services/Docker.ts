import { Command, CommandExecutor } from "@effect/platform";
import { Effect, type Stream } from "effect";
import { Config } from "./Config";
import type { PlatformError } from "@effect/platform/Error";

export class Docker extends Effect.Service<Docker>()("Docker", {
  effect: Effect.gen(function* () {
    const config = yield* Config;

    return {
      imageExists: (tag: string) =>
        Command.make("docker", "image", "inspect", tag).pipe(
          Command.exitCode,
          Effect.map((code) => code === 0),
        ),

      buildImage: (tag: string, dockerfilePath: string, dockerContextPath: string) =>
        Command.make(
          "docker",
          "build",
          "-f",
          dockerfilePath,
          "-t",
          tag,
          dockerContextPath,
        ).pipe(Command.lines),

      runContainer: (
        name: string,
        image: string,
        args: string[],
        env: Record<string, string>,
      ): Stream.Stream<string, PlatformError, CommandExecutor.CommandExecutor> =>
        Command.make(
          "docker",
          "run",
          "--name",
          name,
          "--rm",
          // "--runtime",
          // "sysbox-runc",
          ...Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]),
          image,
          ...args,
        ).pipe(Command.streamLines),
    };
  }),
  dependencies: [Config.Default],
}) { }
