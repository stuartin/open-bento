import { runner } from "$features/runner/runner";
import { CreateRunOutput } from "@open-bento/tfe";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {

    const run = CreateRunOutput.shape.body.safeParse({
        data: {
            type: "runs",
            id: "test",
            attributes: {
                status: "pending",
                "has-changes": false,
                "is-destroy": false,
                "plan-only": true,
                refresh: true,
                "save-plan": false,
                "auto-apply": false,
                message: "",
                "updated-at": new Date().toISOString(),
                "created-at": new Date().toISOString(),
                "position-in-queue": 0,
                actions: {
                    "is-cancelable": true,
                    "is-confirmable": false,
                    "is-discardable": false,
                    "is-force-cancelable": false,
                },
                permissions: {
                    "can-apply": false,
                    "can-cancel": false,
                    "can-comment": false,
                    "can-discard": false,
                    "can-force-execute": false,
                    "can-force-cancel": false,
                    "can-override-policy-check": false,
                },
                variables: []
            },
        },
    });

    if (!run.success) return error(500, run.error)

    let stdOut: string[] = []
    const stdErr: string[] = []
    const result: string[] = []
    let lastExitCode: number = 0

    await runner.init(
        run.data,
        {
            workingDir: "../../packages/terraform/src/cloud-init",
            runInShell: "pwsh",
            onStdOut: (stdout) => stdOut.push(stdout.data),
            onStdErr: (stderr) => stdErr.push(stderr.data),
            onExitCode: (exitcode) => {
                lastExitCode = exitcode.data
                if (lastExitCode === 0) {
                    result.push(...stdOut)
                    stdOut = []
                } else {
                    result.push(...stdErr)
                }
            }
        }
    )

    return lastExitCode === 0 ? json(result) : error(500, JSON.stringify(result))
}