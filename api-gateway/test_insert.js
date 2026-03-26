const mongoose = require('mongoose');
const Request = require('./models/Request');
const Equipment = require('./models/Equipment');

const MONGO_URI = 'mongodb://localhost:27017/gis_equipment';

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    // Clear existing data
    await Request.deleteMany({});
    await Equipment.deleteMany({});

    console.log('Inserting test Equipment...');
    const tractor = new Equipment({
      name: 'Tractor A',
      type: 'Tractor',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bangalore
      status: 'available'
    });
    await tractor.save();

    console.log('Inserting test Request...');
    const request = new Request({
      farmer_id: '9876543210',
      equipment_type: 'Tractor',
      farm_size: 5,
      crop: 'Wheat',
      location: { type: 'Point', coordinates: [77.5900, 12.9700] }, // Near Bangalore
    });
    await request.save();

    console.log('Data successfully inserted. Testing 2dsphere index query...');

    // Find equipment within 5km of the request
    const radiusInRadian = 5 / 6378.1; // 5 km radius
    const nearbyEquipment = await Equipment.find({
      location: {
        $geoWithin: {
          $centerSphere: [request.location.coordinates, radiusInRadian]
        }
      }
    });

    console.log('----------------------------------------------------');
    console.log('Nearby Equipment found:', nearbyEquipment.length);
    if (nearbyEquipment.length > 0) {
      console.log('Found:', nearbyEquipment.map(e => e.name).join(', '));
      console.log('SUCCESS! MongoDB 2dsphere index and GeoJSON insertion is working correctly.');
    } else {
      console.log('FAILED! No nearby equipment found. Index or insertion might have an issue.');
    }
    console.log('----------------------------------------------------');

  } catch (err) {
    console.error('Test script error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runTest();
