const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    'SELECT id, name, price, image FROM products WHERE status="active"',
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

exports.getOne = (req, res) => {
  db.query(
    'SELECT * FROM products WHERE id=?',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results[0]);
    }
  );
};
