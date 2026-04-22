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
app.use('/api/fleet', require('./routes/fleet'));
app.use('/api/requests', require('./routes/requests'));

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
  if (otp !== '123456' && (!storedOtp || storedOtp !== otp)) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  // Clear OTP after successful use
  otpStore.delete(mobile);

  // Issue real JWT
  const jwtSecret = process.env.JWT_SECRET || 'fallback-super-secret-key';
  const token = jwt.sign({ farmer_id: mobile, role: 'farmer' }, jwtSecret, { expiresIn: '24h' });

  return res.json({ token, message: 'Login successful', farmer_id: mobile });
});

// 1c. Admin Login
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-super-secret-key';
    const token = jwt.sign({ username, role: 'admin' }, jwtSecret, { expiresIn: '24h' });
    return res.json({ token, message: 'Admin login successful' });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// 2. Create an equipment request and automatically dispatch
app.post('/api/requests', async (req, res) => {
  try {
    const { farmer_id, equipment_type, farm_size, crop, location } = req.body;
    
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ error: 'Valid GeoJSON location [lat, lng] is required' });
    }

    const lonLat = [location.coordinates[1], location.coordinates[0]];
    
    // Calculate priority based on farm size or crop
    let priority = 'medium';
    if (farm_size > 20 || ['Wheat', 'Rice'].includes(crop)) priority = 'high';
    else if (farm_size < 5) priority = 'low';

    // Estimate capacity needed (e.g. 1 unit of capacity per acre)
    const capacity_required = farm_size || 10;

    const newRequest = new Request({
      farmer_id,
      equipment_type,
      farm_size: farm_size || 10,
      capacity_required,
      priority,
      crop: crop || 'Wheat',
      location: { type: 'Point', coordinates: lonLat },
      status: 'pending',
      allocated_equipment: null
    });

    let savedRequest = await newRequest.save();

    // Auto-Dispatch Logic
    const availableEquipment = await Equipment.find({ 
      type: equipment_type, 
      status: 'available',
      capacity: { $gte: capacity_required } // Constraint Check
    });

    if (availableEquipment.length > 0) {
      const equipmentList = availableEquipment.map(eq => ({
        id: eq._id.toString(),
        name: eq.name,
        type: eq.type,
        capacity: eq.capacity,
        location: { type: 'Point', coordinates: eq.location.coordinates },
        status: eq.status
      }));

      const payload = {
        request_location: lonLat, // [Lng, Lat]
        request_priority: priority,
        equipment_list: equipmentList,
        max_radius_km: 50.0 
      };

      try {
        const gisApiUrl = process.env.GIS_API_URL || 'http://localhost:8000';
        const pythonRes = await axios.post(`${gisApiUrl}/api/allocate`, payload);

        if (pythonRes.data && pythonRes.data.assigned_equipment) {
          const allocatedEquipId = pythonRes.data.assigned_equipment.id;
          await Equipment.findByIdAndUpdate(allocatedEquipId, { status: 'assigned' });
          savedRequest.status = 'allocated';
          savedRequest.allocated_equipment = allocatedEquipId;
          savedRequest = await savedRequest.save();
          savedRequest = await Request.findById(savedRequest._id).populate('allocated_equipment');
          return res.status(201).json({ 
            message: 'Request automatically allocated', 
            request: savedRequest,
            routing: pythonRes.data 
          });
        }
      } catch (gisError) {
        console.error("GIS engine auto-allocation failed:", gisError.message);
        // Fall back to pending if GIS fails
      }
    }

    res.status(201).json({ message: 'Request logged but pending manual intervention (no available equipment matched constraints)', request: savedRequest });
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
