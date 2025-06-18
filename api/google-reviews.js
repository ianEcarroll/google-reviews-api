// /api/google-reviews.js
// Using CommonJS syntax for Vercel

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

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/business.manage'],
    });

    const authClient = await auth.getClient();
    
    // Get access token
    const accessToken = await authClient.getAccessToken();

    // Fetch reviews
    const response = await fetch(
      `https://mybusinessaccountmanagement.googleapis.com/v1/accounts/${accountId}/locations/${locationId}/reviews`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reviews = await response.json();

    return res.status(200).json(reviews);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch reviews',
      details: error.message 
    });
  }
}

// package.json
{
  "name": "google-reviews-api",
  "version": "1.0.0",
  "dependencies": {
    "googleapis": "^118.0.0"
  }
}
