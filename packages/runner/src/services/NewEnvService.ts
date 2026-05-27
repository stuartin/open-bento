import { Context, Effect } from "effect";
import { Command } from "@effect/platform";

export class NewEnvService extends Context.Tag("runner/NewEnvService")<
    NewEnvService,
    {
        // Wraps generic commands with env-specific tags, environments, or prefixes
        readonly runCommand: (cmd: Command.Command) => Command.Command;

        // Lifecycle steps
        readonly up: (id: string) => Effect.Effect<void, Error>;
        readonly down: (id: string) => Effect.Effect<void, Error>;
    }
>() { }