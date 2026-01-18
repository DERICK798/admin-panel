const db = require('../config/db');

/**
 * ADD PRODUCT (ADMIN)
 */
exports.addProduct = (req, res) => {
  const {
    name,
    category,
    description,
    price,
    price_per_kg,
    image,
    image2,
    status
  } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({
      message: 'Name, category and price are required'
    });
  }

  const sql = `
    INSERT INTO product
    (name, category, description, price, price_per_kg, image, image2, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    category,
    description || null,
    price,
    price_per_kg || null,
    image || null,
    image2 || null,
    status || 'active'
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to add product' });
    }

    res.status(201).json({
      message: 'Product added successfully',
      productId: result.insertId
    });
  });
};

/**
 * GET ALL PRODUCTS (CLIENT)
 */
exports.getALL = (req, res) => {
  db.query(
    "SELECT * FROM product WHERE status = 'active'",
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch products' });
      }
      res.json(results);
    }
  );
};

/**
 * GET ONE PRODUCT BY ID ✅
 */

/**
 * UPDATE PRODUCT (ADMIN)
 */
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    description,
    price,
    price_per_kg,
    image,
    image2,
    status
  } = req.body;

  const sql = `
    UPDATE product SET
      name = ?,
      category = ?,
      description = ?,
      price = ?,
      price_per_kg = ?,
      image = ?,
      image2 = ?,
      status = ?
    WHERE id = ?
  `;

  const values = [
    name,
    category,
    description,
    price,
    price_per_kg,
    image,
    image2,
    status,
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to update product' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  });
};

exports.getOne = (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT * FROM product WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch product' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(results[0]);
    }
  );
};

/**
 * DELETE PRODUCT (SOFT DELETE)
 */
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE product
    SET status = 'inactive'
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to delete product' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  });
};

exports.create = (req, res) => {
  const { name, category, price, description, image, image2 } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO products 
    (name, category, price, description, image, image2)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, category, price, description, image, image2], (err, result) => {
    if (err) {
      console.error("INSERT ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "Product added", id: result.insertId });
  });
};

