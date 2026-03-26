# GIS-Based Equipment Allocation System

## Overview
The GIS-Based Equipment Allocation System bridges the "Mechanization Gap" for small farmers by utilizing geographic information systems (GIS) to dynamically allocate agricultural equipment (e.g., tractors, rotavators). By clustering demand and calculating the shortest travel paths, the system minimizes dead mileage and ensures efficient, timely dispatch of critical resources.

## Architecture Breakdown
This application uses a Microservices architectural pattern:
- **Frontend (`/frontend`)**: Built with React.js and Vite. It provides a mobile-responsive interface for farmers to drop map pins and request equipment. It also includes an Admin Dashboard utilizing `react-leaflet` to visually plot farm requests (Red markers) and equipment dispatches (Green markers) connected by routing polylines.
- **API Gateway (`/api-gateway`)**: A Node.js & Express.js server that acts as the central router. It manages equipment workflows, simulates a mocked MongoDB layer with `2dsphere` spatial indexing capability, and effectively handles peak-season concurrent booking scenarios.
- **GIS Engine (`/gis-engine`)**: A separate Python-based FastAPI microservice. It assumes the heavy computational load by using the Haversine formula and a Modified Nearest Neighbor heuristic algorithm to allocate resources within a strict 5km bounding radius.

## Local Development Commands
To boot up the complete environment locally, either use the provided startup scripts or run the following commands sequentially in three separate terminal windows:

### Using Startup Scripts
For Windows:
```cmd
start_all.bat
```
For Linux / Mac:
```bash
bash start_all.sh
```

### Manual Boot-up

#### 1. Boot up the Core Python GIS Engine
```bash
cd gis-engine
pip install -r requirements.txt
python app.py
```
*(Runs on `http://localhost:8000`)*

#### 2. Boot up the Node.js API Gateway
```bash
cd api-gateway
npm install
node server.js
```
*(Runs on `http://localhost:5000`)*

#### 3. Boot up the React.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:3000`)*
