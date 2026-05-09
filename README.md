# AI App Builder

A full-stack MVP for building and editing small AI-generated web apps. It includes email/password authentication, project persistence, a file explorer, Monaco code editor, live iframe preview, chat-driven AI generation, usage tracking, and an extensible AI provider/router architecture.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Editor: Monaco Editor through `@monaco-editor/react`
- Persistence: PostgreSQL when `DATABASE_URL` is configured; JSON file fallback at `data/storage.json` for local development
- Database schema: Drizzle ORM schema for PostgreSQL tables
- Auth: secure email/password auth with bcrypt hashes and `express-session` HTTP-only session cookies
- AI: OpenAI provider using `OPENAI_API_KEY`; Anthropic and Gemini provider shells are ready for future implementation

## Environment secrets

Create a `.env` file or Replit Secrets with:

```bash
OPENAI_API_KEY=your_openai_key       # optional; without it a local fallback project is generated
DATABASE_URL=postgres://...          # optional; enables PostgreSQL persistence
SESSION_SECRET=replace-with-long-secret
CLIENT_ORIGIN=http://localhost:5173  # dev default
PORT=3000                            # API default
```

Optional future provider keys:

```bash
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

For validation and production build:

```bash
npm run typecheck
npm run build
npm start
```

## Full AI generation test flow

1. Register or sign in.
2. Create a project from **My Projects** or open `/builder/new`.
3. In the builder chat, send: `Create a modern habit tracker with daily habits, streak counter, add habit form, delete habit button, and clean green design.`
4. Confirm generated files appear in the file explorer.
5. Open `index.html`, `style.css`, or `script.js` and edit code.
6. Confirm the live preview updates after edits.
7. Send `Make the design better.`
8. Refresh the browser and reopen the project from **My Projects** to confirm persistence. With `DATABASE_URL` configured, this persists in PostgreSQL; otherwise it persists in `data/storage.json`.

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId`
- `GET /api/projects/:projectId/files`
- `POST /api/projects/:projectId/files`
- `PATCH /api/projects/:projectId/files`
- `DELETE /api/projects/:projectId/files`
- `POST /api/ai/generate-project`
- `POST /api/ai/modify-project`
- `POST /api/ai/review-project`
- `POST /api/ai/fix-project`
- `POST /api/ai/improve-design`
- `GET /api/usage`
