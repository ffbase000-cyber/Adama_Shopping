// scripts/create-admin-from-env.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin'); // make sure this path is correct

async function run() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Hash the password from .env
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    // Create or update admin
    const admin = await Admin.findOneAndUpdate(
      { username: process.env.ADMIN_USERNAME },
      {
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        fullName: 'Site Admin',
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin created/updated:', admin.username);
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
}

run();
