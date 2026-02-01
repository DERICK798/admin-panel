require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const db = require('./config/db'); // ✅ import mysql2 connection

const app = express(); // MUST initialize app FIRST

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
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ SESSION
app.use(session({
  secret: '28805',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // ⚠ for localhost
}));

// ✅ STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= ROUTES =================
const orderRoutes = require('./routes/Orders.routes');
const authRoutes = require('./routes/Auth.routes');
const clientRoutes = require('./routes/client.routes');
const userRoutes = require('./routes/users.routes');
const productRoutes = require('./routes/products.routes');

app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// ================= SERVER =================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
