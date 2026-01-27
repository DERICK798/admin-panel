const { query } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || '28805';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const results = await query('SELECT * FROM admins WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // SIGN JWT
    const token = jwt.sign(
      { id: user.id, role: 'admin' },  // always include role
      JWT_SECRET,
      { expiresIn: '1d' }             // optional expiry
    );

    // send token to frontend
    res.json({ token, role: 'admin' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
