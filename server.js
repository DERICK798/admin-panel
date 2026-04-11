require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const db = require('./config/db'); // import mysql2 connection

// ✅ Security Check: Ensure essential environment variables are set
if (!process.env.SESSION_SECRET || !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: SESSION_SECRET and JWT_SECRET must be set in the environment.');
  process.exit(1); // Exit the process with an error code
}

const app = express(); // MUST initialize app FIRST

// ✅ Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Created uploads directory');
}

// ✅ Attach DB to req
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5500',
     'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ SESSION
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevents client-side JS from reading the cookie
    sameSite: 'lax' // Protects against CSRF
  }
}));

// ✅ STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= PAGE SERVING ROUTES =================

// Middleware to check if admin is authenticated
const isAuthenticated = (req, res, next) => {
  // Check if the admin object is set in the session
  if (req.session && req.session.admin) {
    return next(); // If authenticated, proceed to the next middleware/route handler
  }
  // If not authenticated, redirect to the login page
  res.redirect('/admin-login');
};

// Protected route to serve the dashboard page
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Route to serve the login page
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Logout route
app.get('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin-login');
  });
});

// ================= ROUTES =================
const orderRoutes = require('./routes/orders.routes');
const adminRoutes = require('./routes/admin.routes');
const clientRoutes = require('./routes/client.routes');
const userRoutes = require('./routes/users.routes');
const productRoutes = require('./routes/products.routes');

app.use('/api/mpesa', require('./routes/mpesa.routes'));

app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Redirect root URL to /admin-login
app.get('/', (req, res) => {
  res.redirect('/admin-login');
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// ================= SERVER =================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
