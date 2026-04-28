const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// GET /api/requests - Return all requests sorted by newest first
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find({})
      .populate('allocated_equipment')
      .sort({ createdAt: -1 }); // newest first based on timestamps
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const axios = require('axios');
const Equipment = require('../models/Equipment');

// PUT /api/requests/:id/status - Update the status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Ensure the new status is valid per schema
    const validStatuses = ['pending', 'allocated', 'completed', 'approved', 'rejected'];
    if (!validStatuses.includes(status?.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }

    // Step A: Fetch the specific Request
    const requestDoc = await Request.findById(req.params.id);
    if (!requestDoc) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (status.toLowerCase() === 'approved') {
      // Step B: Query the Equipment collection for matching Available items
      const availableEquipment = await Equipment.find({ 
        type: requestDoc.equipment_type, 
        status: 'available' 
      });

      // Step C: If empty array, return a 400 status
      if (!availableEquipment || availableEquipment.length === 0) {
        return res.status(400).json({ error: 'No available equipment of this type.' });
      }

      // Step D: Prepare a payload
      const equipmentList = availableEquipment.map(eq => ({
        id: eq._id.toString(),
        name: eq.name,
        type: eq.type,
        location: { type: 'Point', coordinates: eq.location.coordinates },
        status: eq.status
      }));

      const payload = {
        request_location: requestDoc.location.coordinates, // [Lng, Lat]
        equipment_list: equipmentList,
        initial_radius_km: 5.0,
        fallback_radius_km: 50.0 
      };

      // Step E: Make a POST request via Axios
      const gisApiUrl = process.env.GIS_API_URL || 'http://localhost:8000';
      const pythonRes = await axios.post(`${gisApiUrl}/api/allocate`, payload);

      if (pythonRes.data && pythonRes.data.assigned_equipment) {
        const allocatedEquipId = pythonRes.data.assigned_equipment.id;
        
        // Step F: Update Equipment document status to 'assigned' (maps to 'In Use')
        await Equipment.findByIdAndUpdate(allocatedEquipId, { status: 'assigned' });
        
        // Step G: Update Request status to 'approved' and save the assigned equipmentId
        requestDoc.status = 'approved';
        requestDoc.allocated_equipment = allocatedEquipId;
        await requestDoc.save();

        // Populate to send back fully modeled data
        const updatedRequest = await Request.findById(requestDoc._id).populate('allocated_equipment');

        // Step H: Return a 200 response
        return res.status(200).json({
          request: updatedRequest,
          routing: pythonRes.data
        });
      } else {
        return res.status(500).json({ error: 'GIS Engine could not allocate equipment' });
      }

    } else {
      // Normal update for other statuses like 'rejected'
      requestDoc.status = status.toLowerCase();
      await requestDoc.save();
      return res.status(200).json({ request: requestDoc });
    }
  } catch (err) {
    if (err.response) {
      console.error('Error during allocation GIS response:', err.response.data);
      res.status(400).json({ error: err.response.data.detail || err.response.data.message || err.message });
    } else {
      console.error('Error during allocation JS:', err.stack || err);
      res.status(400).json({ error: err.message || 'Unknown error' });
    }
  }
});

// PUT /api/requests/:id/complete - Complete the job and return equipment
router.put('/:id/complete', async (req, res) => {
  try {
    const requestDoc = await Request.findById(req.params.id);
    if (!requestDoc) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (requestDoc.status !== 'approved' && requestDoc.status !== 'allocated') {
      return res.status(400).json({ error: 'Only approved/allocated requests can be completed.' });
    }

    const equipId = requestDoc.allocated_equipment;
    if (equipId) {
      await Equipment.findByIdAndUpdate(equipId, { status: 'available' });
    }

    requestDoc.status = 'completed';
    await requestDoc.save();

    res.status(200).json({ 
      message: 'Job completed successfully, equipment returned to available pool.', 
      request: requestDoc 
    });
  } catch (err) {
    console.error('Error completing job:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
