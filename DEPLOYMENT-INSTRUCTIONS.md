# Deployment Instructions for congonews.news

## Quick Deploy (All-in-One)

SSH into your VPS and run:

```bash
cd /root
git clone https://github.com/Mukasa-Matthew/public-congosite.git
cd public-congosite
chmod +x deploy-to-server.sh
bash deploy-to-server.sh
```

**Note:** Before running the script, edit it and replace `your-email@example.com` with your actual email for SSL certificate.

## Manual Step-by-Step Deployment

### 1. SSH into your VPS
```bash
ssh root@64.23.169.136
```

### 2. Clone the repository
```bash
cd /root
git clone https://github.com/Mukasa-Matthew/public-congosite.git
cd public-congosite
```

### 3. Install dependencies
```bash
npm install
```

### 4. Build the project
```bash
npm run build
```

### 5. Set up nginx configuration
```bash
sudo cp nginx-production.conf /etc/nginx/sites-available/congonews.news
sudo ln -s /etc/nginx/sites-available/congonews.news /etc/nginx/sites-enabled/
sudo nginx -t
```

### 6. Set up SSL certificate (if not already done)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d congonews.news -d www.congonews.news
```

### 7. Reload nginx
```bash
sudo systemctl reload nginx
```

## Updating the Site

When you make changes and push to GitHub:

```bash
cd /root/public-congosite
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```

## Verify Deployment

1. Check nginx status: `sudo systemctl status nginx`
2. Check SSL certificate: `sudo certbot certificates`
3. Visit: https://congonews.news

## Troubleshooting

- **Nginx errors**: Check logs with `sudo tail -f /var/log/nginx/error.log`
- **Build errors**: Make sure Node.js and npm are installed: `node --version && npm --version`
- **SSL issues**: Renew certificate with `sudo certbot renew`

