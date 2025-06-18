// /api/google-reviews.js
// Simplified version using direct REST API calls

const { google } = require('googleapis');

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

    // Create JWT auth client
    const auth = new google.auth.JWT({
      email: process.env.CLIENT_EMAIL,
      key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/business.manage']
    });

    // Get access token
    const tokens = await auth.authorize();
    
    // Use My Business API v4 (still supported for reviews)
    const reviewsUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
    
    const response = await fetch(reviewsUrl, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Google API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      reviews: data.reviews || [],
      totalReviews: data.totalReviewCount || 0,
      nextPageToken: data.nextPageToken || null
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
};
