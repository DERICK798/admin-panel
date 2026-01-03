const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');

// products (client side)
router.get('/product', productController.getALL);
router.get('/product/:id', productController.getOne);

module.exports = router;
