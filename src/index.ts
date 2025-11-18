import { Elysia } from "elysia";
import chatHandler from "./handlers/chat";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(chatHandler)
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
