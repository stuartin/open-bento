import { Context, Effect } from "effect";
import { ExecService, type ExecResult, type ExecStartProps } from "../ExecService";
import type { Command, CommandExecutor } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";

export type EnvExecuteProps = ExecStartProps & {
    commands: Command.Command[],
}
export class EnvService extends Context.Tag("runner/EnvService")<
    EnvService,
    {
        readonly start: Effect.Effect<void>
        readonly execute: (props: EnvExecuteProps) => Effect.Effect<readonly ExecResult[], PlatformError, ExecService | CommandExecutor.CommandExecutor>
        readonly stop: Effect.Effect<void>
    }
>() { }
