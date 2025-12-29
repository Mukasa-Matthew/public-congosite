#!/bin/bash

# Deployment script for congonews.news
# Run this on your VPS: bash deploy-to-server.sh

set -e

echo "🚀 Starting deployment for congonews.news..."

# Navigate to home directory
cd /root

# Clone or update the repository
if [ -d "public-congosite" ]; then
    echo "📦 Updating existing repository..."
    cd public-congosite
    git pull origin main
else
    echo "📦 Cloning repository..."
    git clone https://github.com/Mukasa-Matthew/public-congosite.git
    cd public-congosite
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Create nginx config directory if it doesn't exist
echo "⚙️ Setting up nginx configuration..."
sudo cp nginx-production.conf /etc/nginx/sites-available/congonews.news

# Enable the site
if [ ! -L /etc/nginx/sites-enabled/congonews.news ]; then
    sudo ln -s /etc/nginx/sites-available/congonews.news /etc/nginx/sites-enabled/
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

# If SSL certificate doesn't exist, set it up
if [ ! -f /etc/letsencrypt/live/congonews.news/fullchain.pem ]; then
    echo "🔒 Setting up SSL certificate..."
    sudo certbot --nginx -d congonews.news -d www.congonews.news --non-interactive --agree-tos --email your-email@example.com
else
    echo "🔒 SSL certificate already exists. Reloading nginx..."
    sudo systemctl reload nginx
fi

echo "✅ Deployment complete!"
echo "🌐 Your site should be live at: https://congonews.news"
echo ""
echo "📝 Note: Make sure your DNS is pointing to this server's IP address"

