import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

test("GET /api/health reports ok", async () => {
  const app = createApp();
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "ok");
});

test("GET /api/messages returns the seeded messages", async () => {
  const app = createApp({ messages: [{ id: 1, text: "hi", createdAt: "now" }] });
  const res = await request(app).get("/api/messages");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, [{ id: 1, text: "hi", createdAt: "now" }]);
});

test("POST /api/messages creates a message", async () => {
  const app = createApp();
  const res = await request(app)
    .post("/api/messages")
    .send({ text: "hello world" });
  assert.equal(res.status, 201);
  assert.equal(res.body.text, "hello world");
  assert.equal(res.body.id, 1);
  assert.ok(res.body.createdAt);

  const list = await request(app).get("/api/messages");
  assert.equal(list.body.length, 1);
});

test("POST /api/messages rejects empty text", async () => {
  const app = createApp();
  const res = await request(app).post("/api/messages").send({ text: "   " });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, "text is required");
});

test("serves the web UI", async () => {
  const app = createApp();
  const res = await request(app).get("/");
  assert.equal(res.status, 200);
  assert.match(res.text, /erba/);
});
