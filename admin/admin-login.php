<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start session
session_start();

// Include database connection
include __DIR__ . '/../config/db.php';


$error = "";

// Check if form submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    // Prepare statement
    $stmt = $conn->prepare("SELECT id, username, password FROM admins WHERE username = ? LIMIT 1");
    if ($stmt) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows === 1) {
            $admin = $result->fetch_assoc();

            // Verify password (password in DB must be hashed!)
            if (password_verify($password, $admin['password'])) {
                // Login successful → set session
                $_SESSION['admin'] = $admin['username'];
                $_SESSION['admin_id'] = $admin['id'];

                // Redirect to dashboard
                header("Location: dashboard.php");
                exit;
            } else {
                $error = "Invalid password";
            }

        } else {
            $error = "Invalid username";
        }

        $stmt->close();
    } else {
        $error = "Database error: " . $conn->error;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Login</title>
<link rel="stylesheet" href="css/style.css">
<style>
/* Minimal inline CSS for clarity */
body { font-family: Arial; background: #f5f5f5; }
main { display: flex; justify-content: center; align-items: center; height: 100vh; }
.card { background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); width: 300px; }
input { width: 100%; padding: 8px; margin: 5px 0 15px; border-radius: 5px; border: 1px solid #ccc; }
button { width: 100%; padding: 10px; border: none; border-radius: 5px; background: #007bff; color: #fff; font-size: 16px; cursor: pointer; }
button:hover { background: #0056b3; }
.error { color: red; font-size: 14px; }
.small { font-size: 12px; }
</style>
</head>
<body>
<main class="page">
<section class="card" aria-labelledby="login-heading">
<h1 id="login-heading">Sign in to Admin</h1>

<form method="POST" action="">
    <label for="username">Username</label>
    <input id="username" name="username" type="text" autocomplete="username" required>

    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required>

    <div class="inline-row">
        <label class="small"><input id="show-password" type="checkbox"> Show password</label>
    </div>

    <?php if($error != "") { echo "<p class='error'>$error</p>"; } ?>

    <button type="submit" class="btn">Sign in</button>
</form>
<a href="Register.php" class="small">Register as new admin</a>
<p class="muted" style="text-align:center; margin-top:15px;">@2025 All rights reserved. Admins only.</p>
</section>
</main>

<script>
document.getElementById('show-password').addEventListener('change', function() {
    const pwd = document.getElementById('password');
    pwd.type = this.checked ? 'text' : 'password';
});
</script>
</body>
</html>
