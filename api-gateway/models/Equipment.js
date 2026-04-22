const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Tractor A"
  type: { type: String, required: true }, // e.g., "Tractor", "Rotavator"
  capacity: { type: Number, default: 100 }, // Capacity metric (e.g., fuel/hours limit)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  status: { type: String, enum: ['available', 'assigned', 'maintenance'], default: 'available' }
}, { timestamps: true });

// Create 2dsphere index for GIS queries
equipmentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Equipment', equipmentSchema);
