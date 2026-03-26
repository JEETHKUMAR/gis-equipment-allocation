const axios = require('axios');

// Mock Data Layer
const mockDatabase = {
  tractors: [
    { id: 't1', name: 'Tractor 1 (Close to A)', type: 'Tractor', location: { type: 'Point', coordinates: [76.7800, 30.7300] }, status: 'available' },
    { id: 't2', name: 'Tractor 2 (Close to B)', type: 'Tractor', location: { type: 'Point', coordinates: [76.7900, 30.7400] }, status: 'available' },
    { id: 't3', name: 'Tractor 3 (Close to C)', type: 'Tractor', location: { type: 'Point', coordinates: [76.8000, 30.7500] }, status: 'available' },
    { id: 't4', name: 'Tractor 4 (Backup)', type: 'Tractor', location: { type: 'Point', coordinates: [76.7700, 30.7200] }, status: 'available' },
    { id: 't5', name: 'Tractor 5 (Distant)', type: 'Tractor', location: { type: 'Point', coordinates: [76.8500, 30.8000] }, status: 'available' }
  ]
};

// Mutex lock for simulating Transactional isolation in concurrent environments
let isLocked = false;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function processFarmerRequest(farmerName, requestLocation) {
  console.log(`[REQUEST] ${farmerName} requesting equipment at [${requestLocation.join(', ')}]...`);
  
  // Acquire lock
  while (isLocked) {
    await sleep(10);
  }
  isLocked = true;

  try {
    // 1. Get currently available tractors
    const availableTractors = mockDatabase.tractors.filter(t => t.status === 'available');
    
    // 2. Call Python GIS Engine
    const response = await axios.post('http://localhost:8000/api/allocate', {
      request_location: requestLocation,
      equipment_list: availableTractors,
      max_radius_km: 15.0
    });

    const allocation = response.data;
    const assignedEquipment = allocation.assigned_equipment;

    // 3. Mark as assigned to prevent double-booking
    if (assignedEquipment) {
      const dbIndex = mockDatabase.tractors.findIndex(t => t.id === assignedEquipment.id);
      if (dbIndex !== -1) {
        mockDatabase.tractors[dbIndex].status = 'assigned';
        console.log(`[SUCCESS] ${farmerName} was allocated ${assignedEquipment.name}. Dist: ${allocation.travel_distance_km}km`);
        return true;
      }
    }
    
    console.log(`[FAILED] ${farmerName} could not get equipment. Reason: ${allocation.message}`);
    return false;
  } catch (error) {
    console.error(`[ERROR] Processing ${farmerName} failed:`, error.message);
    return false;
  } finally {
    // Release lock
    isLocked = false;
  }
}

async function runIntegrationTest() {
  console.log('--- STARTING CONCURRENT ALLOCATION TEST ---\n');

  // Trigger 3 requests simultaneously
  const requestA = processFarmerRequest('Farmer A', [76.7794, 30.7333]);
  const requestB = processFarmerRequest('Farmer B', [76.7850, 30.7380]);
  const requestC = processFarmerRequest('Farmer C', [76.7950, 30.7450]);

  await Promise.all([requestA, requestB, requestC]);

  console.log('\n--- FINAL DATABASE STATE ---');
  mockDatabase.tractors.forEach(t => {
    console.log(`- ${t.name}: [${t.status.toUpperCase()}]`);
  });
  
  console.log('\nTEST COMPLETE. No double-bookings should exist.');
}

runIntegrationTest();
