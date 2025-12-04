<?php 
include 'protect admin pags.php';
include '../config/db.php';
?>

<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard</title>
    <style>
        body {
            font-family: Arial;
            background: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .topbar {
            background: #111;
            color: white;
            padding: 15px;
            font-size: 20px;
        }
        .container {
            margin: 30px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-gap: 20px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 5px rgba(0,0,0,0.1);
            text-align: center;
        }
        .card h2 {
            margin: 0;
            font-size: 40px;
            color: #333;
        }
        .card p {
            font-size: 18px;
            color: #555;
        }
        a.btn {
            display: inline-block;
            margin-top: 10px;
            padding: 10px;
            background: #111;
            color: white;
            border-radius: 5px;
            text-decoration: none;
        }
    </style>
</head>
<body>

<div class="topbar">
    Welcome Admin | <a href="logout.php" style="color:red;">Logout</a>
</div>

<div class="container">

    <!-- Total Products -->
    <div class="card">
        <?php
        $q = mysqli_query($conn, "SELECT COUNT(*) AS total FROM products");
        $data = mysqli_fetch_assoc($q);
        ?>
        <h2><?php echo $data['total']; ?></h2>
        <p>Total Products</p>
        <a href="products.php" class="btn">Manage</a>
    </div>

    <!-- Total Orders -->
    <div class="card">
        <?php
        $q = mysqli_query($conn, "SELECT COUNT(*) AS total FROM orders");
        $data = mysqli_fetch_assoc($q);
        ?>
        <h2><?php echo $data['total']; ?></h2>
        <p>Total Orders</p>
        <a href="orders.php" class="btn">Manage</a>
    </div>

    <!-- Total Users -->
    <div class="card">
        <?php
        $q = mysqli_query($conn, "SELECT COUNT(*) AS total FROM users");
        $data = mysqli_fetch_assoc($q);
        ?>
        <h2><?php echo $data['total']; ?></h2>
        <p>Total Users</p>
        <a href="#" class="btn">View Users</a>
    </div>

    <!-- Total Sales -->
    <div class="card">
        <?php
        $q = mysqli_query($conn, "SELECT SUM(total_amount) AS sales FROM orders");
        $data = mysqli_fetch_assoc($q);
        ?>
        <h2>KES <?php echo $data['sales'] ?? 0; ?></h2>
        <p>Total Sales</p>
        <a href="orders.php" class="btn">View</a>
    </div>

</div>

</body>
</html>
