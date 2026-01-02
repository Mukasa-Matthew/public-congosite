# Social Media Preview Setup Guide

## The Problem
Social media crawlers (Facebook, WhatsApp, Twitter, etc.) don't execute JavaScript, so meta tags added via React won't work for them. They need meta tags in the initial HTML response.

## Current Status
- ✅ Meta tags work for users sharing links (JavaScript sets them)
- ❌ Meta tags don't work for crawlers (need server-side solution)

## Solutions

### Option 1: Use Prerender.io (Recommended - Easiest)
1. Sign up at https://prerender.io
2. Add this to your nginx config:
```nginx
# Add before location /uploads/
location /article/ {
    set $prerender 0;
    if ($http_user_agent ~* "googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator") {
        set $prerender 1;
    }
    if ($args ~ "_escaped_fragment_") {
        set $prerender 1;
    }
    if ($http_user_agent ~ "Prerender") {
        set $prerender 0;
    }
    if ($uri ~* "\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|svg|eot)") {
        set $prerender 0;
    }
    
    if ($prerender = 1) {
        rewrite .* /$scheme://$host$request_uri? break;
        proxy_pass http://service.prerender.io;
    }
    
    try_files $uri /index.html;
}
```

### Option 2: Server-Side Meta Tag Injection (Advanced)
Use nginx with http_sub_module to inject meta tags fetched from the backend API.

### Option 3: Pre-rendering Service
Set up a Node.js service that pre-renders pages with meta tags before serving.

## Testing Your Meta Tags

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Enter your article URL
   - Click "Scrape Again" to refresh cache

2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Enter your article URL
   - Check preview

3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
   - Enter your article URL

4. **WhatsApp**: Share a link and check the preview

## Important Notes
- Social media platforms cache meta tags. After fixing, you may need to clear their cache
- Images must be publicly accessible via HTTPS
- Image dimensions should be at least 1200x630px for best results
- Meta tags must be in the initial HTML (not added via JavaScript) for crawlers



