const Package = require('../models/Package');

// @desc Get all packages
// @route GET /api/packages
// @access Public
exports.getPackages = async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = {};
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;

    const packages = await Package.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single package
// @route GET /api/packages/:id
// @access Public
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create new package
// @route POST /api/packages
// @access Private/Admin
exports.createPackage = async (req, res) => {
  try {
    let imageUrl = req.body.image || req.body.imageUrl || req.body.url;
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      imageUrl = file.path || (file.filename ? `/uploads/${file.filename}` : null);
    } else if (req.file) {
      imageUrl = req.file.path || (req.file.filename ? `/uploads/${req.file.filename}` : null);
    }

    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80';
    }

    const {
      name,
      destination,
      duration,
      price,
      discountPrice,
      description,
      highlights,
      inclusions,
      exclusions,
      rating,
      featured,
      category
    } = req.body;

    const newPackage = await Package.create({
      name: name || 'Custom Tour Package',
      destination: destination || 'Nagpur & Beyond',
      duration: duration || '3 Days / 2 Nights',
      price: Number(price) || 5000,
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      description: description || 'Experience the beauty and spirituality with Mahakali Travels.',
      highlights: Array.isArray(highlights) ? highlights : (highlights ? highlights.split(',').map(s => s.trim()) : []),
      inclusions: Array.isArray(inclusions) ? inclusions : (inclusions ? inclusions.split(',').map(s => s.trim()) : []),
      exclusions: Array.isArray(exclusions) ? exclusions : (exclusions ? exclusions.split(',').map(s => s.trim()) : []),
      image: imageUrl,
      rating: rating ? Number(rating) : 4.8,
      featured: featured === 'true' || featured === true,
      category: category || 'Hill Station'
    });

    res.status(201).json({ success: true, message: 'Package created successfully!', data: newPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update package
// @route PUT /api/packages/:id
// @access Private/Admin
exports.updatePackage = async (req, res) => {
  try {
    let pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
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
    if (updateData.discountPrice) updateData.discountPrice = Number(updateData.discountPrice);

    if (updateData.highlights && typeof updateData.highlights === 'string') {
      updateData.highlights = updateData.highlights.split(',').map(s => s.trim());
    }
    if (updateData.inclusions && typeof updateData.inclusions === 'string') {
      updateData.inclusions = updateData.inclusions.split(',').map(s => s.trim());
    }
    if (updateData.exclusions && typeof updateData.exclusions === 'string') {
      updateData.exclusions = updateData.exclusions.split(',').map(s => s.trim());
    }

    pkg = await Package.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Package updated successfully!', data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete package
// @route DELETE /api/packages/:id
// @access Private/Admin
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    await pkg.deleteOne();
    res.status(200).json({ success: true, message: 'Package deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
