const axios = require('axios');
const getToken = require('./mpesaAuth');

module.exports = async function stkPush(phone, amount, orderId) {
  console.log(`🚀 [STK Push] Initiating for Phone: ${phone}, Amount: ${amount}, Order: ${orderId}`);

  const shortCode = process.env.MPESA_SHORTCODE;
  const passKey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  if (!shortCode || !passKey || !callbackUrl) {
    throw new Error('M-Pesa environment variables (SHORTCODE, PASSKEY, or CALLBACK_URL) are missing.');
  }

  // Ensure phone is in format 2547XXXXXXXX
  let formattedPhone = String(phone).replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
  if (formattedPhone.startsWith('7')) formattedPhone = '254' + formattedPhone;

  const token = await getToken();

  // Generate robust timestamp: YYYYMMDDHHMMSS (ISO format is reliable across environments)
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

  // Generate password
  const password = Buffer.from(
    process.env.MPESA_SHORTCODE +
    process.env.MPESA_PASSKEY +
    timestamp
  ).toString('base64');

  console.log("Timestamp:", timestamp);
  console.log("Password:", password);

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: `ORDER-${orderId}`,
    TransactionDesc: 'Order Payment'
  };

  console.log(' [STK Push] Sending Payload:', { ...payload, Password: '***HIDDEN***' });

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(' [STK Push] Response:', response.data);
    return response.data;
  } catch (error) {
    const errorDetail = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(' [STK Push] Error:', errorDetail);
    throw error;
  }
};
