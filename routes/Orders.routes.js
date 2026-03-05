const db = require('../config/db'); 
const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.post('/', ordersController.createOrder);

// CLIENT ROUTE: Get my orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // A smaller limit for profile page
    const offset = (page - 1) * limit;

    // 1. Get user's phone number from DB
    const [users] = await db.promise().query('SELECT phone FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const userPhone = users[0].phone;

    // 2. Get total count of orders for that phone number
    const [countRows] = await db.promise().query('SELECT COUNT(*) as total FROM orders WHERE phone = ?', [userPhone]);
    const total = countRows[0] ? countRows[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    // 3. Find paginated orders matching that phone number
    const [orders] = await db.promise().query(
      'SELECT * FROM orders WHERE phone = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userPhone, limit, offset]
    );

    res.json({ data: orders, page, totalPages, total });
  } catch (err) {
    console.error("MY ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

router.get('/:id', authMiddleware, adminOnly, ordersController.getOrderById);
router.put('/:id/status', authMiddleware, adminOnly, ordersController.updateOrderStatus);
router.delete('/:id', authMiddleware, adminOnly, ordersController.deleteOrder);

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
    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    // Add limit and offset to the parameters array for safe querying
    const finalParams = [...params, limit, offset];
    const [orders] = await db.promise().query(dataQuery, finalParams);

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
