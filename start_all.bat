@echo off
echo Starting GIS Equipment Allocation System...

echo Starting Python GIS Engine on port 8000...
cd gis-engine
start cmd /k "python app.py"
cd ..

echo Starting Node API Gateway on port 5000...
cd api-gateway
start cmd /k "node server.js"
cd ..

echo Starting React Frontend on port 3000...
cd frontend
start cmd /k "npm run dev"
cd ..

echo All services started in separate windows!
