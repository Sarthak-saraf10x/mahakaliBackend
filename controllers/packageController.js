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
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Package image is required.' });
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
      name,
      destination,
      duration,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      description,
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

    if (req.file) {
      updateData.image = req.file.path || `/uploads/${req.file.filename}`;
    }

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
