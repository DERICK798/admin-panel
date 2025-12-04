document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const errorEl = document.getElementById('error');
  const showPassword = document.getElementById('show-password');
  const rememberEl = document.getElementById('remember');

  // Load remembered username (demo)
  try {
    const saved = localStorage.getItem('demo_username');
    if (saved) usernameEl.value = saved;
  } catch (e) { /* ignore storage errors */ }

  showPassword.addEventListener('change', () => {
    passwordEl.type = showPassword.checked ? 'text' : 'password';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.textContent = '';

    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    if (!username) { errorEl.textContent = 'Please enter your username or email.'; usernameEl.focus(); return; }
    if (!password) { errorEl.textContent = 'Please enter your password.'; passwordEl.focus(); return; }

    // Demo client-side authentication (FOR DEMO ONLY).
    // Replace this with a secure POST to your server API.
    errorEl.textContent = 'Signing in...';
    setTimeout(() => {
      const demoOk = (username === 'admin' && password === 'password');
      if (demoOk) {
        try {
          if (rememberEl.checked) localStorage.setItem('demo_username', username);
          else localStorage.removeItem('demo_username');
        } catch (e) {}
        // On success, redirect to an internal page. Replace as needed.
        window.location.href = 'index-1.html';
      } else {
        errorEl.textContent = 'Invalid username or password.';
      }
    }, 700);
  });
});
