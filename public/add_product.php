<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit;
}

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name  = $_POST['name'];
    $price = $_POST['price'];

    // IMAGE UPLOAD
    $imageName = null;
    if (!empty($_FILES['image']['name'])) {
        $imageName = time() . "_" . $_FILES['image']['name'];
        move_uploaded_file(
            $_FILES['image']['tmp_name'],
            "../uploads/" . $imageName
        );
    }

    $stmt = $pdo->prepare(
        "INSERT INTO products (name, price, image) VALUES (?, ?, ?)"
    );
    $stmt->execute([$name, $price, $imageName]);

    header("Location: manage-products.php");
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Add Product</title>
</head>
<style>
    body{
        font:Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0px;
        padding: 20px;
        display:flex;
        flex-direction: column;
        
    }
</style>
<body>

<h2>Add Product</h2>

<form method="POST" enctype="multipart/form-data">
    <input type="text" name="name" placeholder="Product name" required><br><br>
    <input type="number" name="price" placeholder="Price" step="0.01" required><br><br>
    <input type="file" name="image"><br><br>
    <button type="submit">Save Product</button>
</form>

<a href="manage-products.php">← Back</a>

</body>
</html>
