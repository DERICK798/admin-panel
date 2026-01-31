const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// REGISTER
router.post('/register', async (req, res) => {
  const { username, email, phone, password } = req.body;
  if (!username || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const db = req.db;

  try {
    // Check if email exists
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ? OR phone = ?', [email, phone]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    await db.promise().query(
      'INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)',
      [username, email, phone, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const db = req.db;

  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Send user data (without password)
    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
