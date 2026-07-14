# Backyard

A member directory web app. People join with a passwordless magic link, build a profile — education, work experience, organizations, an avatar, and a resume — and browse everyone else in a searchable directory.

## How it works

1. **Sign up or sign in** with just your email — [Stytch](https://stytch.com) sends you a magic link (no passwords).
2. **Click the link** to verify, and a session cookie keeps you signed in.
3. **Create your profile** — name, class and house, education, work experience, organizations, plus an avatar and resume.
4. **Browse the directory** to search and view other members' profiles.

## Repository layout

This is a [Turborepo](https://turborepo.com) monorepo managed with [pnpm](https://pnpm.io):

| Path | What it is |
| --- | --- |
| `apps/next-js-app` | The web app — Next.js 15, React 19, Tailwind CSS v4, shadcn/ui components, TanStack Query. Runs on **port 3000**. |
| `apps/express-js-app` | The REST API — Express + TypeScript. Handles auth, profiles, and file uploads. Runs on **port 3001**. |
| `packages/database` | Shared Mongoose models (`User`, `Profile`, `Session`) and the MongoDB connection helper, used by both apps. |

External services it talks to:

- **MongoDB** (e.g. Atlas) — stores users, profiles, and sessions
- **Stytch** — sends and verifies magic-link emails
- **Cloudflare R2** — stores uploaded avatars and resumes
- **Logo.dev** — company search and logos for the work-experience section (optional)

## Getting started

### 1. Prerequisites

- Node.js 18+
- pnpm 9 (`npm install -g pnpm@9`)
- A MongoDB connection string, a Stytch project, and a Cloudflare R2 bucket (Logo.dev keys are optional)

### 2. Install dependencies

```sh
pnpm install
```

### 3. Set environment variables

Create `apps/express-js-app/.env`:

```sh
# Server
PORT=3001
FRONTEND_URL=http://localhost:3000   # comma-separated list of allowed CORS origins

# MongoDB
MONGODB_CONNECTION_STRING=mongodb+srv://...

# Stytch (magic-link auth)
STYTCH_PROJECT_ID=project-test-...
STYTCH_SECRET_TOKEN=secret-test-...

# Cloudflare R2 (avatar & resume storage)
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
CLOUDFLARE_BUCKET_NAME=...
CLOUDFLARE_PUBLIC_URL=https://...

# Logo.dev (optional — company search & logos)
LOGODEV_SECRET_KEY=...
LOGODEV_PUBLISHABLE_KEY=...
```

Optionally create `apps/next-js-app/.env.local` (defaults to `http://localhost:3001` if omitted):

```sh
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 4. Run it

```sh
pnpm build --filter=@repo/database   # one-time: build the shared database package
pnpm dev                             # start the web app and the API together
```

Then open [http://localhost:3000](http://localhost:3000). The API health check is at [http://localhost:3001/api/health](http://localhost:3001/api/health).

## Everyday commands

Run these from the repo root:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start everything in watch mode |
| `pnpm dev --filter=next-js-app` | Start only the web app |
| `pnpm dev --filter=express-js-api` | Start only the API |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint the codebase |
| `pnpm check-types` | Type-check the codebase |
| `pnpm format` | Format files with Prettier |

## API at a glance

All routes are served by the Express app under `/api`. Auth uses a session cookie set after magic-link verification.

| Endpoint | What it does |
| --- | --- |
| `POST /api/users/sign-up` | Create a user and email them a magic link |
| `POST /api/users/sign-in` | Email a magic link to an existing user |
| `POST /api/users/verify-magic-link` | Verify the link and start a session |
| `GET /api/users/get-user` | Get the signed-in user and session |
| `POST /api/users/sign-out` | End the current session |
| `GET /api/profiles` | List all profiles (powers the directory) |
| `GET /api/profiles/me` | Get your own profile |
| `POST /api/profiles` | Create your profile (multipart — supports avatar and resume files) |
| `PUT /api/profiles` | Update your profile |
| `DELETE /api/profiles` | Delete your profile |
| `GET /api/companies/search?query=...` | Search companies by name via Logo.dev |
| `GET /api/companies/:domain/logo` | Get a company's logo URL |
| `GET /api/health` | Health check |

## Web app pages

- `/` — redirects to the directory if signed in, otherwise to sign-in
- `/sign-up`, `/sign-in`, `/verify-magic-link` — the magic-link auth flow
- `/directory` — browse and search member profiles
- `/profile` — create and edit your own profile
