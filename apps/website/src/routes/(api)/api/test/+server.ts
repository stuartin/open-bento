import { runner } from "$features/runner/runner";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {


    const result = await runner.init({ id: "" })
    return json(result.map(r => r.data))

}