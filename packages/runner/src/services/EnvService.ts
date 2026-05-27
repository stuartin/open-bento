import { Context, Effect } from "effect";
import { Command } from "@effect/platform";
import type { ExecStartProps } from "./ExecService";

type EnvOpts = { id: ExecStartProps['id'], opts?: { [K in 'workingDir' | 'env']: NonNullable<ExecStartProps['opts']>[K] } }

export type OnEnvCallback = (opts: EnvOpts) => Effect.Effect<void, Error>;

export class EnvService extends Context.Tag("runner/EnvService")<
    EnvService,
    {
        // Wraps generic commands with env-specific tags, environments, or prefixes
        readonly runCommand: (cmd: Command.Command) => Command.Command;

        // Lifecycle steps
        readonly up: OnEnvCallback
        readonly down: OnEnvCallback
    }
>() { }