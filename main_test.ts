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

Deno.test("GET route should send ArrayBuffer correctly", async () => {
  const app = new Router();

  app.get("/buffer", (_, res) => {
    const data = new TextEncoder().encode("Hello Buffer");
    return res
      .setHeader("Content-Type", "application/octet-stream")
      .send(data.buffer);
  });

  const request = new Request("http://localhost/buffer");
  const response = await app.handler(request);

  const buffer = await response.arrayBuffer();
  const text = new TextDecoder().decode(buffer);

  assertEquals(text, "Hello Buffer");
  assertEquals(
    response.headers.get("Content-Type"),
    "application/octet-stream"
  );
  assertEquals(response.status, 200);
});

Deno.test("GET route should send Uint8Array correctly", async () => {
  const app = new Router();

  app.get("/uint8", (_, res) => {
    const data = new Uint8Array([72, 101, 108, 108, 111]);
    return res.setHeader("Content-Type", "application/octet-stream").send(data);
  });

  const request = new Request("http://localhost/uint8");
  const response = await app.handler(request);

  const buffer = await response.arrayBuffer();
  const text = new TextDecoder().decode(buffer);

  assertEquals(text, "Hello");
  assertEquals(response.status, 200);
});

Deno.test("GET route should send Blob correctly", async () => {
  const app = new Router();

  app.get("/blob", (_, res) => {
    const blob = new Blob(["Test Blob Content"], { type: "text/plain" });
    return res.setHeader("Content-Type", "text/plain").send(blob);
  });

  const request = new Request("http://localhost/blob");
  const response = await app.handler(request);

  const text = await response.text();

  assertEquals(text, "Test Blob Content");
  assertEquals(response.headers.get("Content-Type"), "text/plain");
  assertEquals(response.status, 200);
});
