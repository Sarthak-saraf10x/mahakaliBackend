const Gallery = require('../models/Gallery');
const { cloudinary } = require('../config/cloudinary');

// @desc Get gallery images
// @route GET /api/gallery
// @access Public
exports.getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    const items = await Gallery.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Upload single/multiple gallery images
// @route POST /api/gallery
// @access Private/Admin
exports.createGallery = async (req, res) => {
  try {
    const { title, category } = req.body;
    let savedItems = [];

    // Multiple Files Upload
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const originalName = file.originalname ? file.originalname.split('.')[0] : 'Mahakali Travel';
        const imageUrl = file.path || (file.filename ? `/uploads/${file.filename}` : null) || req.body.url || req.body.imageUrl || 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80';
        const item = await Gallery.create({
          title: title || originalName || 'Mahakali Travel Capture',
          category: category || 'General',
          imageUrl: imageUrl,
          publicId: file.filename || file.public_id || ''
        });
        savedItems.push(item);
      }
    } 
    // Single File Upload
    else if (req.file) {
      const originalName = req.file.originalname ? req.file.originalname.split('.')[0] : 'Mahakali Travel';
      const imageUrl = req.file.path || (req.file.filename ? `/uploads/${req.file.filename}` : null) || req.body.url || req.body.imageUrl || 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80';
      const item = await Gallery.create({
        title: title || originalName || 'Mahakali Travel Capture',
        category: category || 'General',
        imageUrl: imageUrl,
        publicId: req.file.filename || req.file.public_id || ''
      });
      savedItems.push(item);
    } 
    // URL Upload Fallback
    else if (req.body.imageUrl || req.body.url) {
      const url = req.body.imageUrl || req.body.url;
      const item = await Gallery.create({
        title: title || 'Mahakali Travel Capture',
        category: category || 'General',
        imageUrl: url
      });
      savedItems.push(item);
    } else {
      return res.status(400).json({ success: false, message: 'Please upload an image file or provide an imageUrl.' });
    }

    res.status(201).json({
      success: true,
      message: `${savedItems.length} image(s) added to gallery successfully!`,
      data: savedItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update gallery item title/category
// @route PUT /api/gallery/:id
// @access Private/Admin
exports.updateGallery = async (req, res) => {
  try {
    const { title, category } = req.body;
    let item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    if (title) item.title = title;
    if (category) item.category = category;
    if (req.file) {
      item.imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    }

    await item.save();
    res.status(200).json({ success: true, message: 'Gallery item updated successfully!', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete gallery item
// @route DELETE /api/gallery/:id
// @access Private/Admin
exports.deleteGallery = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    // Delete from Cloudinary if publicId exists
    if (item.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(item.publicId);
      } catch (err) {
        console.warn('Cloudinary delete warning:', err.message);
      }
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Gallery image deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
