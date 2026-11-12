const express = require('express');
const cors = require('cors');
const receiptRoutes = require('./routes/receiptRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check / Base route
app.get('/api', (req, res) => {
  res.json({
    message: 'Gold Receipt System API is running smoothly',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Receipt routes
app.use('/api/receipts', receiptRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;

