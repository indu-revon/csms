#!/bin/bash

# Startup script for REVON Charging Management System
# Runs OCPP_GATEWAY on port 3000 and CPANEL on port 3003

echo "Starting REVON Charging Management System..."

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    local process_name=$2
    
    echo "Checking for processes on port $port..."
    local pids=$(lsof -ti:$port)
    
    if [ ! -z "$pids" ]; then
        echo "Killing $process_name processes on port $port (PIDs: $pids)..."
        kill -9 $pids 2>/dev/null
        sleep 2
    else
        echo "No $process_name processes found on port $port"
    fi
}

# Function to kill Node.js processes by name
kill_node_processes() {
    local process_name=$1
    local pids=$(pgrep -f "$process_name")
    
    if [ ! -z "$pids" ]; then
        echo "Killing $process_name Node.js processes (PIDs: $pids)..."
        kill -9 $pids 2>/dev/null
        sleep 2
    else
        echo "No $process_name Node.js processes found"
    fi
}

# Kill existing processes to prevent duplicates
echo "=== Cleaning up existing processes ==="
kill_port_processes 3000 "OCPP_GATEWAY"
kill_port_processes 3003 "CPANEL"
kill_port_processes 3004 "CPANEL"
kill_port_processes 3005 "CPANEL"
kill_port_processes 3006 "CPANEL"
kill_port_processes 3007 "CPANEL"

# Kill any remaining Node.js processes related to our project
kill_node_processes "nest start"
kill_node_processes "vite"
kill_node_processes "OCPP_GATEWAY"
kill_node_processes "CPANEL"

echo "=== Waiting for ports to be released ==="
sleep 3

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
npm run start &
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