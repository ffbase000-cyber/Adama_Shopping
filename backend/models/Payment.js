const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  buyerUsername: { type: String, required: true },
  buyerFullName: { type: String, required: true },
  buyerProfilePic: { type: String, default: '/uploads/default-profile.png' },
  
  sellerUsername: { type: String, required: true },
  sellerBankName: { type: String, required: true },
  sellerBankNumber: { type: String, required: true },

  userBankName: { type: String, required: true },
  userBankNumber: { type: String, required: true },

  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderTitle: { type: String, required: true },
  orderDescription: { type: String },
  orderImage: { type: String, default: '/uploads/default-profile.png' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
