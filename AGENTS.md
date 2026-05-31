# AGENTS.md

## Project Overview

React Flow Roadmap — a React frontend for visualizing/authoring roadmaps using React Flow. The app proxies `/api` to a backend on port 8998 and `/avatar` to port 9000 in dev. Production is served via nginx in Docker with TLS.

## Tech Stack

- **Framework:** React 19 + TypeScript 6
- **Bundler:** Vite 8 (`@vitejs/plugin-react-swc`)
- **UI Library:** MUI (Material UI) v7 (`@mui/material`, `@mui/icons-material`)
- **Flow/Graph:** React Flow (`@xyflow/react`) + dagre for layout
- **State:** Redux Toolkit + React Redux
- **Routing:** React Router DOM v7
- **Forms:** React Hook Form + Zod v4 validation
- **HTTP:** Axios
- **Linting:** ESLint 10 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`
- **Package Manager:** pnpm (lockfile: `pnpm-lock.yaml`)

## Development Commands

```bash
pnpm install          # install dependencies
pnpm dev              # start Vite dev server on port 3000
pnpm build            # production build (vite build)
pnpm lint             # run ESLint
pnpm preview          # preview production build locally
```

## Project Structure

```
src/
├── api/            # API client functions (Axios)
├── components/     # Reusable UI components
├── config/         # App configuration (includes AI system prompt)
├── hooks/          # Custom React hooks
├── pages/          # Route-level page components
├── store/          # Redux store and slices
├── types/          # TypeScript type definitions
├── utils/          # Utility/helper functions
├── consts.ts       # Constants
├── types.ts        # Top-level types
├── theme.ts        # MUI theme configuration
├── router.tsx      # React Router route definitions
├── App.tsx         # Root app component
└── main.tsx        # Entry point
```

## Code Conventions

- **TypeScript strict mode** is enabled — no implicit any, strict null checks.
- **ESLint** enforces `no-unused-vars` with pattern `^[A-Z_]*` ignored (useful for type-only imports).
- Prefer **named exports** over default exports.
- Use **Zod** schemas for form validation via `@hookform/resolvers`.
- Use **MUI components** for UI consistency; follow existing component patterns in `src/components/`.
- Path aliases: not configured — use relative imports.
- Vite dev server proxies `/api` to `localhost:8998/api/v1` and `/ws` to `ws://localhost:8998/api/v1/chats/ws`.

## Docker / Production

- `docker compose up -d --build` builds and starts the nginx-based container.
- TLS certs expected at `./certs/prof-twist.ru/fullchain.pem` and `./certs/prof-twist.ru/privkey.pem`.
- Use `make docker` to pull the latest image and start the stack.
- Use `make dev` for local development (runs `pnpm install && pnpm dev`).

## Before Submitting Changes

1. Run `pnpm lint` and fix all errors.
2. Run `pnpm build` to verify the production build succeeds.
