const db = require('../config/db');
const bcrypt = require('bcrypt');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, phone, email, password } = req.body;

    if (!username || !phone || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (username, phone, email, password) VALUES (?, ?, ?, ?)',
      [username, phone, email, hashedPassword],
      (err) => {
        if (err) {
          // ✅ HANDLE DUPLICATE EMAIL
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
              message: 'Email already registered'
            });
          }

          console.error(err);
          return res.status(500).json({
            message: 'Server error'
          });
        }

        // ✅ ALWAYS RESPOND
        return res.status(201).json({
          success: true,
          message: 'User registered successfully'
        });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// LOGIN
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  db.query(
    'SELECT * FROM users WHERE email=? OR phone=?',
    [identifier, identifier],
    async (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      if (results.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      req.session.user = {
        id: user.id,
        username: user.username, // ✅ FIXED
        email: user.email,
        phone: user.phone
      };

      return res.json({
        success: true,
        message: 'Login successful',
        user: req.session.user
      });
    }
  );
};
