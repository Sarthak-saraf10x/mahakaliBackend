const ContactMessage = require('../models/ContactMessage');

// @desc Submit contact form
// @route POST /api/contact
// @access Public
exports.submitContact = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all required contact fields.' });
    }

    const newMessage = await ContactMessage.create({
      fullName,
      email,
      phone,
      subject: subject || 'General Enquiry',
      message
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received by Mahakali Tours.',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all contact messages (with search/filter)
// @route GET /api/contact
// @access Private/Admin
exports.getContactMessages = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const messages = await ContactMessage.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update message status (Read / Responded)
// @route PATCH /api/contact/:id
// @access Private/Admin
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }

    if (status) msg.status = status;
    await msg.save();

    res.status(200).json({ success: true, message: 'Message status updated', data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete contact message
// @route DELETE /api/contact/:id
// @access Private/Admin
exports.deleteContactMessage = async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }

    await msg.deleteOne();
    res.status(200).json({ success: true, message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
