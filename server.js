const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express(); // ✅ MUST BE HERE

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
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// ✅ STATIC FILES (VERY IMPORTANT)
app.use(express.static(path.join(__dirname, 'public')));

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
