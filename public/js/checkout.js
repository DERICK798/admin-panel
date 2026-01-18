document.addEventListener('DOMContentLoaded', () => {

  // --- Theme toggle ---
  const toggle = document.getElementById("themeToggle");
  const body = document.body;

  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      localStorage.setItem(
        "theme",
        body.classList.contains("dark-mode") ? "dark" : "light"
      );
    });
  }

  // --- Cart & Order summary ---
  const checkoutCart = JSON.parse(localStorage.getItem('cart')) || [];
  const orderSummary = document.getElementById('orderSummary');
  const totalSpan = document.getElementById('total');

  let total = 0;

  checkoutCart.forEach(item => {
    const price = parseFloat(item.unitPrice ?? item.price);
    const quantity = parseInt(item.quantity);
    if (isNaN(price) || isNaN(quantity)) return;

    const itemTotal = price * quantity;
    total += itemTotal;

    if (orderSummary) {
      const div = document.createElement('div');
      div.textContent = `${item.name} - Qty: ${quantity} - Subtotal: Ksh ${itemTotal.toLocaleString()}`;
      orderSummary.appendChild(div);
    }
  });

  if (totalSpan) {
    totalSpan.textContent = `Ksh ${total.toLocaleString()}`;
  }

  // --- FORM SUBMIT ---
  const checkoutForm = document.getElementById('checkoutForm');
  if (!checkoutForm) return;

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop page reload

    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value.trim();
    const payment_method = document.getElementById('payment').value;

    if (!phone || !location || !payment_method) {
      alert('Please fill all fields');
      return;
    }

    if (checkoutCart.length === 0) {
      alert('Cart is empty');
      return;
    }

    // Prepare numeric cart data
    const productsForBackend = checkoutCart.map(p => ({
      name: p.name,
      price: Number(p.unitPrice ?? p.price),
      quantity: Number(p.quantity)
    }));

    try {
      // ✅ AWAIT the fetch properly
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          location,
          payment_method,
          products: productsForBackend,
          total
        })
      });

      // ✅ Parse response safely
      const data = await res.json();

      if (res.ok) {
        alert('Order placed successfully!'); // ✅ Shows message
        localStorage.removeItem('cart');
        window.location.href = 'products.html'; // ✅ Redirect after success
      } else {
        alert(data.message || 'Failed to place order');
      }

    } catch (err) {
      console.error(err);
      alert('Server error. Please try again later.');
    }
  });
localStorage.removeItem('cart');

});
