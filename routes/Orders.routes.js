const db = require('../config/db'); // ✅ ADD THIS
const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');

router.post('/', ordersController.createOrder);
router.get('/', ordersController.getOrders); // admin

module.exports = router;
