const db = require('../config/db');

exports.createOrder = (req, res) => {
  const { phone, location, payment_method, products } = req.body;

  if (!phone || !location || !products || products.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  let total = 0;
  products.forEach(p => {
    total += p.price * p.quantity;
  });

  const orderQuery = `
    INSERT INTO orders (phone, location, payment_method, total)
    VALUES (?, ?, ?, ?)
  `;

  db.query(orderQuery, [phone, location, payment_method, total], (err, result) => {
    if (err) return res.status(500).json(err);

    const orderId = result.insertId;

    const items = products.map(p => [
      orderId,
      p.name,
      p.price,
      p.quantity
    ]);

    const itemsQuery = `
      INSERT INTO order_items (order_id, product_name, price, quantity)
      VALUES ?
    `;

    db.query(itemsQuery, [items], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Order created', orderId });
    });
  });
};

exports.getOrders = (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};
