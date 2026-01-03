const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/Auth.routes');
const clientRoutes = require('./routes/client.routes');

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));

// static files
app.use(express.static('public'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
