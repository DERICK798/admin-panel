<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include '../config/db.php'; ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Admin Panel — Login</title>
  <link rel="stylesheet" href="css/style.css">
  <meta name="description" content="Login page for admin panel (demo). Replace client-side demo auth with server-side authentication.">
</head>
<body>
  <main class="page"> 
    <section class="card" aria-labelledby="login-heading">
      <h1 id="login-heading">Sign in to Admin</h1>

      <form id="login-form" method="POST" action="admin-login.php">
        <label for="username">Username or email</label>
        <input id="username" name="username" type="text" autocomplete="username" required>

        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>

        <div class="inline-row">
          <label class="small"><input id="show-password" type="checkbox"> Show password</label>
          <label class="small"><input id="remember" type="checkbox"> Remember me</label>
        </div>

        <p id="error" role="alert" aria-live="polite" class="error"></p>

        <button type="submit" class="btn">Sign in</button>
      </form>

      <p class="muted">@2025 all rights reserved..Admins only.Developed and managed by Dero.</p>
    </section>
  </main>

  <script src="js/login.js" defer></script>
</body>
</html>
