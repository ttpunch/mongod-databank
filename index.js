// Main application entry point
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const dataRoutes = require('./routes/data.routes');
const aiRoutes = require('./routes/ai.routes');
const insightsRoutes = require('./routes/insights.routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/data', dataRoutes);
app.use('/api/data', aiRoutes);
app.use('/api/data', insightsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MongoDB Excel Data API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});