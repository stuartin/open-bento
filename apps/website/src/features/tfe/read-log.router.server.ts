import { createRouter } from "$features/orpc/factories";
import { tfeContract } from "@open-bento/tfe";

const os = createRouter(tfeContract.readLogs)
export const tfeReadLogsRouter = os
    .router({
        get: os.get.handler(async ({ context }) => {

            await new Promise(resolve => setTimeout(resolve, 3000));

            const words = [
                "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
                "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
                "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation"
            ];

            const generateLine = () => {
                const wordCount = Math.floor(Math.random() * 8) + 5;
                const line = Array.from({ length: wordCount }, () =>
                    words[Math.floor(Math.random() * words.length)]
                ).join(" ");
                return line.charAt(0).toUpperCase() + line.slice(1) + ".";
            };

            const lineCount = Math.floor(Math.random() * 10) + 5;
            const lines = Array.from({ length: lineCount }, generateLine)

            const shouldStop = Math.random() < 1 / 2

            if (shouldStop) {
                return {
                    status: 204,
                    body: undefined
                }
            }

            return {
                status: 200,
                body: new Blob([lines.join("\n")], { type: "text/plain" }),
            };
        })
    })
