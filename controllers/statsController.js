const Package = require('../models/Package');
const Gallery = require('../models/Gallery');
const UpcomingTour = require('../models/UpcomingTour');
const ContactMessage = require('../models/ContactMessage');
const CorporateQuote = require('../models/CorporateQuote');

// @desc Get Admin Dashboard Statistics
// @route GET /api/stats
// @access Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalPackages,
      totalGallery,
      totalTours,
      totalContactMessages,
      totalCorporateRequests,
      unreadContacts,
      newCorporateQuotes
    ] = await Promise.all([
      Package.countDocuments(),
      Gallery.countDocuments(),
      UpcomingTour.countDocuments(),
      ContactMessage.countDocuments(),
      CorporateQuote.countDocuments(),
      ContactMessage.countDocuments({ status: 'Unread' }),
      CorporateQuote.countDocuments({ status: 'New' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPackages,
        totalGallery,
        totalTours,
        totalContactMessages,
        totalCorporateRequests,
        unreadContacts,
        newCorporateQuotes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
