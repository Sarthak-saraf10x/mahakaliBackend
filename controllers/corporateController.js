const CorporateQuote = require('../models/CorporateQuote');

// @desc Submit Corporate Quote Request
// @route POST /api/corporate
// @access Public
exports.submitCorporateQuote = async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      companySize,
      busSize,
      destination,
      serviceType,
      travelDates,
      numberOfEmployees,
      budget,
      requirements,
      message
    } = req.body;

    if (!companyName || !contactPerson || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Company Name, Contact Person, Email, and Phone are required.' });
    }

    const quote = await CorporateQuote.create({
      companyName,
      contactPerson,
      email,
      phone,
      companySize: busSize || companySize || '24 Seater',
      destination: serviceType || destination || 'Daily Staff Commute',
      travelDates: travelDates || '',
      numberOfEmployees: numberOfEmployees || '',
      budget: budget || '',
      requirements: requirements || message || 'Staff transportation request'
    });

    res.status(201).json({
      success: true,
      message: `Thank you ${contactPerson}! Your B2B RFP for ${companyName} has been received. Our Account Manager will reach out within 2 hours.`,
      data: quote
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all corporate quotes (Search & Filter)
// @route GET /api/corporate
// @access Private/Admin
exports.getCorporateQuotes = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const quotes = await CorporateQuote.find(query).sort({ submissionDate: -1 });
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update corporate quote status (e.g. Contacted, In Progress, Archived)
// @route PATCH /api/corporate/:id
// @access Private/Admin
exports.updateCorporateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quote = await CorporateQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Corporate quote request not found' });
    }

    if (status) quote.status = status;
    await quote.save();

    res.status(200).json({ success: true, message: 'Quote status updated successfully', data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete corporate quote request
// @route DELETE /api/corporate/:id
// @access Private/Admin
exports.deleteCorporateQuote = async (req, res) => {
  try {
    const quote = await CorporateQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Corporate quote request not found' });
    }

    await quote.deleteOne();
    res.status(200).json({ success: true, message: 'Corporate quote request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
