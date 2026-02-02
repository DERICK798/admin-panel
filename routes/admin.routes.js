const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // 1️⃣ Find admin by email
    const rows = await db.query('SELECT * FROM admins WHERE email = ?', [email]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    const admin = rows[0];

    // 2️⃣ Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      { id: admin.id },  // no role needed
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4️⃣ Return token
    res.json({ message: 'Admin login successful', token });

  } catch (err) {
    console.error('ADMIN LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
