# REVON CMS Deployment Guide

This guide describes how to deploy the REVON CMS application on an Apache server.

## Prerequisites

- Apache HTTP Server
- Node.js (v18+)
- PM2 (Process Manager for Node.js)
- PostgreSQL (Database)

## 1. Frontend Deployment

1. Copy the contents of `deploy/frontend` to your Apache document root (e.g., `/var/www/html/revon-cms`).
2. Ensure the `.htaccess` file is also copied to the document root.
3. Enable `mod_rewrite` in Apache:
   ```bash
   sudo a2enmod rewrite
   ```

## 2. Backend Deployment

1. Copy the contents of `deploy/backend` to a directory on your server (e.g., `/var/www/revon-backend`).
2. Navigate to the backend directory and install production dependencies:
   ```bash
   cd /var/www/revon-backend
   npm install --production
   ```
3. Configure the environment variables:
   - Copy `.env.example` to `.env` (if available) or create a new `.env` file.
   - Set the `DATABASE_URL` and other necessary variables.
4. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Start the backend server using PM2:
   ```bash
   pm2 start dist/main.js --name ocpp-gateway
   ```

## 3. Apache Configuration

1. Copy the sample configuration file `deploy/apache/revon-cms.conf` to your Apache sites-available directory (e.g., `/etc/apache2/sites-available/`).
2. Edit the file to match your domain name and paths.
3. Enable the site and proxy modules:
   ```bash
   sudo a2enmod proxy proxy_http
   sudo a2ensite revon-cms.conf
   sudo systemctl restart apache2
   ```

## Verification

- Access your domain in a browser. The React application should load.
- API requests to `/api` should be proxied to the backend running on port 3000.
