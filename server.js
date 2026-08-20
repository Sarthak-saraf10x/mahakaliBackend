const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedData = require('./utils/seed');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const packageRoutes = require('./routes/packageRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const tourRoutes = require('./routes/tourRoutes');
const contactRoutes = require('./routes/contactRoutes');
const corporateRoutes = require('./routes/corporateRoutes');
const statsRoutes = require('./routes/statsRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const settingRoutes = require('./routes/settingRoutes');
const visitRoutes = require('./routes/visitRoutes');

const app = express();

// Connect to MongoDB
connectDB().then(() => {
  // Auto-seed initial data if empty
  seedData();
});

// Security & CORS Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(cors({
  origin: '*', // Allow all cross-origin requests for decoupled frontend
  credentials: true
}));
app.use(morgan('dev'));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend Static Files (from project root directory)
const frontendDir = path.join(__dirname, '..');
app.use(express.static(frontendDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/bus-routes', require('./routes/busRouteRoutes'));
app.use('/api/contact', contactRoutes);
app.use('/api/corporate', corporateRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/visits', visitRoutes);

// Admin Dashboard Route (/admin)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(frontendDir, 'admin.html'));
});

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Mahakali Tours & Travels API is running smoothly',
    timestamp: new Date()
  });
});

// Serve frontend index.html for any unmatched client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});



// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mahakali Backend Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Admin Dashboard: http://localhost:${PORT}/admin`);
});
