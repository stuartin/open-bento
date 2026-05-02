import { Readable } from "stream";
import { rename, mkdir, rm } from "fs/promises";
import { createWriteStream as createWS } from "fs";
import { finished } from "stream/promises";
import { ReadableStream } from "stream/web";
import { fileTypeFromStream } from "file-type";
import path from "path";

export async function saveStreamWithType(
    webStream: ReadableStream,
    baseFilename: string,
    outputDir = "./uploads"
): Promise<{
    ok: boolean;
    path?: string;
    mime?: string;
    error?: unknown;
}> {
    let tempPath: string | null = null;

    try {
        // 0. ensure directory exists
        await mkdir(outputDir, { recursive: true });

        // 1. tee the stream
        const [detectStream, writeStream] = webStream.tee();

        // 2. start type detection
        const typePromise = fileTypeFromStream(detectStream);

        // 3. write to temp file
        tempPath = path.join(outputDir, `${baseFilename}.tmp`);
        const finalWriteStream = createWS(tempPath);

        const nodeWriteStream = Readable.fromWeb(writeStream);

        nodeWriteStream.pipe(finalWriteStream);
        await finished(finalWriteStream);

        // 4. resolve detected type
        const type = await typePromise;

        // 5. determine extension
        const ext = type?.ext ?? "bin";
        const finalPath = path.join(outputDir, `${baseFilename}.${ext}`);

        // 6. rename to final file
        await rename(tempPath, finalPath);

        return {
            ok: true,
            path: finalPath,
            mime: type?.mime ?? "application/octet-stream",
        };
    } catch (error) {
        // cleanup temp file if it exists
        if (tempPath) {
            try {
                await rm(tempPath, { force: true });
            } catch {
                // ignore cleanup errors
            }
        }

        return {
            ok: false,
            error,
        };
    }
}