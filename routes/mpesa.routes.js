const express = require('express');
const stkPush = require('../services/mpesaStk');
const router = express.Router();

// Helper to format phone number to 254... format
const normalizePhoneNumber = (phone) => {
  if (phone.startsWith('+254')) {
    return phone.substring(1);
  }
  if (phone.startsWith('0')) {
    return '254' + phone.substring(1);
  }
  return phone; // Assume it's already in 254... format
};

router.post('/pay', async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    console.log('📥 [M-Pesa Route] Received payment request:', { phone, amount, orderId });

    if (!phone || !amount || !orderId) {
      return res.status(400).json({ message: 'Missing required payment data: phone, amount, and orderId.' });
    }

    // Validate amount
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: 'Invalid amount. Must be a number greater than 0.' });
    }

    const formattedPhone = normalizePhoneNumber(phone);
    console.log(`📞 [M-Pesa Route] Normalized Phone: ${phone} -> ${formattedPhone}`);

    const result = await stkPush(formattedPhone, numericAmount, orderId);
    console.log('📤 [M-Pesa Route] STK Push Result:', result);

    // The M-Pesa API returns a ResponseCode. '0' means the request was accepted.
    if (result.ResponseCode === '0') {
        res.json({
            message: 'STK Push sent successfully. Please check your phone to complete the payment.',
            result
        });
    } else {
        // If the API call was accepted but resulted in an error (e.g., invalid phone)
        res.status(400).json({
            message: 'STK Push failed.',
            error: result.ResponseDescription,
            result
        });
    }
  } catch (err) {
    console.error('MPESA PAY ERROR:', err);
    const errorMessage = err.response?.data?.errorMessage || err.message;
    res.status(500).json({ message: 'An error occurred while initiating the payment.', error: errorMessage });
  }
});

module.exports = router;
