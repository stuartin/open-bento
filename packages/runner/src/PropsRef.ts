import { Context, Ref } from "effect"

type BaseProps = {
    readonly maxConcurrent: number
}

type ModeProps =
    | {
        readonly mode: "local"
        readonly path: string
    }
    | {
        readonly mode: "docker"
    }

export type RunnerProps = BaseProps & ModeProps

const defaultRunnerProps: RunnerProps = {
    maxConcurrent: 10,
    mode: "local",
    path: "./RUNNER"
}

export class PropsRef extends Context.Reference<RunnerProps>()("runner/PropsRef", {
    defaultValue: () => Ref.unsafeMake(defaultRunnerProps) as Ref.Ref<RunnerProps>
}) { }