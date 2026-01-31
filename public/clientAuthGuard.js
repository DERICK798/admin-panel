// clientAuthGuard.js

const user = localStorage.getItem('user'); // or isLoggedIn

if (!user) {
  alert('❌ Please login to continue');
  window.location.href = '/login.html';
}
