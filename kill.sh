#!/bin/bash

# Utility script to kill all REVON CMS processes

echo "=== Killing all REVON CMS processes ==="

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    local process_name=$2
    
    echo "Checking for processes on port $port..."
    local pids=$(lsof -ti:$port)
    
    if [ ! -z "$pids" ]; then
        echo "Killing $process_name processes on port $port (PIDs: $pids)..."
        kill -9 $pids 2>/dev/null
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
    else
        echo "No $process_name Node.js processes found"
    fi
}

# Kill processes on common ports
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

echo "=== All REVON CMS processes have been terminated ==="