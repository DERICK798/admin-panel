const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const productController = require('../controllers/product.controller');

// public routes (client)
router.get('/', productController.getALL);
router.get('/animal-feed', productController.getAnimalFeed);
router.get('/:id', productController.getOne);

// admin routes
router.post('/', authMiddleware, adminOnly, productController.addProduct);
router.put('/:id', authMiddleware, adminOnly, productController.updateProduct);
router.delete('/:id', authMiddleware, adminOnly, productController.deleteProduct);

module.exports = router;
