import { Context, Ref } from "effect"
import { LocalEnvService, type LocalEnvProps } from "./services/LocalEnvService"
import { DockerEnvService, type DockerEnvProps } from "./services/DockerEnvService"

// Used by external apps/packages only
export const ENVIRONMENTS = {
    LOCAL: LocalEnvService.Name,
    DOCKER: DockerEnvService.Name
}

export type RunnerProps = {
    readonly maxConcurrent: number
    readonly env: LocalEnvProps | DockerEnvProps
}

const defaultRunnerProps: RunnerProps = {
    maxConcurrent: 10,
    env: {
        name: LocalEnvService.Name,
        path: "./RUNNER"
    }
}

export class RunnerPropsRef extends Context.Reference<RunnerProps>()("runner/RunnerPropsRef", {
    defaultValue: () => Ref.unsafeMake(defaultRunnerProps) as Ref.Ref<RunnerProps>
}) { }