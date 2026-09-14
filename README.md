# erba

A small [Express](https://expressjs.com/) message-board app used to bootstrap and
demonstrate the erba development environment.

## Requirements

- Node.js >= 20 (developed on Node 22)

## Getting started

```bash
npm install      # install dependencies
npm start        # run the server on http://localhost:3000
npm run dev      # run with auto-reload (node --watch)
```

Then open http://localhost:3000 to use the message board.

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `npm start`    | Start the HTTP server                |
| `npm run dev`  | Start with file watching             |
| `npm test`     | Run the test suite (`node --test`)   |
| `npm run lint` | Lint the codebase with ESLint        |

## API

| Method | Path            | Description                    |
| ------ | --------------- | ------------------------------ |
| GET    | `/api/health`   | Health check                   |
| GET    | `/api/messages` | List messages                  |
| POST   | `/api/messages` | Create a message (`{ text }`)  |

## Project layout

```
src/app.js       Express app factory (routes + static hosting)
src/server.js    Entry point that starts the HTTP listener
public/          Static web UI (HTML/CSS/JS)
test/            node:test + supertest tests
```

## Cloud Agent environment

`.cursor/environment.json` configures the Cursor Cloud Agent environment: it runs
`npm install` on setup and launches the dev server in a persistent terminal.
