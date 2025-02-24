import { assertEquals } from "@std/assert";
import { Router } from "./src/router.ts";

Deno.test("GET route should return correct response", async () => {
  const app = new Router();
  app.get("/test", (_, res) => res.send({ success: true }));

  const request = new Request("http://localhost/test");
  const response = await app.handler(request);

  const body = await response.json();
  assertEquals(body, { success: true });
  assertEquals(response.status, 200);
});

Deno.test("GET /users/:id should return correct response", async () => {
  const app = new Router();
  app.get("/users/:id", (_, res, params) => res.send({ userId: params?.id }));

  const request = new Request("http://localhost/users/123");
  const response = await app.handler(request);

  const body = await response.json();
  assertEquals(body, { userId: "123" });
  assertEquals(response.status, 200);
});

Deno.test(
  "GET /search with query params should return correct response",
  async () => {
    const app = new Router();
    app.get("/search", (_, res, __, queries) => res.send({ query: queries }));

    const request = new Request("http://localhost/search?key=value");
    const response = await app.handler(request);

    const body = await response.json();
    assertEquals(body, { query: { key: "value" } });
    assertEquals(response.status, 200);
  }
);

Deno.test("404 for unknown routes", async () => {
  const app = new Router();

  const request = new Request("http://localhost/unknown");
  const response = await app.handler(request);

  assertEquals(response.status, 404);
});
