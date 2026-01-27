const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || '28805';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check header exists
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Check Bearer format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid authorization format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // decoded must contain role
    if (!decoded || !decoded.role) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({
      message: err.name === 'TokenExpiredError'
        ? 'Token expired, please login again'
        : 'Invalid token'
    });
  }
};
