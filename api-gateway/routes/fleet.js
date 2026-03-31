const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');

// GET /: Return all equipment
router.get('/', async (req, res) => {
  try {
    const fleet = await Equipment.find({});
    res.json(fleet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /: Create new equipment
router.post('/', async (req, res) => {
  try {
    const { type, location } = req.body;
    let { name } = req.body;
    
    if (!name && type) {
      name = `${type}-${Math.floor(Math.random() * 10000)}`;
    }

    const newEquipment = new Equipment({
      name: name || 'Unknown Equipment',
      type,
      location: {
        type: 'Point',
        coordinates: location?.coordinates || [76.7794, 30.7333],
      },
      status: 'available', // default status
    });

    const savedEquipment = await newEquipment.save();
    res.status(201).json(savedEquipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /:id: Update the status of the equipment (toggle between 'available' and 'assigned')
router.put('/:id', async (req, res) => {
  try {
    const equip = await Equipment.findById(req.params.id);
    if (!equip) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // The requirement says toggle between "Available" and "In Use"
    // Actual model enum has 'available', 'assigned', 'maintenance'
    equip.status = equip.status === 'available' ? 'assigned' : 'available';
    await equip.save();
    
    res.json(equip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /:id: Delete the equipment from the database
router.delete('/:id', async (req, res) => {
  try {
    const deletedEquip = await Equipment.findByIdAndDelete(req.params.id);
    if (!deletedEquip) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
