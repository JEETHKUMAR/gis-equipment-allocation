#!/bin/bash
echo "Starting GIS Equipment Allocation System..."

# Start Python GIS Engine
echo "Starting Python GIS Engine on port 8000..."
cd gis-engine
python app.py &
GIS_PID=$!
cd ..

# Start Node API Gateway
echo "Starting Node API Gateway on port 5000..."
cd api-gateway
node server.js &
API_PID=$!
cd ..

# Start React Frontend
echo "Starting React Frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "All services started!"
echo "Press Ctrl+C to stop all services."

# Trap Ctrl+C to kill background processes
trap "kill $GIS_PID $API_PID $FRONTEND_PID; exit" SIGINT

wait
