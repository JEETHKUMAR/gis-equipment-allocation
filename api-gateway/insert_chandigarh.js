const mongoose = require('mongoose');
const Equipment = require('./models/Equipment');

const MONGO_URI = 'mongodb://localhost:27017/gis_equipment';

const seedData = [
  { name: 'Tractor Alpha 1', type: 'Tractor', capacity: 150, lat: 30.7333, lng: 76.7794 },
  { name: 'Tractor Alpha 2', type: 'Tractor', capacity: 120, lat: 30.7400, lng: 76.7850 },
  { name: 'Tractor Beta 1', type: 'Tractor', capacity: 200, lat: 30.7500, lng: 76.7700 },
  { name: 'Harvester Gamma 1', type: 'Harvester', capacity: 300, lat: 30.7300, lng: 76.7900 },
  { name: 'Harvester Gamma 2', type: 'Harvester', capacity: 250, lat: 30.7200, lng: 76.7800 },
  { name: 'Harvester Delta', type: 'Harvester', capacity: 400, lat: 30.7450, lng: 76.7600 },
  { name: 'Sprayer Epsilon 1', type: 'Sprayer', capacity: 100, lat: 30.7350, lng: 76.7650 },
  { name: 'Sprayer Epsilon 2', type: 'Sprayer', capacity: 80, lat: 30.7250, lng: 76.7850 },
  { name: 'Rotavator Zeta 1', type: 'Rotavator', capacity: 90, lat: 30.7550, lng: 76.7750 },
  { name: 'Rotavator Zeta 2', type: 'Rotavator', capacity: 110, lat: 30.7600, lng: 76.7900 },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  await Equipment.deleteMany({});
  await mongoose.connection.collection('requests').deleteMany({});
  
  for (const item of seedData) {
    const equip = new Equipment({
      name: item.name,
      type: item.type,
      capacity: item.capacity,
      location: { type: 'Point', coordinates: [item.lng, item.lat] },
      status: 'available'
    });
    await equip.save();
  }
  
  console.log('Inserted diverse equipment inventory near Chandigarh.');
  process.exit(0);
}

run();
