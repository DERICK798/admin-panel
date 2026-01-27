if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const orderSummary = document.getElementById("orderSummary");
    const totalElem = document.getElementById("total");
    const checkoutForm = document.getElementById("checkoutForm");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cart.length) {
      orderSummary.innerHTML = "<li>Your cart is empty</li>";
      totalElem.textContent = "0";
    } else {
      let grandTotal = 0;
      orderSummary.innerHTML = "";

      cart.forEach(item => {
        item.price = Number(item.price);
        item.qty = Number(item.qty) || 1;

        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;

        const li = document.createElement("li");
        li.textContent = `${item.name} x ${item.qty} = KES ${itemTotal}`;
        orderSummary.appendChild(li);
      });

      totalElem.textContent = grandTotal;
    }

    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!cart.length) {
        alert("Your cart is empty!");
        return;
      }

      const phone = document.getElementById("phone").value.trim();
      const location = document.getElementById("location").value.trim();
      const payment_method = document.getElementById("payment_method").value;

      if (!phone || !location || !payment_method) {
        alert("Please fill all required fields");
        return;
      }

      const orderData = {
        phone,
        location,
        payment_method,
        products: cart.map(item => ({
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.qty)
        }))
      };

      console.log("Sending order:", orderData);

      try {
        const res = await fetch("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to place order");
        }

        const data = await res.json();
        alert(data.message || "Order placed successfully!");
        localStorage.removeItem("cart"); // clear cart
        window.location.href = "/products.html";
      } catch (err) {
        console.error(err);
        alert("Server error. Try again later.");
      }
    });
  });
}
