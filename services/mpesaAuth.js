const axios = require('axios');

async function getMpesaAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  const auth = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString('base64');

  console.log('🔑 [M-Pesa Auth] Requesting Access Token...');
  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    console.log('✅ [M-Pesa Auth] Token received successfully.');
    return response.data.access_token;
    
  } catch (error) {
    console.error('❌ MPESA AUTH ERROR:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
}

module.exports = getMpesaAccessToken;
