# REVON CSMS Startup Guide

This guide explains how to start the REVON Charging Station Management System (CSMS) v3.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL database (configured)

## Quick Start

### Recommended: Using npm scripts (Cross-Platform)

**First time setup:**
```bash
# Install all dependencies
npm install

# Run database migrations
npm run migrate
```

**Development mode** (with hot-reload):
```bash
npm run dev
```

**Production mode** (after building):
```bash
# Build both applications
npm run build

# Run in production mode
npm run prod
```

This will:
1. Clean up any existing processes on ports 3000-3007
2. Start OCPP_GATEWAY on port 3000
3. Start CPANEL on port 3003
4. Display colored output for both services

Press `Ctrl+C` to stop both services gracefully.

### Using PM2 (Recommended for Production Servers)

```bash
# Start services with PM2
npm run pm2:start

# View logs
npm run pm2:logs

# Monitor processes
npm run pm2:monit

# Restart services
npm run pm2:restart

# Stop services
npm run pm2:stop
```

### Legacy: Using shell scripts (Linux/Mac only)

**Development:**
```bash
./startup.sh
```

- **Batch File**: Close the terminal windows
- **Manual Start**: Press Ctrl+C in each terminal window