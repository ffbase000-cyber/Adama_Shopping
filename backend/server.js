require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
const sharp = require('sharp'); // Image handling

// ---------------------
// Routes
// ---------------------
const usersRoute = require('./routes/users');
const sellersRoute = require('./routes/sellers');
const postsRoute = require('./routes/posts');
const ordersRoute = require('./routes/orders');
const paymentsRoute = require('./routes/payments'); // Added for payment functionality
const adminRoute = require('./routes/admin'); // Added for admin functionality
const chapaRoute = require('./routes/chapa'); // Added Chapa route

const app = express();

// ---------------------
// Security Middleware
// ---------------------
app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://adama-shopping-20ij.onrender.com"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      scriptSrcAttr: ["'none'"],
      upgradeInsecureRequests: []
    }
  })
);

app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin' }));
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-origin' }));
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: 'none' }));

// ---------------------
// General Middleware
// ---------------------
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create default profile image if it doesn't exist
const defaultProfilePath = path.join(uploadsDir, 'default-profile.png');
if (!fs.existsSync(defaultProfilePath)) {
  sharp({
    create: {
      width: 200,
      height: 200,
      channels: 4,
      background: { r: 220, g: 220, b: 220, alpha: 1 }
    }
  })
    .png()
    .toFile(defaultProfilePath)
    .then(() => console.log('✅ Default profile picture created'))
    .catch(err => console.error('❌ Error creating default profile picture', err));
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// ---------------------
// API Routes
// ---------------------
app.use('/api/users', usersRoute);
app.use('/api/sellers', sellersRoute);
app.use('/api/posts', postsRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/payments', paymentsRoute);
app.use('/api/admin', adminRoute);
app.use('/chapa', chapaRoute); // Added Chapa payment route

// ---------------------
// Serve Frontend
// ---------------------
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ---------------------
// MongoDB Connection
// ---------------------
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
