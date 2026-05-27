import { Context, Effect } from "effect";
import { ExecService, type ExecResult, type StartProps } from "../ExecService";
import type { Command, CommandExecutor } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";

export class EnvironmentService extends Context.Tag("runner/EnvironmentService")<
    EnvironmentService,
    {
        readonly start: Effect.Effect<void>
        readonly execute: (props: StartProps, commands: Command.Command[]) => Effect.Effect<readonly ExecResult[], PlatformError, ExecService | CommandExecutor.CommandExecutor>
        readonly stop: Effect.Effect<void>
    }
>() { }
