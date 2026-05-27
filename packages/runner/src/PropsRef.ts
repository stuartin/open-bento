import { Context, Ref } from "effect"

export type RunnerProps = {
    readonly maxConcurrent: number
    readonly environment: "local"
}

const defaultRunnerProps: RunnerProps = {
    maxConcurrent: 10,
    environment: "local"
}

export class PropsRef extends Context.Reference<RunnerProps>()("runner/PropsRef", {
    defaultValue: () => Ref.unsafeMake(defaultRunnerProps)
}) { }