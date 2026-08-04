const BusRoute = require('../models/BusRoute');

// @desc Get all bus routes
// @route GET /api/bus-routes
// @access Public
exports.getBusRoutes = async (req, res) => {
  try {
    const routes = await BusRoute.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single bus route
// @route GET /api/bus-routes/:id
// @access Public
exports.getBusRouteById = async (req, res) => {
  try {
    const route = await BusRoute.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Bus route not found' });
    }
    res.status(200).json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create new bus route
// @route POST /api/bus-routes
// @access Private/Admin
exports.createBusRoute = async (req, res) => {
  try {
    const {
      source,
      destination,
      busType,
      departureTime,
      arrivalTime,
      price,
      seatsAvailable,
      frequency,
      status,
      whatsappNumber
    } = req.body;

    let imageUrl = req.body.image || req.body.imageUrl || req.body.url;
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      imageUrl = file.path || (file.filename ? `/uploads/${file.filename}` : null);
    } else if (req.file) {
      imageUrl = req.file.path || (req.file.filename ? `/uploads/${req.file.filename}` : null);
    }

    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';
    }

    const newRoute = await BusRoute.create({
      source: source || 'Nagpur',
      destination: destination || req.body.name || 'Destination',
      busType: busType || 'AC Sleeper 2+1',
      departureTime: departureTime || '09:00 PM',
      arrivalTime: arrivalTime || '06:00 AM',
      price: price ? Number(price) : 750,
      seatsAvailable: seatsAvailable ? Number(seatsAvailable) : 30,
      frequency: frequency || 'Daily',
      image: imageUrl,
      status: status || 'Active',
      whatsappNumber: whatsappNumber || '919876543210'
    });

    res.status(201).json({ success: true, message: 'Bus route added successfully!', data: newRoute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update bus route
// @route PUT /api/bus-routes/:id
// @access Private/Admin
exports.updateBusRoute = async (req, res) => {
  try {
    let route = await BusRoute.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Bus route not found' });
    }

    let updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      updateData.image = file.path || (file.filename ? `/uploads/${file.filename}` : null);
    } else if (req.file) {
      updateData.image = req.file.path || (req.file.filename ? `/uploads/${req.file.filename}` : null);
    } else if (req.body.imageUrl || req.body.url) {
      updateData.image = req.body.imageUrl || req.body.url;
    }

    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.seatsAvailable) updateData.seatsAvailable = Number(updateData.seatsAvailable);

    route = await BusRoute.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Bus route updated successfully!', data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete bus route
// @route DELETE /api/bus-routes/:id
// @access Private/Admin
exports.deleteBusRoute = async (req, res) => {
  try {
    const route = await BusRoute.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Bus route not found' });
    }

    await route.deleteOne();
    res.status(200).json({ success: true, message: 'Bus route deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
