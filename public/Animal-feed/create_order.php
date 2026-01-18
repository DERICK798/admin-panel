<?php
require_once __DIR__ . '/../admin-panel/config/db.php';



// Get data from AJAX
$phone = $_POST['phone'] ?? '';
$location = $_POST['location'] ?? '';
$payment = $_POST['payment'] ?? '';

if (!$phone || !$location || !$payment) {
    exit("Error: Missing fields");
}

// Insert into database
$stmt = $pdo->prepare("INSERT INTO orders (phone, address, payment_method) 
VALUES (:p, :l, :m)");

$stmt->execute([
    'p' => $phone,
    'l' => $location,
    'm' => $payment
]);

echo "Order placed successfully!";
