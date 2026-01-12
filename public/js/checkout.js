document.addEventListener('DOMContentLoaded', () => {

  // ==========================
  // THEME TOGGLE
  // ==========================
  const toggle = document.getElementById("themeToggle");
  const body = document.body;

  // Load saved mode
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

  // ==========================
  // CART DISPLAY & TOTAL
  // ==========================
  const checkoutCart = JSON.parse(localStorage.getItem('cart')) || [];
  const orderSummary = document.getElementById('orderSummary');
  const totalSpan = document.getElementById('total');

  let total = 0;

  checkoutCart.forEach(item => {
    const price = parseFloat(item.unitPrice ?? item.price);
    const quantity = parseInt(item.quantity);

    if (isNaN(price) || isNaN(quantity)) {
      console.error('Invalid product data:', item);
      return;
    }

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

  // ==========================
  // HANDLE FORM SUBMIT
  // ==========================
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

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

      // Ensure numeric values before sending
      const productsForBackend = checkoutCart.map(p => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.unitPrice ?? p.price),
        quantity: parseInt(p.quantity)
      }));

      try{
        const res = await fetch('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            location,
            payment_method,
            products: productsForBackend,
            total // optional: send total calculated in frontend
          })
        });

        const data = await res.json();

        if (res.ok) {
          alert('Order placed successfully');
          localStorage.removeItem('cart');
          window.location.href = 'index.html';
          
          window.location.href = 'products.html';
        } else {
          alert(data.message || 'Failed to place order');
        }

      } catch (err) {
        console.error(err);
        alert('Server is not responding. Please try again later.');
      }
    });
  }

});
