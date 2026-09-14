import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 3000;
const app = createApp({
  messages: [
    { id: 1, text: "Welcome to erba!", createdAt: new Date().toISOString() },
  ],
});

app.listen(port, () => {
  console.log(`erba listening on http://localhost:${port}`);
});
