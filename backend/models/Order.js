const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String },
  location: { type: String },

  // Buyer info
  userId: { type: String, required: true }, // buyer username

  // Seller info
  sellerId: { type: String, required: true },          // seller's user ID
  sellerUsername: { type: String, required: true },
  sellerFullName: { type: String, required: true },
  sellerProfilePic: { type: String, default: '/uploads/default-profile.png' },
  sellerBankName: { type: String, required: true },
  sellerBankNumber: { type: String, required: true },

  status: { type: String, default: 'pending' },         // order status
  createdAt: { type: Date, default: Date.now }          // timestamp
});

// Export the model (avoid overwriting if it already exists)
module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
