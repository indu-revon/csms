# REVON CMS Startup Guide

This guide explains how to start the REVON Charging Management System with the backend (OCPP_GATEWAY) running on port 3000 and the frontend (CPANEL) running on port 3003.

## Prerequisites

1. Node.js 18+ installed
2. npm or yarn package manager
3. Both OCPP_GATEWAY and CPANEL dependencies installed:
   ```
   cd OCPP_GATEWAY && npm install
   cd ../CPANEL && npm install
   ```

## Starting the System

### Option 1: Using the Shell Script (Linux/macOS)

```bash
./startup.sh
```

### Option 2: Using the Batch File (Windows)

```cmd
startup.bat
```

### Option 3: Manual Start

1. Start OCPP_GATEWAY:
   ```bash
   cd OCPP_GATEWAY
   npm run start:dev
   ```

2. In a separate terminal, start CPANEL:
   ```bash
   cd CPANEL
   PORT=3003 npm run dev
   ```

## Accessing the Applications

- **OCPP_GATEWAY API**: http://localhost:3000
- **CPANEL Admin Panel**: http://localhost:3003

## Ports Configuration

- OCPP_GATEWAY runs on port 3000 (configured in `.env` file)
- CPANEL runs on port 3003 (configured in `vite.config.ts`)
- WebSocket OCPP endpoint: ws://localhost:3000/:cpId

## Stopping the Services

- **Shell Script**: Press Ctrl+C in the terminal
- **Batch File**: Close the terminal windows
- **Manual Start**: Press Ctrl+C in each terminal window