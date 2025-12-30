const { query } = require('../config/db');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const results = await query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // compare password (kama ni hashed)
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // session (optional)
    req.session.user = {
      id: user.id,
      email: user.email
    };

    res.json({ message: 'Login successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
