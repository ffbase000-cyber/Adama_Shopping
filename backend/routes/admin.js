const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Seller = require('../models/Seller');

// GET all users and sellers
router.get('/verify-list', async (req, res) => {
  try {
    const users = await User.find({}, 'username isVerified createdAt');
    const sellers = await Seller.find({}, 'username isVerified createdAt');
    res.json({ users, sellers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users/sellers' });
  }
});

// PUT / verify
router.put('/verify', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username }) || await Seller.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isVerified = true;
    await user.save();
    res.json({ message: `${username} verified successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying user' });
  }
});

// PUT / unverify
router.put('/unverify', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username }) || await Seller.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isVerified = false;
    await user.save();
    res.json({ message: `${username} unverified successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error unverifying user' });
  }
});

module.exports = router;
