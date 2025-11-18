#!/bin/bash

# Startup script for REVON Charging Management System
# Runs OCPP_GATEWAY on port 3000 and CPANEL on port 3003

echo "Starting REVON Charging Management System..."

# Function to clean up background processes on exit
cleanup() {
    echo "Stopping services..."
    kill $OCPP_PID $CPANEL_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM

# Start OCPP_GATEWAY on port 3000
echo "Starting OCPP_GATEWAY on port 3000..."
cd OCPP_GATEWAY
npm run start:dev &
OCPP_PID=$!
cd ..

# Wait a moment for OCPP_GATEWAY to start
sleep 3

# Start CPANEL on port 3003
echo "Starting CPANEL on port 3003..."
cd CPANEL
# Set the port to 3003 via environment variable
PORT=3003 npm run dev &
CPANEL_PID=$!
cd ..

echo "Services started:"
echo "- OCPP_GATEWAY (API & WebSocket): http://localhost:3000"
echo "- CPANEL (Admin Panel): http://localhost:3003"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for background processes
wait $OCPP_PID $CPANEL_PID