# VPS Deployment Guide

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- Domain name (optional but recommended)

## Step 1: Server Setup

### Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install Python
```bash
sudo apt install -y python3.9 python3.9-venv python3-pip
```

### Install Nginx
```bash
sudo apt install -y nginx
```

## Step 2: Deploy Backend

### Clone repository
```bash
cd /var/www
sudo git clone <your-repo-url> f1-view
cd f1-view/backend
```

### Setup Python environment
```bash
python3.9 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Create systemd service
```bash
sudo nano /etc/systemd/system/f1-backend.service
```

Add:
```ini
[Unit]
Description=F1 View Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/f1-view/backend
Environment="PATH=/var/www/f1-view/backend/.venv/bin"
ExecStart=/var/www/f1-view/backend/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

### Start service
```bash
sudo systemctl daemon-reload
sudo systemctl enable f1-backend
sudo systemctl start f1-backend
```

## Step 3: Deploy Frontend

### Build frontend
```bash
cd /var/www/f1-view
npm install
npm run build
```

### Create systemd service
```bash
sudo nano /etc/systemd/system/f1-frontend.service
```

Add:
```ini
[Unit]
Description=F1 View Frontend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/f1-view
Environment="NODE_ENV=production"
Environment="NEXT_PUBLIC_API_URL=http://your-domain.com/api"
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

### Start service
```bash
sudo systemctl daemon-reload
sudo systemctl enable f1-frontend
sudo systemctl start f1-frontend
```

## Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/f1-view
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Enable site
```bash
sudo ln -s /etc/nginx/sites-available/f1-view /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 5: SSL with Let's Encrypt (Optional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Maintenance

### View logs
```bash
# Backend
sudo journalctl -u f1-backend -f

# Frontend
sudo journalctl -u f1-frontend -f

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Restart services
```bash
sudo systemctl restart f1-backend
sudo systemctl restart f1-frontend
sudo systemctl restart nginx
```

### Update application
```bash
cd /var/www/f1-view
git pull
npm install
npm run build
sudo systemctl restart f1-frontend
sudo systemctl restart f1-backend
```
