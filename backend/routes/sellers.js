const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://adama-shopping-19bf.onrender.com';

// Multer setup for multiple file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads'); // Save files in backend/public/uploads
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
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
    body('fullName').notEmpty().withMessage('Full Name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('bankAccountNumber').notEmpty().withMessage('Bank account number is required'),
    body('bankAccountName').notEmpty().withMessage('Bank account name is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if username already exists
      const existingSeller = await Seller.findOne({ username: req.body.username });
      if (existingSeller) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      // Create new seller
      const newSeller = new Seller({
        fullName: req.body.fullName,
        username: req.body.username,
        phone: req.body.phone,
        password: hashedPassword,
        profilePic: req.files.profilePic
          ? `${BASE_URL}/uploads/${req.files.profilePic[0].filename}`
          : null,
        businessLicensePic: req.files.businessLicensePic
          ? `${BASE_URL}/uploads/${req.files.businessLicensePic[0].filename}`
          : null,
        otherDocPic: req.files.otherDocPic
          ? `${BASE_URL}/uploads/${req.files.otherDocPic[0].filename}`
          : null,
        bankAccountNumber: req.body.bankAccountNumber,
        bankAccountName: req.body.bankAccountName,
        description: '' // initialize empty description
      });

      await newSeller.save();

      res.status(201).json({
        message: 'Seller registered successfully',
        seller: {
          fullName: newSeller.fullName,
          username: newSeller.username,
          phone: newSeller.phone,
          profilePic: newSeller.profilePic,
          businessLicensePic: newSeller.businessLicensePic,
          otherDocPic: newSeller.otherDocPic,
          description: newSeller.description,
          bankAccountNumber: newSeller.bankAccountNumber,
          bankAccountName: newSeller.bankAccountName
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Seller Login
router.post('/login', async (req, res) => {
  try {
    const { fullName, username, password } = req.body;

    const seller = await Seller.findOne({ username, fullName });
    if (!seller) return res.status(400).json({ error: 'Invalid full name or username' });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    // Send all seller info safely
    res.json({ 
      message: 'Login successful', 
      seller: {
        fullName: seller.fullName,
        username: seller.username,
        phone: seller.phone,
        profilePic: seller.profilePic || null,
        businessLicensePic: seller.businessLicensePic || null,
        otherDocPic: seller.otherDocPic || null,
        description: seller.description,
        bankAccountNumber: seller.bankAccountNumber,
        bankAccountName: seller.bankAccountName
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET seller info by username (for sellerProfile.html)
router.get('/:username', async (req, res) => {
  try {
    const seller = await Seller.findOne({ username: req.params.username });
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    res.json({
      fullName: seller.fullName,
      username: seller.username,
      profilePic: seller.profilePic || null,
      businessLicensePic: seller.businessLicensePic || null,
      otherDocPic: seller.otherDocPic || null,
      description: seller.description || '',
      bankAccountName: seller.bankAccountName,
      bankAccountNumber: seller.bankAccountNumber
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ PUT route to update seller description
router.put('/:username/description', async (req, res) => {
  try {
    const { description } = req.body;
    const seller = await Seller.findOneAndUpdate(
      { username: req.params.username },
      { description },
      { new: true }
    );

    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    res.json({
      message: 'Description updated successfully',
      description: seller.description
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
