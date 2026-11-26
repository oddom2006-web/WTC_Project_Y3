# ITEA3 EXPRESS — full Docker stack

Runs Next.js + Laravel (Nginx + PHP-FPM in one container) + MySQL with a
single `docker compose up`.

## 1. Assemble the two app folders

This zip only contains the **Docker-specific** files. Merge them into the
projects from parts (a) and (b):

```
domexpress-api/         ← fresh `laravel new` + the scaffold from part (a)
  Dockerfile             (this zip)
  .dockerignore           (this zip)
  .env.docker.example     (this zip)
  config/cors.php         (this zip — overwrite the default one)
  docker/                 (this zip: nginx conf, supervisord conf, entrypoint.sh)

domexpress-next/        ← the Next.js project + the patch from part (b)
  Dockerfile              (this zip)
  .dockerignore           (this zip)
  next.config.js          (this zip — adds `output: 'standalone'`, required for Docker)

docker-compose.yml       (this zip — goes one level up, next to both folders)
```

End state:
```
your-project/
├── docker-compose.yml
├── domexpress-api/
└── domexpress-next/
```

## 2. Configure

```bash
cp domexpress-api/.env.docker.example domexpress-api/.env.docker
```
Edit `domexpress-api/.env.docker` — at minimum change `DB_PASSWORD` to match
whatever you set for `MYSQL_PASSWORD` in `docker-compose.yml` (they default
to matching values, but don't ship real passwords with defaults left in).

## 3. Run it

```bash
docker compose up --build -d
docker compose logs -f api   # watch migrations/seeding happen on first boot
```

- Frontend: **http://localhost:3000**
- API:      **http://localhost:8000/api**
- Reverb (live tracking WebSocket): **ws://localhost:8080**

The API container's `entrypoint.sh` automatically waits for MySQL, generates
`APP_KEY` if missing, runs `php artisan migrate --force`, and seeds the demo
accounts (`RUN_SEEDER=true` in `.env.docker`) on every start. Set
`RUN_SEEDER=false` after the first run if you don't want the seeder
re-running on every container restart (it's idempotent — `firstOrCreate` —
but there's no reason to pay the extra queries once you have real data).

## 4. Rebuilding after code changes

```bash
docker compose up --build -d      # rebuilds both images
docker compose up --build -d web  # just the frontend
docker compose up --build -d api  # just the API
```

## Notes on how this differs from "just Vercel + Laravel Cloud"

- **One container for both Nginx and PHP-FPM** (via supervisord) in the API
  image, rather than two containers sharing a volume — simpler, and avoids a
  classic Docker gotcha where a named volume only auto-populates from the
  image on its *first* use, silently going stale on later code changes.
- **`NEXT_PUBLIC_API_URL` is a build arg, not a runtime env var** — Next.js
  inlines `NEXT_PUBLIC_*` values into the JS bundle at `next build` time, so
  it has to be known when the image is built, not when the container starts.
  If you deploy this to a real server (not localhost), rebuild the `web`
  image with `NEXT_PUBLIC_API_URL` pointed at your real API domain.
- **Live tracking's Reverb key must match on both sides.** `docker-compose.yml`
  hardcodes `NEXT_PUBLIC_REVERB_APP_KEY: domexpress-key` as a `web` build arg
  — if you change `REVERB_APP_KEY` in `domexpress-api/.env.docker`, update
  that build arg to match too (they're not automatically linked; one is a
  server env var, the other gets baked into the frontend at build time), then
  rebuild `web`.
- This compose file is a solid **local/personal-server** setup. For a public
  production deployment you'd still want to put it behind a reverse proxy
  with real TLS (Caddy or Traefik are the easiest to bolt in front of this
  exact compose file) rather than exposing ports 3000/8000 directly.
