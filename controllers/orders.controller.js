exports.create = (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  db.query(
    'INSERT INTO orders (user_id, product_id, quantity, status) VALUES (?, ?, ?, "pending")',
    [user_id, product_id, quantity],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Order placed successfully' });
    }
  );
};
