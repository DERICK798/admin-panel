const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// In-memory user storage (for demo; use DB in production)
let users = [];

// Load users from file if exists
const usersFile = path.join(__dirname, '..', 'users.json');
if (fs.existsSync(usersFile)) {
  users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}

// Register endpoint
router.post('/register', (req, res) => {
  const { username, email, phone, password } = req.body;

  if (!username || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if user exists
  const existing = users.find(u => u.email === email || u.phone === phone);
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = { id: Date.now(), username, email, phone, password };
  users.push(newUser);

  // Save to file
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.status(201).json({ message: 'User registered successfully' });
});

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email, phone: user.phone } });
});

module.exports = router;
