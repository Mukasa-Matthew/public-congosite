# Deploy public site to the VPS

The API base URL is fixed at **build** time. Set `.env.production` before `npm run build`.

## Recommended (`congonews.news` + Nginx `/api` → Node)

Use a **relative** API path so **www** and **apex** both work:

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
