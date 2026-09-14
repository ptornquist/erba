import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Build an Express app instance.
 *
 * The message store is kept in-memory and passed in so that tests can start
 * from a known state without touching a shared global.
 */
export function createApp({ messages = [] } = {}) {
  const app = express();
  app.use(express.json());

  const store = [...messages];
  let nextId = store.reduce((max, m) => Math.max(max, m.id), 0) + 1;

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.get("/api/messages", (_req, res) => {
    res.json(store);
  });

  app.post("/api/messages", (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) {
      res.status(400).json({ error: "text is required" });
      return;
    }
    const message = { id: nextId++, text, createdAt: new Date().toISOString() };
    store.push(message);
    res.status(201).json(message);
  });

  app.use(express.static(join(__dirname, "..", "public")));

  return app;
}
