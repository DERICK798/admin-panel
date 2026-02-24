const db = require('../config/db'); 
const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.post('/', ordersController.createOrder);
router.get('/:id', authMiddleware, adminOnly, ordersController.getOrderById);
router.put('/:id/status', authMiddleware, adminOnly, ordersController.updateOrderStatus);
router.delete('/:id', authMiddleware, adminOnly, ordersController.deleteOrder);

// CLIENT ROUTE: Get my orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // 1. Get user's phone number from DB
    const [users] = await db.promise().query('SELECT phone FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const userPhone = users[0].phone;

    // 2. Find orders matching that phone number
    const [orders] = await db.promise().query('SELECT * FROM orders WHERE phone = ? ORDER BY created_at DESC', [userPhone]);
    res.json(orders);
  } catch (err) {
    console.error("MY ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    // Base queries
    let countQuery = "SELECT COUNT(*) AS total FROM orders";
    let dataQuery = "SELECT * FROM orders";
    let params = [];

    // Add Search Logic
    if (search) {
      const whereClause = " WHERE phone LIKE ? OR id LIKE ?";
      countQuery += whereClause;
      dataQuery += whereClause;
      params.push(`%${search}%`, `%${search}%`);
    }

    // count
    // We use the same params for count (if search exists)
    const [countRows] = await db.promise().query(countQuery, params);
    const total = countRows[0] ? countRows[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    // orders
    dataQuery += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [orders] = await db.promise().query(dataQuery, params);

    res.json({
      data: orders,
      page,
      totalPages,
      total
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to load orders",
      error: err.message
    });
  }
});

module.exports = router;
