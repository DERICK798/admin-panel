<?php
session_start();

// Only allow logged in admins
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dashboard</title>
<link rel="stylesheet" href="../css/style.css">
</head>
<body>
<h2>Welcome, <?php echo $_SESSION['admin']; ?>!</h2>
<span>agroGrow</span>

<a href="logout.php">Logout</a>
<a href="manage-products.php">Manage Products</a>
<a href="manage-orders.php">Manage Orders</a>
<a href="manage-users.php">Manage Users</a>
</body>
</html>
