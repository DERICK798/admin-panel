<?php
header("Location: admin-login.php");
exit;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include '../config/db.php';

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, username, password FROM admins WHERE username = ? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows === 1) {
        $admin = $result->fetch_assoc();

        if (password_verify($password, $admin['password'])) {

            $_SESSION['admin'] = $admin['username'];
            $_SESSION['admin_id'] = $admin['id'];

            header("Location: dashboard.php");
            exit;

        } else {
            $error = "Invalid password";
        }

    } else {
        $error = "Invalid username";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Admin Login</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<main class="page">
<section class="card" aria-labelledby="login-heading">
<h1 id="login-heading">Sign in to Admin</h1>

<form method="POST" action="admin-login.php">
    <label for="username">Username</label>
    <input id="username" name="username" type="text" autocomplete="username" required>

    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required>

    <div class="inline-row">
        <label class="small"><input id="show-password" type="checkbox"> Show password</label>
    </div>

    <p id="error" role="alert" aria-live="polite" class="error"><?php echo $error; ?></p>

    <button type="submit" class="btn">Sign in</button>
</form>

<p class="muted">@2025 all rights reserved..Admins only.</p>
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

