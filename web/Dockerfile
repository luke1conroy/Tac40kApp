# Install/build frontend dependencies in Linux (not on the host Windows machine).
FROM node:22-alpine AS build
WORKDIR /app

COPY web/package.json ./
RUN npm install --no-audit --no-fund
COPY web/ ./
RUN npm run build

# Serve static assets and proxy same-origin API calls to the Compose service.
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

LABEL org.opencontainers.image.source="https://github.com/luke1conroy/Tac40kApp"
LABEL org.opencontainers.image.description="Combat Probability Lab React frontend"
EXPOSE 8080
