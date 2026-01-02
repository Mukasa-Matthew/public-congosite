# Troubleshooting Social Media Image Previews

If image previews are not showing on WhatsApp, Facebook, Twitter, etc., follow these steps:

## Step 1: Verify Backend Prerender Route is Working

**Test the backend prerender endpoint directly:**

```bash
# On your VPS, test if the backend prerender route works
curl http://127.0.0.1:9988/prerender/article/9

# You should see HTML with <meta property="og:image"> tags
# If this doesn't work, the backend needs to be updated
```

**If the backend endpoint doesn't work:**
1. Make sure you've copied `src/controllers/prerender.ts` and `src/routes/prerender.ts` to your backend
2. Make sure `src/index.ts` has: `app.use('/prerender', prerenderRoutes);`
3. Rebuild and restart: `npm run build && pm2 restart congo-back`

## Step 2: Test Nginx Prerender Proxy

**Test if nginx can proxy to the backend:**

```bash
# Test as a crawler (should return HTML with meta tags)
curl -A "WhatsApp/2.0" https://congonews.news/article/9

# You should see HTML with meta tags, NOT the React app
# If you see React app HTML, nginx isn't detecting the crawler
```

## Step 3: Check Image URLs

**Verify images are accessible:**

```bash
# Test if an article image is accessible
curl -I https://congonews.news/uploads/IMAGE_NAME.jpg

# Should return 200 OK, not 404
# If 404, check nginx /uploads/ proxy configuration
```

**Common issues:**
- Image URLs in database might be `http://IP:PORT` instead of `https://congonews.news`
- Backend URL transformer should fix this, but verify it's working

## Step 4: Fix Nginx Configuration

**The current nginx config has limitations with `if` blocks. Use this simpler approach:**

### Option A: Simple Direct Proxy (Recommended)

Edit `/etc/nginx/sites-available/congonews.news` and replace the article location block with:

```nginx
# Prerender for social media crawlers - article pages
location ~ ^/article/([0-9]+)$ {
    # Check user agent and proxy directly
    set $prerender 0;
    if ($http_user_agent ~* "facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp") {
        set $prerender 1;
    }
    if ($args ~ "_escaped_fragment_") {
        set $prerender 1;
    }
    
    # Use error_page trick to proxy without if block limitations
    error_page 418 = @prerender;
    if ($prerender = 1) {
        return 418;
    }
    
    # Regular users get the SPA
    try_files $uri /index.html;
}

# Named location for prerender (no if block limitations)
location @prerender {
    proxy_pass http://127.0.0.1:9988/prerender/article/$1;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header User-Agent $http_user_agent;
    proxy_redirect off;
}
```

**Wait, this won't work because we can't capture $1 in named location. Let me provide a better solution:**

### Option B: Use Map Directive (Best Solution)

1. **Edit main nginx config:**
```bash
sudo nano /etc/nginx/nginx.conf
```

2. **Add this map inside the `http {}` block (before any `server {}` blocks):**
```nginx
http {
    # Map to detect crawlers
    map $http_user_agent $is_crawler {
        default 0;
        ~*facebookexternalhit 1;
        ~*Facebot 1;
        ~*Twitterbot 1;
        ~*LinkedInBot 1;
        ~*WhatsApp 1;
        ~*Googlebot 1;
        ~*bingbot 1;
        ~*yandex 1;
        ~*baiduspider 1;
        ~*rogerbot 1;
        ~*embedly 1;
        ~*quora 1;
        ~*showyoubot 1;
        ~*outbrain 1;
        ~*pinterest 1;
        ~*slackbot 1;
        ~*vkShare 1;
        ~*W3C_Validator 1;
        ~*developers\.google\.com/\+/web/snippet 1;
        ~*Applebot 1;
        ~*Slurp 1;
        ~*DuckDuckBot 1;
        ~*Baiduspider 1;
        ~*YandexBot 1;
        ~*Sogou 1;
        ~*Exabot 1;
        ~*facebot 1;
        ~*ia_archiver 1;
    }
    
    # ... rest of config
}
```

3. **Then in your site config, use:**
```nginx
location ~ ^/article/([0-9]+)$ {
    if ($is_crawler = 1) {
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

**Note:** Even with map, `proxy_pass` inside `if` might not work in some nginx versions.

### Option C: Simplest - Always Proxy Article Pages to Backend First

**Make the backend handle both crawlers and regular users:**

```nginx
location ~ ^/article/([0-9]+)$ {
    # Always proxy to backend, let backend decide what to serve
    proxy_pass http://127.0.0.1:9988/prerender/article/$1;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header User-Agent $http_user_agent;
    proxy_redirect off;
}
```

**Then modify the backend to:**
- If crawler: return HTML with meta tags
- If regular user: return redirect to frontend or serve React app

## Step 5: Test with Social Media Debuggers

After fixing, test with:
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

**Important:** Clear cache on these tools after making changes!

## Step 6: Verify Image URLs in Database

**Check if article images have correct URLs:**

```sql
SELECT id, title, featured_image FROM articles WHERE id = 9;
```

**Image URLs should be:**
- ✅ `https://congonews.news/uploads/image.jpg`
- ❌ `http://IP:PORT/uploads/image.jpg`
- ❌ `/uploads/image.jpg` (relative)

**If wrong, the URL transformer in backend should fix this, but verify it's being called.**

## Quick Test Script

Run this on your VPS to test everything:

```bash
#!/bin/bash
echo "1. Testing backend prerender endpoint..."
curl -s http://127.0.0.1:9988/prerender/article/9 | grep -o 'og:image' | head -1
echo ""

echo "2. Testing nginx proxy as WhatsApp crawler..."
curl -s -A "WhatsApp/2.0" https://congonews.news/article/9 | grep -o 'og:image' | head -1
echo ""

echo "3. Testing image accessibility..."
IMAGE_URL=$(curl -s http://127.0.0.1:9988/prerender/article/9 | grep -o 'og:image[^>]*content="[^"]*"' | grep -o 'content="[^"]*"' | cut -d'"' -f2)
if [ ! -z "$IMAGE_URL" ]; then
    echo "Image URL: $IMAGE_URL"
    curl -I "$IMAGE_URL" 2>&1 | head -1
fi
```

Save as `test-previews.sh`, make executable (`chmod +x test-previews.sh`), and run it.



