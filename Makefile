COMPOSE ?= docker compose

.PHONY: docker dev

# Pull the latest container image and start the stack in detached mode
docker:
	$(COMPOSE) pull
	$(COMPOSE) up -d

# Install dependencies and launch the Vite dev server
dev:
	yarn
	yarn dev
