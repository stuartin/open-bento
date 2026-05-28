import { Context, Effect } from "effect";
import { Command } from "@effect/platform";
import type { Run } from "@open-bento/tfe";

export class EnvService extends Context.Tag("runner/EnvService")<
    EnvService,
    {
        // Wraps generic commands with env-specific tags, environments, or prefixes
        readonly runCommand: (cmd: Command.Command) => Command.Command;

        // Lifecycle steps
        readonly up: (run: Run, url: string) => Effect.Effect<void, Error>;
        readonly down: (run: Run) => Effect.Effect<void, Error>;
    }
>() { }