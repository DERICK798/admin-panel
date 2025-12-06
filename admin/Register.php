<?php
// Enable errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include '../config/db.php';

$error = "";
$success = "";

// Form submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $confirm = $_POST['confirm'];

    // Basic validation
    if ($password !== $confirm) {
        $error = "Passwords do not match";
    } else {
        // Check if username already exists
        $stmt = $conn->prepare("SELECT id FROM admins WHERE username=? LIMIT 1");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result && $result->num_rows > 0) {
            $error = "Username already taken";
        } else {
            // Hash password
            $hash = password_hash($password, PASSWORD_DEFAULT);

            // Insert into DB
            $stmt2 = $conn->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
            $stmt2->bind_param("ss", $username, $hash);
            if ($stmt2->execute()) {
                // Set session and redirect to dashboard
                $_SESSION['admin'] = $username;
                $_SESSION['admin_id'] = $stmt2->insert_id;

                header("Location: dashboard.php");
                exit;
            } else {
                $error = "Database insert error: ".$stmt2->error;
            }
        }
        $stmt->close();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Register</title>
<style>
body { font-family: Arial; background:#f5f5f5;}
main { display:flex; justify-content:center; align-items:center; height:100vh;}
.card { background:#fff; padding:30px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1); width:300px;}
input { width:100%; padding:8px; margin:5px 0 15px; border-radius:5px; border:1px solid #ccc; }
button { width:100%; padding:10px; border:none; border-radius:5px; background:#28a745; color:#fff; font-size:16px; cursor:pointer;}
button:hover { background:#218838; }
.error { color:red; font-size:14px; }
.success { color:green; font-size:14px; }
</style>
</head>
<body>
<main>
<section class="card">
<h1>Admin Register</h1>
<?php 
if($error != "") { echo "<p class='error'>$error</p>"; }
if($success != "") { echo "<p class='success'>$success</p>"; }
?>
<form method="POST" action="">
    <label>Username</label>
    <input type="text" name="username" required>

    <label>Password</label>
    <input type="password" name="password" required>

    <label>Confirm Password</label>
    <input type="password" name="confirm" required>

    <button type="submit">Register</button>
</form>
</section>
</main>
</body>
</html>
