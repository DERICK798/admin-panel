const db = require('../config/db');

exports.createOrder = async (req, res) => {
  console.log('REQ BODY:', req.body);

  const { phone, location, payment_method, products } = req.body;

  // validate
  if (!phone || !location || !payment_method || !products || products.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  try {
    // calculate total correctly
    const total = products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);

    const orderQuery = `
      INSERT INTO orders (phone, location, payment_method, total, status)
      VALUES (?, ?, ?, ?, ?)
    `;

    // 1. Save Order
    const [result] = await db.promise().query(orderQuery, [phone, location, payment_method, total, 'Pending']);
    const orderId = result.insertId;

    // 2. Prepare Items
    const items = products.map(p => [
      orderId,
      p.name || 'Unknown Product', // Safety check
      Number(p.price),
      Number(p.quantity)
    ]);

    const itemQuery = `
      INSERT INTO order_items (order_id, product_name, price, quantity)
      VALUES ?
    `;

    // 3. Save Items (Bulk Insert)
    if (items.length > 0) {
      await db.promise().query(itemQuery, [items]);
    }

    res.status(201).json({
      message: "Order placed successfully",
      orderId,
      total
    });
  } catch (err) {
    console.error('CREATE ORDER ERROR:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expecting 'Pending' or 'Delivered'

  const sql = 'UPDATE orders SET status = ? WHERE id = ?';

  try {
    await db.promise().query(sql, [status, id]);
    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error('UPDATE STATUS ERROR:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get Order Details
    const [orders] = await db.promise().query('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // 2. Get Products for this order
    const [items] = await db.promise().query('SELECT * FROM order_items WHERE order_id = ?', [id]);

    // 3. Combine and send
    order.items = items;
    res.json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().query('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const [results] = await db.promise().query("SELECT * FROM orders ORDER BY id DESC");
    res.json(results);
  } catch (err) {
    console.error('ORDERS FETCH ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};
