# Deploy public site to the VPS

The API base URL is fixed at **build** time.

**Default (no `.env.production` on the server):** production builds use **`/api`** (same host as the page). Dev uses `http://localhost:9000/api`.

Override only if you need a different API host:

```env
VITE_API_URL=https://api.example.com/api
```

## Nginx must proxy `/api/` and `/uploads/`

If articles/settings never load, confirm your `congonews.news` server block includes `location /api/` → `http://127.0.0.1:9988` (see `nginx-with-prerender.conf` in this repo). Quick check on the VPS:

```bash
curl -sS https://congonews.news/api/health
```

Expect JSON like `{"status":"ok",...}`.

## Optional `.env.production`

Same as the default, explicit:

```env
VITE_API_URL=/api
```

```bash
cp .env.production.example .env.production
npm ci
npm run build
```

## Upload to the server

Nginx `root` for this site: **`/var/www/congonews.news`**

From your PC (replace user/host if needed):

```bash
# Linux / macOS / Git Bash
rsync -avz --delete dist/ root@64.23.169.136:/var/www/congonews.news/

# Or SCP
scp -r dist/* root@64.23.169.136:/var/www/congonews.news/
```

On Windows you can use **WinSCP**, **PuTTY pscp**, or WSL with the commands above.

Full stack checklist: **`congo-back/DEPLOY-VPS.md`**.
