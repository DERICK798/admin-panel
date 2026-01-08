const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');

// products (client side)
router.get('/products', productController.getALL);
router.get('/products/:id', productController.getOne);

module.exports = router;
