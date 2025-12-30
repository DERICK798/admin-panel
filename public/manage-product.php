<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit;
}

require_once __DIR__ . '/../config/db.php';

$products = $pdo->query("SELECT * FROM products ORDER BY created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html>
<head>
<title>Manage Product</title>
<style>
table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
}
th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
}
th {
    background: #2e7d32;
    color: #fff;
}
img {
    width: 60px;
}
.actions a {
    margin: 0 5px;
    text-decoration: none;
    color: red;
}
.add {
    display: inline-block;
    margin-bottom: 15px;
    background: #2e7d32;
    color: #fff;
    padding: 8px 12px;
    text-decoration: none;
    border-radius: 5px;
}
</style>
</head>
<body>

<h2>Manage Products</h2>

<a class="add" href="add-product.php">+ Add Product</a>

<table>
<tr>
    <th>ID</th>
    <th>Image</th>
    <th>Name</th>
    <th>Price (KES)</th>
    <th>Action</th>
</tr>

<?php if (count($products) > 0): ?>
<?php foreach ($products as $p): ?>
<tr>
    <td><?= $p['id']; ?></td>
    <td>
        <?php if ($p['image']): ?>
            <img src="../uploads/<?= $p['image']; ?>">
        <?php endif; ?>
    </td>
    <td><?= htmlspecialchars($p['name']); ?></td>
    <td><?= number_format($p['price'], 2); ?></td>
    <td class="actions">
        <a href="delete-product.php?id=<?= $p['id']; ?>"
           onclick="return confirm('Delete this product?')">
           Delete
        </a>
    </td>
</tr>
<?php endforeach; ?>
<?php else: ?>
<tr><td colspan="5">No products found</td></tr>
<?php endif; ?>

</table>

</body>
</html>
