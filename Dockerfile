# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
WORKDIR /app

ARG VITE_BASE44_APP_ID
ARG VITE_BASE44_APP_BASE_URL
ARG VITE_BASE44_FUNCTIONS_VERSION

ENV VITE_BASE44_APP_ID=${VITE_BASE44_APP_ID}
ENV VITE_BASE44_APP_BASE_URL=${VITE_BASE44_APP_BASE_URL}
ENV VITE_BASE44_FUNCTIONS_VERSION=${VITE_BASE44_FUNCTIONS_VERSION}

COPY . .
RUN npm run build

FROM caddy:2-alpine AS runtime

ENV PORT=8080
WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy

EXPOSE 8080

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
