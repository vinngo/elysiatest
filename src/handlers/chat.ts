import { Elysia, status } from "elysia";
import { client } from "../openai";

type ChatRequest = {
  message: string;
};

const app = new Elysia().post("/chat", async ({ body, set }) => {
  try {
    const { message } = body as ChatRequest;

    const stream = await client.responses.create({
      model: "gpt-5-nano",
      input: message,
      stream: true,
    });

    // Set headers for SSE (Server-Sent Events)
    set.headers["Content-Type"] = "text/event-stream";
    set.headers["Cache-Control"] = "no-cache";
    set.headers["Connection"] = "keep-alive";

    // Create a ReadableStream to stream the response
    return new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of stream) {
            // Extract the content from the chunk
            const content = chunk;

            if (content) {
              // Send as SSE format: "data: content\n\n"
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              console.log(content);
              controller.enqueue(encoder.encode(data));
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  } catch (e) {
    return status(500, "An error occurred");
  }
});

export default app;
