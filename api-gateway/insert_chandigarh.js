const mongoose = require('mongoose');
const Equipment = require('./models/Equipment');

const MONGO_URI = 'mongodb://localhost:27017/gis_equipment';

async function run() {
  await mongoose.connect(MONGO_URI);
  await Equipment.deleteMany({});
  const tractor1 = new Equipment({
    name: 'Tractor Alpha',
    type: 'Tractor',
    location: { type: 'Point', coordinates: [76.7794, 30.7450] }, // Near Chandigarh
    status: 'available'
  });
  const harvester1 = new Equipment({
    name: 'Harvester Beta',
    type: 'Harvester',
    location: { type: 'Point', coordinates: [76.7800, 30.7500] },
    status: 'available'
  });
  await tractor1.save();
  await harvester1.save();
  console.log('Inserted equipment near Chandigarh.');
  process.exit(0);
}
run();
