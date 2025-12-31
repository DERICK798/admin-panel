const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/Auth.routes');
const clientRoutes = require('./routes/client.routes');

app.use('/api/client', clientRoutes);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));

// serve frontend
app.use(express.static('public'));

// auth routes
app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
