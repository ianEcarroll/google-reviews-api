const { google } = require('googleapis');
const fetch = require('node-fetch'); // must be added to package.json

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed – use POST' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { accountId, locationId } = body;

    if (!accountId || !locationId) {
      return res.status(400).json({
        error: 'Missing required fields: accountId and locationId',
      });
    }

    const jwtClient = new google.auth.JWT({
      email: process.env.CLIENT_EMAIL,
      key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/business.manage'],
    });

    await jwtClient.authorize();

    const parent = `accounts/${accountId}/locations/${locationId}`;

    const response = await fetch(`https://mybusiness.googleapis.com/v4/${parent}/reviews`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtClient.credentials.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Google API error:", data);
      return res.status(500).json({
        error: 'Failed to fetch reviews',
        message: data.error?.message || 'Unknown error',
        details: data,
      });
    }

    console.log("✅ Google Reviews response:", JSON.stringify(data, null, 2));

    return res.status(200).json({
      success: true,
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      totalReviews: data.totalReviewCount || 0,
    });
  } catch (error) {
    console.error('❌ Fetch reviews error:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch reviews',
      message: error.message,
      details: error.stack || 'No additional details',
    });
  }
};
