const express = require('express');
const router = express.Router();
const clientAuth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const productController = require('../controllers/product.controller');

// client routes
router.get('/', productController.getALL);
router.get('/:id', productController.getOne);

// admin routes
router.post('/', clientAuth, adminOnly, productController.addProduct);
router.put('/:id', clientAuth, adminOnly, productController.updateProduct);
router.delete('/:id', clientAuth, adminOnly, productController.deleteProduct);

module.exports = router;
