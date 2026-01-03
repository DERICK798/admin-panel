const db = require('../config/db');

// get all active products
exports.getALL = (req, res) => {
  db.query(
    'SELECT id, name, price, image FROM product WHERE status = "active"',
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(results);
    }
  );
};

// get one product
exports.getOne = (req, res) => {
  db.query(
    'SELECT * FROM product WHERE id = ?',
    [req.params.id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(results[0] || null);
    }
  );
};
