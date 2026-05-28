import { Data, Effect } from "effect"
import type { makeRunner } from "."

export { ENVIRONMENTS } from "./RunnerPropsRef"

export type Runner = ReturnType<typeof makeRunner>

export type RunnerCallbacks = {
    onUp?: (id: string) => void
    onStdOut?: (out: StdOut) => void
    onStdErr?: (err: StdErr) => void
    onExitCode?: (exit: ExitCode) => void
    onDown?: (id: string) => void
}

export class StdOut extends Data.TaggedClass("StdOut")<{
    readonly id: string;
    readonly data: string
}> { }

export class StdErr extends Data.TaggedClass("StdErr")<{
    readonly id: string;
    readonly data: string
}> { }

export class ExitCode extends Data.TaggedClass("ExitCode")<{
    readonly id: string;
    readonly data: number;
}> { }

export type ExecResult = StdOut | StdErr | ExitCode