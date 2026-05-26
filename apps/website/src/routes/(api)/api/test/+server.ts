import { runner } from "$features/runner/runner";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {


    const result = await runner.testCommand({
        id: "some-id",
        opts: {
            workingDir: "./"
        }
    })
    return json({ ok: true, result: result.map(r => r.data) })

}