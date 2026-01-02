# Custom Social Media Preview Setup

This setup enables WhatsApp, Facebook, Twitter, and other social media platforms to show article previews with images when links are shared.

## How It Works

1. **Social media crawlers** (WhatsApp, Facebook, etc.) are detected by nginx
2. **Crawlers are routed** to a backend endpoint that serves pre-rendered HTML with meta tags
3. **Regular users** get the normal React SPA experience
4. **Meta tags include** article title, description, and featured image

## Setup Instructions

### 1. Update Backend Code

On your VPS, update the backend with the new prerender endpoint:

```bash
cd /root/congo-back  # or wherever your backend is
git pull  # if using git, or copy the new files manually

# Copy the new files:
# - src/controllers/prerender.ts
# - src/routes/prerender.ts
# Update src/index.ts to include the prerender route

# Rebuild
npm run build

# Restart backend
pm2 restart congo-back
```

### 2. Update Nginx Configuration

```bash
    sudo nano /etc/nginx/sites-available/congonews.news
```

**Replace the entire file with the contents from `nginx-complete.conf`**

Or manually add this section BEFORE `location /uploads/`:

```nginx
    # Detect social media crawlers and bots
    set $prerender 0;
    if ($http_user_agent ~* "facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Googlebot|bingbot|yandex|baiduspider|rogerbot|embedly|quora|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator|developers\.google\.com/\+/web/snippet|Applebot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebot|ia_archiver") {
        set $prerender 1;
    }
    if ($args ~ "_escaped_fragment_") {
        set $prerender 1;
    }
    if ($http_user_agent ~ "Prerender") {
        set $prerender 0;
    }

    # Prerender for social media crawlers - article pages
    location ~ ^/article/([0-9]+)$ {
        if ($prerender = 1) {
            proxy_pass http://127.0.0.1:9988/prerender/article/$1;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header User-Agent $http_user_agent;
            proxy_redirect off;
            break;
        }
        try_files $uri /index.html;
    }
```

**Important:** The `location ~ ^/article/([0-9]+)$` block must come AFTER `/uploads/` and `/api/` but BEFORE `location /`

### 3. Test and Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Test the Prerender Endpoint

```bash
# Test as a crawler (should return HTML with meta tags)
curl -A "WhatsApp/2.0" https://congonews.news/article/9

# Test as regular user (should return normal page)
curl https://congonews.news/article/9
```

### 5. Test Social Media Previews

- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator  
- **LinkedIn**: https://www.linkedin.com/post-inspector/
- **WhatsApp**: Share a link and check the preview

## Troubleshooting

**If previews don't show:**
1. Clear the cache on the social media platform's debugger tool
2. Verify the prerender endpoint works: `curl -A "WhatsApp/2.0" https://congonews.news/article/9`
3. Check backend logs: `pm2 logs congo-back`
4. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
5. Verify images are accessible: `curl -I https://congonews.news/uploads/YOUR_IMAGE.jpg`

**If nginx gives errors:**
- Make sure the `location ~ ^/article/([0-9]+)$` block is in the correct order
- Check that the backend is running on port 9988
- Verify the prerender route is registered in the backend

## What Gets Served

- **Crawlers** (WhatsApp, Facebook, etc.): Pre-rendered HTML with meta tags
- **Regular users**: Normal React SPA (JavaScript executes, meta tags updated)

This ensures social media platforms see the meta tags immediately, while users get the full interactive experience.



