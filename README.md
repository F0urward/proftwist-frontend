# React Flow Roadmap

## Prerequisites
- Docker and Docker Compose for running the containerized stack.
- Node.js 18+ and Yarn (the repo pins `yarn@4.10.3` via `package.json`).

## Make commands
- `make docker` — pull the latest `rasulovarsen/react-flow-roadmap:latest` image and start the stack from `docker-compose.yml` in detached mode.
- `make dev` — install dependencies with `yarn` and start the Vite dev server with `yarn dev`.

## Manual equivalents
- Docker: `docker compose pull && docker compose up -d`
- Local dev: `yarn && yarn dev`
