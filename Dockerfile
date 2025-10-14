# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn set version berry
COPY . .
RUN yarn install
RUN yarn build

# Production stage
FROM caddy:2-alpine AS production
COPY --from=builder /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]