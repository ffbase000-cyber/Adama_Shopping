const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  importantInfo: { type: String },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String }, // Post image
  userId: { type: String, required: true }, // username of poster
  posterProfilePic: { type: String }, // Profile pic of poster
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
