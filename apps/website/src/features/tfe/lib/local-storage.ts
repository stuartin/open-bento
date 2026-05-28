import { Readable } from "node:stream";
import { rename, mkdir, rm, readFile, readdir } from "node:fs/promises";
import { createWriteStream as createWS } from "node:fs";
import { finished } from "node:stream/promises";
import type { ReadableStream } from "node:stream/web";
import { fileTypeFromStream, fileTypeFromFile } from "file-type";
import path from "node:path";

export async function saveToDisk(
    webStream: ReadableStream,
    filePath: string,
    fileName: string,
): Promise<{
    ok: boolean;
    path?: string;
    mime?: string;
    error?: unknown;
}> {
    let tempPath: string | null = null;

    try {
        // 0. ensure directory exists
        await mkdir(filePath, { recursive: true });

        // 1. tee the stream
        const [detectStream, writeStream] = webStream.tee();

        // 2. start type detection
        const typePromise = fileTypeFromStream(detectStream);

        // 3. write to temp file
        tempPath = path.join(filePath, `${fileName}.tmp`);
        const finalWriteStream = createWS(tempPath);

        const nodeWriteStream = Readable.fromWeb(writeStream);

        nodeWriteStream.pipe(finalWriteStream);
        await finished(finalWriteStream);

        // 4. resolve detected type
        const type = await typePromise;

        // 5. determine extension
        const ext = type?.ext ?? "bin";
        const finalPath = path.join(filePath, `${fileName}.${ext}`);

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

export async function retrieveFromDisk(
    filePath: string,
    fileNamePrefix: string
): Promise<{
    ok: true;
    file: File;
    mime: string;
    fileName: string;
} | {
    ok: false;
    error?: unknown;
    file: undefined;
}> {
    try {
        // 1. find file starting with the prefix
        const files = await readdir(filePath);
        const matchingFile = files.find(file => file.startsWith(fileNamePrefix));

        if (!matchingFile) {
            throw new Error(`No file found starting with "${fileNamePrefix}" in ${filePath}`);
        }

        const fullPath = path.resolve(filePath, matchingFile);

        console.log({ fullPath })

        // 2. read the file from disk
        const buffer = await readFile(fullPath);

        // 3. detect the file type
        const type = await fileTypeFromFile(fullPath);

        // 4. determine mime type
        const mime = type?.mime ?? "application/octet-stream";

        // 5. create a Blob from the buffer
        const file = new File([buffer], matchingFile, { type: mime });

        return {
            ok: true,
            file,
            mime,
            fileName: matchingFile,
        };
    } catch (error) {
        console.log({ error })
        return {
            ok: false,
            error,
            file: undefined
        };
    }
}