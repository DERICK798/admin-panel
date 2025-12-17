<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: admin-login.php");
    exit;
}

require_once __DIR__ . '/../config/db.php';

// COUNT DATA
$products = $pdo->query("SELECT COUNT(*) AS total FROM products")->fetchColumn();
$orders   = $pdo->query("SELECT COUNT(*) AS total FROM orders")->fetchColumn();
$users    = $pdo->query("SELECT COUNT(*) AS total FROM users")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard</title>
<style>
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0px;
    padding: 20px;
    display:flex;
    flex-direction: column;
}
h2{
    font:30px Arial, sans-serif;
    color: #9c28e3ff;
    color-scheme: black white;

}
.sidebar{
    
    padding: 1rem 20px;
    width: 220px;
    background-color:yellow;
    height:100px;
    border-radius: 1px;
}
.sidebar ul {
  list-style-type: none;
  padding: 0;
}
.sidebar a:hover {
  background-color: #374151; /* darker hover */
  color: #fff;
}
.cards { display:flex; gap:20px; }
.card { background:#fff; padding:20px; border-radius:8px; width:200px; box-shadow:0 2px 5px rgba(0,0,0,.1); }

.logo {
    font-size: 24px;
    font-weight: bold;
    color: #9c28e3ff;
    margin-bottom: 20px;
}
.logo span {
    color: #cc5e0aff;
}
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
header .logo {
  font-size: 26px;
  font-weight: bold;
}
</style>
</head>
<body>
    <header>
<h2>Welcome, <?php echo htmlspecialchars($_SESSION['admin']); ?> 👋</h2>
<div class="logo"> Agro <span>grow</span></div>
</header>
<div class="sidebar">
    <ul>
<li><a href="logout.php">Logout</a></li>
<li><a href="manage-product.php">Manage Products</a></li>
<li><a href="add_product.php">add-Product</a></li>
<li><a href="manage-orders.php">Manage Orders</a></li>
<li><a href="manage-users.php">Manage Users</a></li>
</ul>
</div>
<div class="main-content">
<h1>Admin Dashboard</h1>
<div class="cards">
    <div class="card">
    <h3><?php echo $products; ?></h3>
    <p>Total Products</p>
</div>
    <div class="card">
    <h3><?php echo $orders; ?></h3>
    <p>Total Orders</p>
</div>
    <div class="card">
    <h3><?php echo $users; ?></h3>
    <p>Total Users</p>
</div>
</body>
</html>
