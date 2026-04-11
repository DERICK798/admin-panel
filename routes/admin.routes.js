const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

// Register new admin (Use this to create your first admin)
router.post('/register', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.error('ADMIN REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.promise().query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    // Use a generic error message to prevent user enumeration
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Restore session for server-side page protection in server.js
    req.session.admin = { id: rows[0].id, email: rows[0].email };

    const token = jwt.sign(
      { id: rows[0].id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ token });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get Dashboard Stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Get total users and count of users joined in the last 24 hours
    const [userStats] = await db.promise().query(`
      SELECT 
        COUNT(*) as total, 
        IFNULL(SUM(CASE WHEN created_at >= NOW() - INTERVAL 1 DAY THEN 1 ELSE 0 END), 0) as newToday 
      FROM users`);
    
    // Calculate stats while excluding cancelled orders from both the count and the revenue sum
    const statsQuery = `
      SELECT 
        COUNT(IF(LOWER(status) != 'cancelled', 1, NULL)) as total, 
        IFNULL(SUM(IF(LOWER(status) != 'cancelled', total, 0)), 0) as revenue,
        IFNULL(SUM(CASE WHEN created_at >= NOW() - INTERVAL 1 DAY AND status = 'Pending' THEN 1 ELSE 0 END), 0) as newToday
      FROM orders`;
    const [orderRows] = await db.promise().query(statsQuery);

    res.json({
      users: userStats[0].total,
      newUsersToday: userStats[0].newToday,
      orders: orderRows[0].total,
      revenue: orderRows[0].revenue,
      newOrdersToday: orderRows[0].newToday
    });
  } catch (err) {
    console.error('STATS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;
