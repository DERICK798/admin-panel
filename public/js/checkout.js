const cart = JSON.parse(localStorage.getItem('cart')) || [];
const orderSummary = document.getElementById('orderSummary');
const totalSpan = document.getElementById('total');

let total = 0;

// render cart
cart.forEach(item => {
  const li = document.createElement('li');
  const itemTotal = item.price * item.quantity;
  total += itemTotal;

  li.textContent = `${item.name} × ${item.quantity} = KES ${itemTotal}`;
  orderSummary.appendChild(li);
});

totalSpan.textContent = total;

// submit order
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const phone = document.getElementById('phone').value;
  const location = document.getElementById('location').value;
  const payment_method = document.getElementById('payment').value;

  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }

  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      location,
      payment_method,
      products: cart
    })
  });

  const data = await res.json();

  if (res.ok) {
    alert('Order placed successfully');
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
  } else {
    alert(data.message);
  }
});
