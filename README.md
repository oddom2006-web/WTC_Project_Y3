# ITEA3 EXPRESS — full Docker stack

Runs Next.js + Laravel (Nginx + PHP-FPM in one container) + MySQL with a
single `docker compose up`.

## 1. Assemble the two app folders

```
Backend/         
  Dockerfile             
  .dockerignore           
  .env.docker.example     
  config/cors.php       
  docker/                

Frontend/        
  Dockerfile             
  .dockerignore           
  next.config.js         

docker-compose.yml      
```

End state:
```
your-project/
├── docker-compose.yml
├── Backend/
└── frontend/
```

## 2. Configure

```bash
cp Banckend/.env.docker.example backend/.env.docker
```
Edit `Bacnkend/.env.docker` — at minimum change `DB_PASSWORD` to match
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
