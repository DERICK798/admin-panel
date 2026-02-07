const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

// admin routes
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, category, price, description, image, image2, quantity } = req.body;
    await db.promise().query(
      "INSERT INTO product (name, category, price, description, image, image2, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, category, price, description, image, image2, quantity]
    );
    res.status(201).json({ message: "Product added successfully" });
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, image, image2, quantity } = req.body;
    await db.promise().query(
      "UPDATE product SET name=?, category=?, price=?, description=?, image=?, image2=?, quantity=? WHERE id=?",
      [name, category, price, description, image, image2, quantity, id]
    );
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query("DELETE FROM product WHERE id = ?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    // Check if pagination is requested (Admin Dashboard)
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const [countRows] = await db.promise().query("SELECT COUNT(*) as total FROM product");
      const total = countRows[0] ? countRows[0].total : 0;
      const totalPages = Math.ceil(total / limit);

      const [products] = await db.promise().query(
        `SELECT * FROM product ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`
      );

      return res.json({
        data: products,
        page,
        totalPages,
        total
      });
    }

    // No pagination -> Client requesting all products
    const [products] = await db.promise().query("SELECT * FROM product ORDER BY id DESC");
    res.json(products);

  } catch (err) {
    console.error("PRODUCTS LOAD ERROR:", err);
    res.status(500).json({ message: "Failed to load products", error: err.message });
  }
});

module.exports = router;
