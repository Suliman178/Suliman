# AI App Builder

A full-stack MVP for a simplified Replit Agent + ChatGPT AI App Builder. The primary runtime is React + TypeScript + Vite on the frontend and Express + TypeScript on the backend, with Drizzle/PostgreSQL persistence when `DATABASE_URL` is configured.

## What is included

- React + TypeScript + Vite frontend with dashboard, builder workspace, chat, file explorer, plain textarea code editor, tabs, and live iframe preview.
- Express + TypeScript API server with auth, projects, files, AI, and usage routes.
- Email/password auth using bcrypt password hashing and HTTP-only session cookies.
- PostgreSQL persistence through Drizzle ORM for users, projects, project files, chat messages, and AI usage.
- Memory fallback when `DATABASE_URL` is not present so the app can still be evaluated locally.
- AI Router architecture with OpenAI as the implemented provider and clean provider modules for Anthropic/Gemini expansion.
- Strict AI JSON parsing/validation and safe file path validation before generated files are saved.
- Legacy dependency-free fallback retained as `npm run fallback:dev` for restricted environments only; it is no longer the primary runtime.

## Install

```bash
npm install
```

If your environment blocks `registry.npmjs.org` with HTTP 403, this is a network/proxy restriction rather than an app error. In Replit or locally, use a normal npm registry connection (`npm config set registry https://registry.npmjs.org/`) and rerun `npm install`. The app now depends on the real React/Express/Drizzle stack.

## Database

Create a PostgreSQL database and set:

```bash
export DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
```

Run migrations:

```bash
npm run db:migrate
```

The initial migration is in `drizzle/0000_initial_ai_app_builder.sql` and creates:

- `users`
- `projects`
- `project_files`
- `chat_messages`
- `ai_usage`

If `DATABASE_URL` is omitted, the backend uses an in-memory fallback for local testing only. Refreshing while the server is still running keeps data in memory; restarting the server clears it. Use PostgreSQL for durable persistence.

## AI and session secrets

```bash
export OPENAI_API_KEY="sk-..."
export SESSION_SECRET="replace-with-a-long-random-secret"
```

- `OPENAI_API_KEY` enables real OpenAI generation. If missing, AI routes return a clear setup error instead of crashing.
- `SESSION_SECRET` is strongly recommended for stable signed sessions.

## Run the full-stack app

```bash
npm run dev
```

- Vite frontend: `http://localhost:5173`
- Express API: `http://localhost:3001`

For production:

```bash
npm run build
npm start
```

## End-to-end test checklist

1. Run `npm install`.
2. Run `npm run db:migrate` with `DATABASE_URL` set, or intentionally use memory fallback for local-only testing.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.
5. Register or log in.
6. Create a project.
7. In the builder chat, send: `Create a modern habit tracker with daily habits, streak counter, add habit form, delete habit button, and clean green design.`
8. Confirm generated files appear in the file explorer.
9. Click `index.html`, `style.css`, or `script.js` and confirm the editor opens the file.
10. Edit code and confirm autosave status changes, then returns to saved.
11. Confirm the live preview updates.
12. Ask: `Make the design better.`
13. Refresh the browser and reopen the project; with PostgreSQL configured, saved data should persist.

## Notes

The dependency-free `server.mjs` + `public/` runtime remains for environments where package installation is blocked, but the primary app is now the real TypeScript full-stack architecture under `client/`, `server/src/`, and `shared/`.
