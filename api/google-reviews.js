// /api/google-reviews.js
// Simple working version - no JWT complexity yet

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed - use POST' });
  }

  try {
    const { accountId, locationId } = req.body;

    if (!accountId || !locationId) {
      return res.status(400).json({ 
        error: 'Missing required fields: accountId and locationId' 
      });
    }

    // For now, let's verify the function works
    return res.status(200).json({
      message: 'Function is working!',
      received: {
        accountId,
        locationId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
