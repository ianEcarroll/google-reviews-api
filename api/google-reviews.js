// File: /api/google-reviews.js

const { google } = require('googleapis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed – use POST' });
  }

  try {
    // Handle raw vs parsed JSON body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { accountId, locationId } = body;

    if (!accountId || !locationId) {
      return res.status(400).json({
        error: 'Missing required fields: accountId and locationId',
      });
    }

    // Set up service account authentication
    const auth = new google.auth.JWT({
      email: process.env.CLIENT_EMAIL,
      key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/business.manage'],
    });

    // ✅ Use the correct Google API module
    const mybusiness = google.mybusiness({ version: 'v4', auth });

    const parent = `accounts/${accountId}/locations/${locationId}`;

    const response = await mybusiness.accounts.locations.reviews.list({
      parent,
    });

    const data = response?.data || {};

    // Log for debugging
    console.log('✅ Google API raw response:', JSON.stringify(data, null, 2));

    // Safe return
    return res.status(200).json({
      success: true,
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      totalReviews: data.totalReviewCount || 0,
    });
  } catch (error) {
    console.error('❌ Google API fetch error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch reviews',
      message: error.message,
      details: error.response?.data || 'No additional details',
    });
  }
};
