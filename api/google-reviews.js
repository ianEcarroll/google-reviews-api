// File 1: /api/google-reviews.js
// Main API endpoint for fetching Google Reviews

const { google } = require('googleapis');

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed - use POST' });
  }

  try {
    const { accountId, locationId } = req.body;

    // Validate input
    if (!accountId || !locationId) {
      return res.status(400).json({ 
        error: 'Missing required fields: accountId and locationId' 
      });
    }

    // Create JWT client
    const auth = new google.auth.JWT({
      email: process.env.CLIENT_EMAIL,
      key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/business.manage']
    });

    // Initialize the My Business API
    const mybusiness = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: auth
    });

    // Fetch reviews
    const response = await mybusiness.accounts.locations.reviews.list({
      parent: `accounts/${accountId}/locations/${locationId}`
    });

    return res.status(200).json({
      success: true,
      reviews: response.data.reviews || [],
      totalReviews: response.data.totalReviewCount || 0
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch reviews',
      message: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
};
