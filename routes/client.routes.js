const express = require('express');
const router =express.Router();
const products = require('../controllers/product.controller');
const orders =require('../controllers/orders.controller');
const auth = require('../middleware/client.auth.middleware');

//public routes
router.get('/products', products.getALL);
router.get('/products/:id', products.getone);
    
//client actions
router.post('/orders',orders.create);

module.exports = router;