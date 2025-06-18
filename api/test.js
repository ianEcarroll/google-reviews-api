// File 2: /api/test.js
// Simple test endpoint to verify deployment

module.exports = function handler(req, res) {
  res.status(200).json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method
  });
};
