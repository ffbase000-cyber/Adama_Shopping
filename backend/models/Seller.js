// models/Seller.js
const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  profilePic: { type: String },
  businessLicensePic: { type: String },
  otherDocPic: { type: String },
  bankAccountNumber: { type: String, required: true },
  bankAccountName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  // ✅ Added field for admin verification
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);
