import { makeRunner } from "@open-bento/runner";

export const runner = makeRunner({
    maxConcurrent: 10
})