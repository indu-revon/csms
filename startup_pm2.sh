#!/bin/bash

# PM2 Startup Script for REVON Charging Management System
# This script starts both OCPP_GATEWAY and CPANEL using PM2 for persistent operation

echo "Starting REVON CMS with PM2..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2 globally..."
    sudo npm install -g pm2
    
    if [ $? -ne 0 ]; then
        echo "Failed to install PM2. Please run: sudo npm install -g pm2"
        exit 1
    fi
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop any existing PM2 processes for this project
echo "Stopping existing PM2 processes..."
pm2 delete ecosystem.config.js 2>/dev/null || true

# Start services using PM2
echo "Starting services with PM2..."
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Display status
echo ""
echo "Services started with PM2!"
echo ""
pm2 status

echo ""
echo "Useful PM2 commands:"
echo "  pm2 status          - View status of all processes"
echo "  pm2 logs            - View logs from all processes"
echo "  pm2 logs ocpp-gateway - View logs from OCPP Gateway"
echo "  pm2 logs cpanel     - View logs from CPANEL"
echo "  pm2 restart all     - Restart all processes"
echo "  pm2 stop all        - Stop all processes"
echo "  pm2 delete all      - Delete all processes from PM2"
echo ""
echo "To make PM2 start on system boot, run:"
echo "  pm2 startup"
echo "  (follow the instructions it provides)"
