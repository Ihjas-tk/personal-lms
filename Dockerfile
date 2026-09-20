# learn — self-hosted study tracker. Two stages: build the web bundle, then a slim Python image.
#
#   docker compose run --rm learn learn init --track /app/tracks/starter/track.yaml
#   docker compose up
#
# The vault (your Markdown + YAML) is a bind mount; the image holds only the app and the tracks.

FROM node:22-alpine AS web
WORKDIR /app/web
COPY learn/web/package.json learn/web/package-lock.json ./
RUN npm ci
COPY learn/web/ ./
RUN npm run build          # → /app/src/learn/static (vite.config outDir)

FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:0.12 /uv /usr/local/bin/uv
WORKDIR /app
COPY learn/pyproject.toml learn/uv.lock learn/README.md ./
RUN uv sync --frozen --no-dev --no-install-project
COPY learn/src ./src
COPY learn/curriculum ./curriculum
COPY --from=web /app/src/learn/static ./src/learn/static
COPY tracks ./tracks
RUN uv sync --frozen --no-dev
ENV PATH="/app/.venv/bin:$PATH" \
    LEARN_VAULT=/vault \
    LEARN_CURRICULUM=/vault/track.yaml \
    LEARN_HOST=0.0.0.0 \
    LEARN_PORT=8765 \
    BROWSER=none
VOLUME ["/vault"]
EXPOSE 8765
CMD ["learn", "--no-browser"]
