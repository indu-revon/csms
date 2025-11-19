#!/bin/bash

# Database migration script for REVON CMS

echo "=== REVON CMS Database Migration ==="

# Navigate to OCPP_GATEWAY directory
cd OCPP_GATEWAY

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migration
echo "Running database migration..."
npx prisma migrate dev --name add_station_model_and_hardware_info

echo "Database migration completed!"

# Go back to root directory
cd ..