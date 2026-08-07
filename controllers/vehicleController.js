const Vehicle = require('../models/Vehicle');

// @desc  Get all vehicles
// @route GET /api/vehicles
// @access Public
exports.getVehicles = async (req, res) => {
  try {
    const { vehicleType, status } = req.query;
    let query = {};
    if (vehicleType) query.vehicleType = vehicleType;
    if (status) query.status = status;

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single vehicle
// @route GET /api/vehicles/:id
// @access Public
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create new vehicle
// @route POST /api/vehicles
// @access Private/Admin
exports.createVehicle = async (req, res) => {
  try {
    // Handle image upload
    let imageUrl = req.body.image || req.body.imageUrl || req.body.url || '';
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      imageUrl = file.path || (file.filename ? `/uploads/${file.filename}` : '');
    } else if (req.file) {
      imageUrl = req.file.path || (req.file.filename ? `/uploads/${req.file.filename}` : '');
    }

    const {
      name,
      vehicleType,
      seatingCapacity,
      fuelType,
      transmission,
      pricePerKm,
      features,
      ac,
      whatsappNumber,
      status
    } = req.body;

    // Parse features - can come as comma-separated string or array
    let featuresArr = [];
    if (features) {
      featuresArr = Array.isArray(features)
        ? features
        : features.split(',').map(f => f.trim()).filter(Boolean);
    }

    const newVehicle = await Vehicle.create({
      name: name || 'Vehicle',
      vehicleType: vehicleType || 'Sedan',
      seatingCapacity: seatingCapacity ? Number(seatingCapacity) : 4,
      fuelType: fuelType || 'Diesel',
      transmission: transmission || 'Manual',
      pricePerKm: pricePerKm || '',
      features: featuresArr,
      ac: ac === 'true' || ac === true || ac === 'on',
      image: imageUrl,
      whatsappNumber: whatsappNumber || '917517685951',
      status: status || 'Available'
    });

    res.status(201).json({ success: true, message: 'Vehicle added to fleet successfully!', data: newVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update vehicle
// @route PUT /api/vehicles/:id
// @access Private/Admin
exports.updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    let updateData = { ...req.body };

    // Handle image upload on update
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      updateData.image = file.path || (file.filename ? `/uploads/${file.filename}` : null);
    } else if (req.file) {
      updateData.image = req.file.path || (req.file.filename ? `/uploads/${req.file.filename}` : null);
    } else if (req.body.imageUrl || req.body.url) {
      updateData.image = req.body.imageUrl || req.body.url;
    }

    // Type coercions
    if (updateData.seatingCapacity) updateData.seatingCapacity = Number(updateData.seatingCapacity);
    if (updateData.ac !== undefined) {
      updateData.ac = updateData.ac === 'true' || updateData.ac === true || updateData.ac === 'on';
    }

    // Parse features
    if (updateData.features && typeof updateData.features === 'string') {
      updateData.features = updateData.features.split(',').map(f => f.trim()).filter(Boolean);
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Vehicle updated successfully!', data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete vehicle
// @route DELETE /api/vehicles/:id
// @access Private/Admin
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await vehicle.deleteOne();
    res.status(200).json({ success: true, message: 'Vehicle deleted from fleet successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
