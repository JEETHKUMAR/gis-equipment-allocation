require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const Request = require('./models/Request');
const Equipment = require('./models/Equipment');

const app = express();
app.use(express.json());
app.use(cors());

// In-memory OTP store (simulation)
const otpStore = new Map();

// Connect Node.js to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gis_equipment';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// --- REST Endpoints ---

// 1a. Request OTP
app.post('/api/auth/request-otp', (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number required' });
  }

  // Generate pseudo-random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(mobile, otp);

  // Simulate SMS Dispatch
  console.log(`\n[SMS GATEWAY] Sending OTP ${otp} to ${mobile}\n`);

  return res.json({ message: 'OTP sent successfully' });
});

// 1b. Verify OTP & Issue JWT
app.post('/api/auth/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ error: 'Mobile and OTP required' });
  }

  const storedOtp = otpStore.get(mobile);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  // Clear OTP after successful use
  otpStore.delete(mobile);

  // Issue real JWT
  const jwtSecret = process.env.JWT_SECRET || 'fallback-super-secret-key';
  const token = jwt.sign({ farmer_id: mobile, role: 'farmer' }, jwtSecret, { expiresIn: '24h' });

  return res.json({ token, message: 'Login successful', farmer_id: mobile });
});

// 2. Create an equipment request
app.post('/api/requests', async (req, res) => {
  try {
    const { farmer_id, equipment_type, farm_size, crop, location } = req.body;
    
    // Ensure location follows GeoJSON Point format
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ error: 'Valid GeoJSON location [lat, lng] is required' });
    }

    // Convert Frontend [Lat, Lng] to GeoJSON [Lng, Lat]
    const lonLat = [location.coordinates[1], location.coordinates[0]];

    const availableEquipment = await Equipment.find({ status: 'available', type: equipment_type });
    const equipmentList = availableEquipment.map(eq => ({
      id: eq._id.toString(),
      name: eq.name,
      type: eq.type,
      location: { type: 'Point', coordinates: eq.location.coordinates },
      status: eq.status
    }));

    let allocatedEquipId = null;
    let reqStatus = 'pending';

    if (equipmentList.length > 0) {
      try {
        const pythonRes = await axios.post(`${process.env.GIS_API_URL || 'http://localhost:8000'}/api/allocate`, {
          request_location: lonLat,
          equipment_list: equipmentList,
          max_radius_km: 50.0 
        });
        
        if (pythonRes.data && pythonRes.data.assigned_equipment) {
          allocatedEquipId = pythonRes.data.assigned_equipment.id;
          reqStatus = 'allocated';
          await Equipment.findByIdAndUpdate(allocatedEquipId, { status: 'assigned' });
        }
      } catch (err) {
        console.error('Python GIS engine error:', err.message);
      }
    }

    const newRequest = new Request({
      farmer_id,
      equipment_type,
      farm_size: farm_size || 10,
      crop: crop || 'Wheat',
      location: {
        type: 'Point',
        coordinates: lonLat // [Lng, Lat]
      },
      status: reqStatus,
      allocated_equipment: allocatedEquipId
    });

    const savedRequest = await newRequest.save();
    res.status(201).json({ message: 'Request processed', request: savedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2b. Fetch active routes for Admin Dashboard
app.get('/api/dashboard/active-routes', async (req, res) => {
  try {
    const activeRequests = await Request.find({ status: 'allocated' }).populate('allocated_equipment');
    
    const routes = activeRequests.map(req => {
      return {
        _id: req._id,
        farmLocation: [req.location.coordinates[1], req.location.coordinates[0]], // [lat, lng]
        dispatchLocation: [req.allocated_equipment.location.coordinates[1], req.allocated_equipment.location.coordinates[0]], // [lat, lng]
        equipmentName: req.allocated_equipment.name
      };
    });

    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Fetch active fleets and requests for admin view
app.get('/api/dashboard', async (req, res) => {
  try {
    const requests = await Request.find().populate('allocated_equipment');
    const equipment = await Equipment.find();

    res.json({
      requests,
      equipment,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
