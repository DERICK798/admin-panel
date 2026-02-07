const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new admin (Use this to create your first admin)
router.post('/register', async (req, res) => {
  console.log("👉 Register Request:", req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("💾 Saving to DB...");
    await db.promise().query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);
    console.log("✅ Saved!");

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.error('ADMIN REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('STEP 1: BODY', req.body);

    const { email, password } = req.body;

    console.log('STEP 2: QUERY DB');
  const [rows] = await db.promise().query(
  'SELECT * FROM admins WHERE email = ?',
  [email]
);

    console.log('STEP 3: ROWS', rows);

    if (!rows.length) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    console.log('STEP 4: COMPARE PASSWORD');
    const isMatch = await bcrypt.compare(password, rows[0].password);

    console.log('STEP 5: PASSWORD MATCH?', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    console.log('STEP 6: GENERATE TOKEN');
    const token = jwt.sign(
      { id: rows[0].id, role: 'admin' },
      '28805',
      { expiresIn: '1d' }
    );

    console.log('STEP 7: SEND RESPONSE');
    return res.json({ token });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
