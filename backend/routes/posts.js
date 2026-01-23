const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Seller = require('../models/Seller');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Create post
router.post('/create', upload.single('image'), [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('location').notEmpty(),
  body('price').notEmpty(),
  body('username').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, description, importantInfo, location, price, username } = req.body;
    let user = await User.findOne({ username }) || await Seller.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (!user.isVerified) return res.status(403).json({ error: 'You must be verified by admin to post' });

    const newPost = new Post({
      title, description, importantInfo, location, price, userId: username,
      posterProfilePic: user.profilePic || '/uploads/default-profile.png',
      image: req.file ? '/uploads/' + req.file.filename : null
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Could not create post.' });
  }
});

// Get posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const populatedPosts = await Promise.all(posts.map(async post => {
      let user = await User.findOne({ username: post.userId }) || await Seller.findOne({ username: post.userId });
      return { ...post._doc, posterUsername: user?.username || post.userId, posterProfilePic: user?.profilePic || '/uploads/default-profile.png' };
    }));
    res.json({ posts: populatedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Could not fetch posts.' });
  }
});

// Update post
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, importantInfo, location, price, username } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== username) return res.status(403).json({ error: 'You are not authorized to edit this post' });

    post.title = title || post.title;
    post.description = description || post.description;
    post.importantInfo = importantInfo || post.importantInfo;
    post.location = location || post.location;
    post.price = price || post.price;

    await post.save();
    res.json({ message: 'Post updated successfully', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Could not update post.' });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== username) return res.status(403).json({ error: 'You are not authorized to delete this post' });

    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Could not delete post.' });
  }
});

module.exports = router;
