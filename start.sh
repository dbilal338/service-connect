#!/bin/bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

echo "Starting ServiceConnect..."

# Kill existing processes
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# Start backend
cd /home/dbilal338/service-connect/backend
nohup node server.js > /tmp/sc-backend.log 2>&1 &
echo "Backend started (PID $!)"

# Start frontend
cd /home/dbilal338/service-connect/frontend
nohup npm run dev > /tmp/sc-frontend.log 2>&1 &
echo "Frontend started (PID $!)"

sleep 3
echo ""
echo "App running at: http://localhost:3000"
echo "API running at: http://localhost:5000"
echo ""
echo "Demo credentials (password: password123)"
echo "  Consumer: alex@demo.com"
echo "  Electrician: mike@demo.com"
echo "  Plumber: sarah@demo.com"
