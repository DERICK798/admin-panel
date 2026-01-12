const express = require('express');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/Auth.routes');
const clientRoutes = require('./routes/client.routes');
const userRoutes = require('./routes/users.routes');

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS (MUST be before routes)
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ SESSION (ONCE only)
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false   // ❗ false for localhost (HTTP)
  }
}));

// static files (optional)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const orderRoutes = require('./routes/Orders.routes');
app.use('/api/orders', orderRoutes);



// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/users', userRoutes);

// ================= SERVER =================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
