const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const fetch = require('node-fetch'); // or global fetch if Node >=18

require('dotenv').config();
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

// -------------------------------
// Create a new payment (store buyer info)
// -------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      buyerUsername,
      buyerFullName,
      buyerProfilePic,
      sellerUsername,
      sellerBankName,
      sellerBankNumber,
      userBankName,
      userBankNumber,
      orderId,
      orderTitle,
      orderDescription,
      orderImage
    } = req.body;

    if (!buyerUsername || !buyerFullName || !sellerUsername || !sellerBankName || !sellerBankNumber || !userBankName || !userBankNumber || !orderId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Ensure order exists
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const newPayment = new Payment({
      buyerUsername,
      buyerFullName,
      buyerProfilePic: buyerProfilePic || '/uploads/default-profile.png',
      sellerUsername,
      sellerBankName,
      sellerBankNumber,
      userBankName,
      userBankNumber,
      orderId,
      orderTitle,
      orderDescription,
      orderImage
    });

    await newPayment.save();
    res.status(201).json({ message: 'Payment saved successfully', payment: newPayment });

  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ error: 'Server error while creating payment' });
  }
});

// -------------------------------
// Initialize real Chapa/Telebirr payment
// -------------------------------
router.post('/pay', async (req, res) => {
  try {
    const { orderId, amount, buyerEmail, buyerFullName } = req.body;
    if (!orderId || !amount) return res.status(400).json({ error: 'Missing required fields' });

    // Create unique tx_ref
    const tx_ref = `order_${orderId}_${Date.now()}`;

    // Initialize transaction with Chapa
    const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`
      },
      body: JSON.stringify({
        amount,
        currency: 'ETB',
        tx_ref,
        email: buyerEmail,
        first_name: buyerFullName,
        callback_url: `https://adama-shopping-20ij.onrender.com/payment-success.html?orderId=${orderId}&tx_ref=${tx_ref}`
      })
    });

    const data = await response.json();

    if (!data.status || data.status !== 'success') {
      console.error('Chapa error:', data);
      return res.status(400).json({ error: data.message || 'Payment initialization failed' });
    }

    res.json({ checkout_url: data.data.checkout_url });

  } catch (err) {
    console.error('Error initializing Chapa payment:', err);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// -------------------------------
// Verify payment by tx_ref and update order status
// -------------------------------
router.get('/verify/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;
    if (!tx_ref) return res.status(400).json({ error: 'Transaction reference is required' });

    // Call Chapa verify endpoint
    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` }
    });

    const data = await response.json();

    if (!data.status || data.status !== 'success') {
      return res.status(400).json({ error: data.message || 'Payment not verified yet' });
    }

    const metadata = data.data.meta; // Chapa metadata
    const orderId = metadata.orderId; // Ensure your tx_ref contains orderId

    // Update order status in DB
    const order = await Order.findByIdAndUpdate(orderId, { status: 'paid' }, { new: true });

    res.json({ message: 'Payment verified', order });

  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: 'Server error verifying payment' });
  }
});

// -------------------------------
// Get payments for a specific seller
// -------------------------------
router.get('/seller/:sellerUsername', async (req, res) => {
  try {
    const { sellerUsername } = req.params;
    const payments = await Payment.find({ sellerUsername }).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Server error while fetching payments' });
  }
});

module.exports = router;
