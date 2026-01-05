const db = require('../config/db');
const bcrypt = require('bcrypt');

// REGISTER
exports.register = async (req, res) => {
  const { name, phone, email, password } = req.body;

  if (!name || !phone || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)',
    [name, phone, email, hashedPassword],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User registered successfully' });
    }
  );
};

// LOGIN
exports.login = async (req, res) => {
  const { identifier, password } = req.body; // identifier = email OR phone

  if (!identifier || !password)
    return res.status(400).json({ message: 'All fields are required' });

  db.query(
    'SELECT * FROM users WHERE email=? OR phone=?',
    [identifier, identifier],
    async (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0)
        return res.status(401).json({ message: 'User not found' });

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match)
        return res.status(401).json({ message: 'Incorrect password' });

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      };

      res.json({
        message: 'Login successful',
        user: req.session.user
      });
    }
  );
};
