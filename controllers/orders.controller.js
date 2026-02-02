const db = require('../config/db');

exports.createOrder = (req, res) => {
  console.log('REQ BODY:', req.body);

  const { phone, location, payment_method, products } = req.body;

  // validate
  if (!phone || !location || !payment_method || !products || products.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  // calculate total correctly
  const total = products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);

  const orderQuery = `
    INSERT INTO orders (phone, location, payment_method, total)
    VALUES (?, ?, ?, ?)
  `;

  db.query(orderQuery, [phone, location, payment_method, total], (err, result) => {
    if (err) {
      console.error('ORDER INSERT ERROR:', err);
      return res.status(500).json({ message: 'Failed to insert order', error: err });
    }

    const orderId = result.insertId;

    // map order items
    const items = products.map(p => [
      orderId,
      p.name,
      Number(p.price),
      Number(p.quantity)
    ]);

    const itemQuery = `
  INSERT INTO order_items (order_id, product_name, price, quantity)
  VALUES (?, ?, ?, ?)
`;

products.forEach(p => {
  db.query(
    itemQuery,
    [
      orderId,
      p.name,
      Number(p.price),
      Number(p.quantity)
    ],
    (err2) => {
      if (err2) {
        console.error("ORDER ITEM INSERT ERROR:", err2);
      }
    }
  );
});

res.status(201).json({
  message: "Order placed successfully",
  orderId
});
  });
};

exports.deleteOrder = (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM orders WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete order' });
      }

      res.json({ message: 'Order deleted successfully' });
    }
  );
};

exports.getOrders = (req, res) => {
  db.query(
    "SELECT * FROM orders ORDER BY id DESC",
    (err, results) => {
      if (err) {
        console.error('ORDERS FETCH ERROR:', err);
        return res.status(500).json({ message: 'Failed to fetch orders' });
      }
      res.json(results);
    }
  );
};
