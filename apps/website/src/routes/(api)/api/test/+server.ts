import { orcpServerClient } from "$features/orpc/api-client.server";
import { runner } from "$features/runner/runner.server";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {

    const run = await orcpServerClient.tfe.runs.get({ params: { "run-id": "rqazjdmooq9wmlwpl6wym07e" } })
    console.log({ run })

    let stdOut: string[] = []
    const stdErr: string[] = []
    const result: string[] = []
    let lastExitCode: number = 0

    const logs = await runner.init(
        run.body,
        {
            runInShell: "pwsh",
            onUp: (id) => console.log(`onUp ${id}`),
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
            },
            onDown: (id) => console.log(`onDown ${id}`),
        }
    )

    return json(logs.map(ev => ev.data))
}