// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  profilePic: { type: String },
  createdAt: { type: Date, default: Date.now },

  // ✅ Added field for admin verification
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
