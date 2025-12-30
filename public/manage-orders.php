<?php
session_start();
require_once '../config/db.php'; // <-- CORRECT PATH NOW

// Check admin login
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit;
}

$stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC");
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Orders</title>
</head>
<body>

<h2>Customer Orders</h2>

<table border="1" cellpadding="10">
    <tr>
        <th>ID</th>
        <th>Phone</th>
        <th>Location</th>
        <th>Payment</th>
        <th>Status</th>
        <th>Date</th>
    </tr>

    <?php foreach ($orders as $o): ?>
    <tr>
        <td><?= $o['id'] ?></td>
        <td><?= htmlspecialchars($o['phone']) ?></td>
        <td><?= htmlspecialchars($o['address']) ?></td>
        <td><?= htmlspecialchars($o['payment_method']) ?></td>
        <td><?= $o['status'] ?></td>
        <td><?= $o['created_at'] ?></td>
    </tr>
    <?php endforeach; ?>

</table>

</body>
</html>
