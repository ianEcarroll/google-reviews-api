// /api/google-reviews.js
// Using Business Profile Performance API

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
    
    // Try the My Business API v4 first (for reviews)
    const reviewsUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
    
    const response = await fetch(reviewsUrl, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    // If My Business API fails, try Business Profile Performance API
    if (!response.ok && response.status === 403) {
      // Business Profile Performance API doesn't directly provide reviews
      // It provides metrics about reviews
      const metricsUrl = `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:getDailyMetricsTimeSeries`;
      
      const metricsResponse = await fetch(metricsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dailyMetric: 'CALL_CLICKS',
          dailyRange: {
            startDate: {
              year: 2024,
              month: 1,
              day: 1
            },
            endDate: {
              year: 2024,
              month: 12,
              day: 31
            }
          }
        })
      });

      if (!metricsResponse.ok) {
        const errorData = await metricsResponse.text();
        throw new Error(`Business Profile API error (${metricsResponse.status}): ${errorData}`);
      }

      const metricsData = await metricsResponse.json();
      
      // Since we can't get reviews directly, return metrics
      return res.status(200).json({
        success: true,
        message: 'Business Profile Performance API provides metrics, not reviews directly',
        metrics: metricsData,
        note: 'To get reviews, you may need to use the My Business API or scrape from Google Maps'
      });
    }

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
      error: 'Failed to fetch reviews
