const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Seller = require('../models/Seller');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Signup route
router.post(
  '/signup',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'businessLicensePic', maxCount: 1 },
    { name: 'otherDocPic', maxCount: 1 }
  ]),
  [
    body('fullName').notEmpty(),
    body('username').notEmpty(),
    body('phone').notEmpty(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) return res.status(400).json({ error: 'Username already taken' });

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        fullName: req.body.fullName,
        username: req.body.username,
        phone: req.body.phone,
        password: hashedPassword,
        accountType: req.body.accountType || 'buyer',
        profilePic: req.files['profilePic'] ? '/uploads/' + req.files['profilePic'][0].filename : '/uploads/default-profile.png',
        bankAccountNumber: req.body.bankAccountNumber || '',
        bankAccountName: req.body.bankAccountName || ''
      });

      await newUser.save();

      res.status(201).json({
        message: 'User registered',
        user: {
          fullName: newUser.fullName,
          username: newUser.username,
          phone: newUser.phone,
          profilePic: newUser.profilePic
        }
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login route
router.post('/login', async (req, res) => {
  try {
    const { fullName, username, password } = req.body;
    const user = await User.findOne({ username, fullName });
    if (!user) return res.status(400).json({ error: 'Invalid full name or username' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    res.json({
      message: 'Login successful',
      info: {
        fullName: user.fullName,
        username: user.username,
        phone: user.phone,
        profilePic: user.profilePic,
        accountType: user.accountType,
        bankAccountNumber: user.bankAccountNumber,
        bankAccountName: user.bankAccountName,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get single user info by username (for post.html verification)
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }) || await Seller.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic || '/uploads/default-profile.png',
      isVerified: user.isVerified || false,
      accountType: user.accountType || 'buyer'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
