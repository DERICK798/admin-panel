<?php
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
<title>Admin Login</title>
<link rel="stylesheet" href="../css/style.css">
</head>
<body>
<h2>Admin Login</h2>
<form method="POST" action="">
    <label>Username:</label><br>
    <input name="username" type="text" required autocomplete="username"><br><br>

    <label>Password:</label><br>
    <input name="password" type="password" required autocomplete="current-password"><br><br>

    <label><input type="checkbox" id="show-password"> Show Password</label><br><br>

    <button type="submit">Login</button>
</form>

<p style="color:red;"><?php echo $error; ?></p>

<script>
document.getElementById('show-password').addEventListener('change', function() {
    const pwd = document.querySelector('input[name="password"]');
    pwd.type = this.checked ? 'text' : 'password';
});
</script>
</body>
</html>
