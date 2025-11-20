#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment generation..."

# Define paths
PROJECT_ROOT=$(pwd)
DEPLOY_DIR="$PROJECT_ROOT/deploy/backend"
SOURCE_DIR="$PROJECT_ROOT/OCPP_GATEWAY"

echo "📂 Project Root: $PROJECT_ROOT"
echo "📂 Deploy Dir: $DEPLOY_DIR"
echo "📂 Source Dir: $SOURCE_DIR"

# 1. Clean deploy directory
echo "🧹 Cleaning deploy directory..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# 2. Build OCPP_GATEWAY (Optional: if you want to deploy built artifacts)
# echo "mb Building OCPP_GATEWAY..."
# cd "$SOURCE_DIR"
# npm install
# npm run build
# cd "$PROJECT_ROOT"

# 3. Copy source files
echo "mb Copying source files..."
# Copy package.json and package-lock.json
cp "$SOURCE_DIR/package.json" "$DEPLOY_DIR/"
cp "$SOURCE_DIR/package-lock.json" "$DEPLOY_DIR/"

# Copy source code (excluding node_modules, dist, test, etc.)
# Using rsync for better exclusion handling
rsync -av --progress "$SOURCE_DIR/" "$DEPLOY_DIR/" \
    --exclude node_modules \
    --exclude dist \
    --exclude .git \
    --exclude .gitignore \
    --exclude test \
    --exclude .env \
    --exclude .dockerignore \
    --exclude Dockerfile \
    --exclude docker-compose.yml

# 4. Install production dependencies in deploy directory
echo "mb Installing production dependencies in deploy directory..."
cd "$DEPLOY_DIR"
npm ci --omit=dev

echo "✅ Deployment generation complete!"
echo "📂 Artifacts are in: $DEPLOY_DIR"
