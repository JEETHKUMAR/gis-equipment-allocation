const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  farmer_id: { type: String, required: true }, // e.g., Mock Mobile Number
  equipment_type: { type: String, required: true }, // e.g., "Rotavator"
  farm_size: { type: Number, required: true }, // Size in acres/hectares
  crop: { type: String, required: true },
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
  status: { type: String, enum: ['pending', 'allocated', 'completed', 'approved', 'rejected'], default: 'pending' },
  allocated_equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', default: null }
}, { timestamps: true });

// Create 2dsphere index for GIS queries
requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);
