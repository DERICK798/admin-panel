const express = require('express');
const stkPush = require('../services/mpesaStk');
const db = require('../config/db');
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

// Helper to convert M-Pesa date (YYYYMMDDHHmmss) to MySQL date (YYYY-MM-DD HH:mm:ss)
const formatMpesaDate = (dateStr) => {
  if (!dateStr) return null;
  const s = String(dateStr);
  return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)} ${s.substring(8, 10)}:${s.substring(10, 12)}:${s.substring(12, 14)}`;
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
        // Link Safaricom's CheckoutRequestID to our local Order ID
        await db.promise().query(
          'UPDATE orders SET checkoutRequestID = ? WHERE id = ?',
          [result.CheckoutRequestID, orderId]
        );

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

/**
 * M-Pesa Callback Handler
 * Safaricom hits this endpoint after the user interacts with the STK prompt.
 * Note: This URL must be publicly accessible (e.g., via Ngrok during development).
 */
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    console.log('📥 [M-Pesa Callback] Received Payload:', JSON.stringify(req.body, null, 2));

    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ message: 'Invalid callback payload' });
    }

    const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = Body.stkCallback;

    if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
      // Payment Successful
      const metadata = CallbackMetadata.Item;
      const amount = metadata.find(i => i.Name === 'Amount')?.Value;
      const receipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const phone = metadata.find(i => i.Name === 'PhoneNumber')?.Value;
      const transDate = metadata.find(i => i.Name === 'TransactionDate')?.Value;

      const formattedDate = formatMpesaDate(transDate);
      console.log(`✅ [M-Pesa Callback] SUCCESS: Order paid. Receipt: ${receipt}, ID: ${CheckoutRequestID}`);
      
      // Update database for successful payment
      await db.promise().query(
        'UPDATE orders SET status = ?, mpesaReceipt = ?, resultDesc = ?, transactionDate = ? WHERE checkoutRequestID = ?',
        ['Paid', receipt, ResultDesc, formattedDate, CheckoutRequestID]
      );
    } else {
      // Payment Failed (User cancelled, insufficient funds, timeout, etc.)
      console.log(` [M-Pesa Callback] FAILED: ${ResultDesc} (ResultCode: ${ResultCode}, ID: ${CheckoutRequestID})`);
      
      // Update database for failed payment
      await db.promise().query(
        'UPDATE orders SET status = ?, resultDesc = ? WHERE checkoutRequestID = ?',
        ['Failed', ResultDesc, CheckoutRequestID]
      );
    }

    // Safaricom expects a success response to acknowledge receipt of the callback
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    console.error(' [M-Pesa Callback] ERROR:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
