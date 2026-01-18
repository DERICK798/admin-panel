const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ✅ ADD THIS
const productController = require('../controllers/product.controller');

// products (client side)
router.get('/products', productController.getALL);
router.get('/products/:id', productController.getOne);
router.post('/products', productController.create);
router.put('/products/:id', productController.updateProduct);
module.exports = router;
