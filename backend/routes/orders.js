const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const Post = require('../models/Post');

// =============================
// CREATE ORDER
// =============================
router.post('/', async (req, res) => {
  try {
    const {
      userId,           // buyer username
      postId,
      title,
      description,
      price,
      quantity,
      image,
      sellerUsername,   // seller username (from frontend)
      sellerFullName,
      sellerProfilePic
    } = req.body;

    if (!userId || !postId || !sellerUsername) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // ✅ Fetch seller info from database by username
    const seller = await Seller.findOne({ username: sellerUsername });
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found.' });
    }

    const sellerId = seller._id.toString();
    const bankAccountName = seller.bankAccountName || 'N/A';
    const bankAccountNumber = seller.bankAccountNumber || 'N/A';

    // ✅ Find post for optional validation
    const post = await Post.findById(postId);

    // ✅ Create order object
    const newOrder = new Order({
      userId, // buyer username
      postId,
      title: title || (post ? post.title : ''),
      description: description || (post ? post.description : ''),
      price: price || (post ? post.price : 0),
      quantity: quantity || 1,
      image: image || (post ? post.image : ''),
      sellerId,
      sellerUsername,
      sellerFullName,
      sellerProfilePic,
      sellerBankName: bankAccountName,
      sellerBankNumber: bankAccountNumber,
      status: 'pending',
      createdAt: new Date()
    });

    await newOrder.save();

    res.json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error creating order' });
  }
});

// =============================
// GET ALL ORDERS
// =============================
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// =============================
// GET ORDERS BY BUYER
// =============================
router.get('/buyer/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const orders = await Order.find({ userId: username }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({ error: 'Server error fetching buyer orders' });
  }
});

// =============================
// GET ORDERS BY SELLER
// =============================
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const orders = await Order.find({ sellerId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ error: 'Server error fetching seller orders' });
  }
});

// =============================
// UPDATE ORDER STATUS
// =============================
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error updating order status' });
  }
});

// =============================
// DELETE ORDER
// =============================
router.delete('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Server error deleting order' });
  }
});

module.exports = router;
