import { cors } from "@elysia/cors";
import { html } from "@elysia/html";
import { sleep } from "bun";
import { Elysia } from "elysia";

export default new Elysia()
  .use(cors())
  .use(html())
  .get("/stream", async function* () {
    const textToStream =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    const chunks = textToStream.split(" ");

    for (const chunk of chunks) {
      yield chunk + " ";
      await sleep(Math.random() * 100 + 50);
    }
  })
  .get(
    "/",
    () => `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: sans-serif;
              max-width: 600px;
              margin: 2rem auto;
              padding: 0 1rem;
              line-height: 1.5;
            }
            button {
              padding: 0.5rem 1rem;
              cursor: pointer;
            }
            .stream-box {
              margin-top: 1.5rem;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <button id="stream-btn">Start streaming</button>
          <div id="output" class="stream-box"></div>
          <script>
            const btn = document.getElementById("stream-btn");
            const output = document.getElementById("output");

            btn.addEventListener("click", async () => {
              btn.disabled = true;
              output.textContent = "";

              try {
                const response = await fetch("/stream");

                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");

                while (true) {
                  const { done, value } = await reader.read();

                  if (done) {
                    break;
                  }

                  output.textContent += decoder.decode(value, { stream: true });
                }
              } catch (error) {
                console.error(error);
              } finally {
                btn.disabled = false;
              }
            });
          </script>
        </body>
      </html>
    `,
  )
  .listen(3000);
