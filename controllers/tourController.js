const UpcomingTour = require('../models/UpcomingTour');

// @desc Get all upcoming tours
// @route GET /api/tours
// @access Public
exports.getTours = async (req, res) => {
  try {
    const tours = await UpcomingTour.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tours.length, data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create upcoming tour
// @route POST /api/tours
// @access Private/Admin
exports.createTour = async (req, res) => {
  try {
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Tour image is required.' });
    }

    const { name, destination, startDate, endDate, price, seatsAvailable, description, status } = req.body;

    const tour = await UpcomingTour.create({
      name,
      destination,
      startDate,
      endDate,
      price: Number(price),
      seatsAvailable: Number(seatsAvailable) || 20,
      description,
      image: imageUrl,
      status: status || 'Upcoming'
    });

    res.status(201).json({ success: true, message: 'Upcoming tour created successfully!', data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update upcoming tour
// @route PUT /api/tours/:id
// @access Private/Admin
exports.updateTour = async (req, res) => {
  try {
    let tour = await UpcomingTour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    let updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path || `/uploads/${req.file.filename}`;
    }

    tour = await UpcomingTour.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Tour updated successfully!', data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete upcoming tour
// @route DELETE /api/tours/:id
// @access Private/Admin
exports.deleteTour = async (req, res) => {
  try {
    const tour = await UpcomingTour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    await tour.deleteOne();
    res.status(200).json({ success: true, message: 'Tour deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
