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


    const result = await runner.init(
        run.data,
        {
            workingDir: "../../packages/terraform/src/cloud-init",
            runInShell: "pwsh",
            env: { NO_COLOR: "1" }
        }
    )
    return json(result.map(r => r.data))

}