document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');
  const showPassword = document.getElementById('show-password');
  const passwordEl = document.getElementById('password');

  showPassword.addEventListener('change', () => {
    passwordEl.type = showPassword.checked ? 'text' : 'password';
  });

  // No preventDefault, no fake login, no localStorage demo
});

