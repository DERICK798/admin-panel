// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

app.use(express.static('public')); // public folder = your html, css, js

// Update cart count in header
function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
    // Count total quantity if items store a quantity, otherwise fall back to number of items
    const totalQty = cart.reduce((sum, it) => {
      const q = parseInt(it.quantity, 10);
      return sum + (Number.isFinite(q) && q > 0 ? q : 1);
    }, 0);
    cartCountEl.textContent = totalQty;
    }
}

// Product-level quick quantity/total helpers — only initialize when relevant elements exist
const priceElement = document.querySelector(".price");
const qtyInput = document.querySelector(".qty-input");
const minusBtn = document.querySelector(".minus");
const plusBtn = document.querySelector(".plus");
const totalPrice = document.querySelector(".total-price");

let pricePerKg = 0;
if (priceElement) {
  const raw = priceElement.getAttribute("data-price");
  pricePerKg = parseInt(raw, 10) || 0;
}

function updateTotal() {
  if (!qtyInput || !totalPrice) return;
  let qty = parseInt(qtyInput.value, 10) || 0;
  totalPrice.textContent = qty * pricePerKg;
}

// Attach handlers only if controls exist on the page
if (plusBtn && minusBtn && qtyInput) {
  // Increase quantity
  plusBtn.addEventListener("click", () => {
    qtyInput.value = (parseInt(qtyInput.value, 10) || 0) + 1;
    updateTotal();
  });

  // Decrease quantity
  minusBtn.addEventListener("click", () => {
    const v = parseInt(qtyInput.value, 10) || 1;
    if (v > 1) {
      qtyInput.value = v - 1;
      updateTotal();
    }
  });

  // Manual input
  qtyInput.addEventListener("input", updateTotal);
}

// Update cart count on page load
updateCartCount();

// Add event listeners only to Add-to-Cart buttons that include product name
// We will compute price (and discount) from the product card's .price element
const buttons = document.querySelectorAll('.btn-shop[data-name]');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const name = button.getAttribute('data-name');

    if (!name) {
      console.warn('Add-to-cart button missing data-name:', button);
      return;
    }

    // Prefer price specified in the product card's .price element (so discounts apply there)
    const productCard = button.closest('.product-card');
    let basePrice = null;
    let discount = null;

    if (productCard) {
      const priceEl = productCard.querySelector('.price');
      if (priceEl) {
        basePrice = parseFloat(priceEl.dataset.price);
        discount = priceEl.dataset.discount;
      }
    }

    // Fallback to button data-price if price wasn't found in the card
    if (basePrice === null || Number.isNaN(basePrice)) {
      const priceAttr = button.getAttribute('data-price');
      basePrice = parseFloat(priceAttr);
    }

    if (Number.isNaN(basePrice) || basePrice === null) {
      console.warn('Invalid price for product', name, basePrice);
      return;
    }

    // Compute final price after discount (if discount is present and valid)
    let finalPrice = basePrice;
    if (discount !== undefined && discount !== null && String(discount).trim() !== '') {
      const d = parseFloat(discount);
      if (!Number.isNaN(d) && d > 0) {
        finalPrice = Math.round(basePrice * (1 - d / 100));
      }
    }

    // Determine quantity (look for a qty-input inside the same product card)
    let quantity = 1;
    if (productCard) {
      const qtyInput = productCard.querySelector('input.qty-input');
      if (qtyInput) {
        const qv = parseInt(qtyInput.value, 10);
        if (!Number.isNaN(qv) && qv > 0) quantity = qv;
      }
    }

    // Store unit price and quantity. If same product exists, increase its quantity instead of duplicating
    const unitPrice = finalPrice;
    const existing = cart.find(it => it.name === name);
    if (existing) {
      existing.quantity = (parseInt(existing.quantity, 10) || 1) + quantity;
    } else {
      cart.push({ name, unitPrice, quantity });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Notify user
    alert(`${name} (x${quantity}) added to cart!`);
  });
});
// Star rating functionality
document.querySelectorAll('.rating').forEach(ratingBox => {
  const stars = ratingBox.querySelectorAll('span');

  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      // remove active from all
      stars.forEach(s => s.classList.remove('active'));

      // add active to clicked and all before it
      for (let i = 0; i <= index; i++) {
        stars[i].classList.add('active');
      }
    });
  });
});


// Optional: Add category filter
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const products = document.querySelectorAll('.product-card');

// Render discounted prices where a data-discount is provided and update button data-price
function renderDiscounts() {
  products.forEach(product => {
    const priceEl = product.querySelector('.price');
    const addBtn = product.querySelector('.btn-shop[data-name]');
    if (!priceEl) return;

    const base = parseFloat(priceEl.dataset.price);
    const discountAttr = priceEl.dataset.discount;
    if (Number.isNaN(base)) return;

    if (discountAttr !== undefined && String(discountAttr).trim() !== '') {
      const d = parseFloat(discountAttr);
      if (!Number.isNaN(d) && d > 0) {
        const discounted = Math.round(base * (1 - d / 100));
        // show original (struck) + discounted price
        priceEl.innerHTML = `<span class="orig">Ksh ${base.toLocaleString()}</span> <span class="disc">Ksh ${discounted.toLocaleString()}</span>`;
        if (addBtn) addBtn.setAttribute('data-price', discounted);
        return;
      }
    }

    // No discount: ensure button price matches base
    priceEl.textContent = `@${base.toLocaleString()} ksh`;
    if (addBtn) addBtn.setAttribute('data-price', base);
  });
}

// Run once on page load
renderDiscounts();

// Quantity increment / decrement handlers for product cards
document.querySelectorAll('.quantity-container').forEach(ctrl => {
  const dec = ctrl.querySelector('.minus');
  const inc = ctrl.querySelector('.plus');
  const input = ctrl.querySelector('input.qty-input');
  if (!input) return;

  // Determine step and min (may be adjusted later per product category)
  const getStep = () => { const s = parseFloat(input.getAttribute('step')); return (Number.isFinite(s) && s > 0) ? s : 1; };
  const getMin = () => { const m = parseFloat(input.getAttribute('min')); return (Number.isFinite(m) && m > 0) ? m : 1; };

  const clamp = () => {
    let v = parseFloat(input.value);
    const min = getMin();
    if (!Number.isFinite(v) || v < min) v = min;
    const step = getStep();
    if (Number.isInteger(step)) {
      input.value = Math.round(v);
    } else {
      input.value = parseFloat(v.toFixed(2));
    }
  };

  dec && dec.addEventListener('click', (e) => {
    e.preventDefault();
    let v = parseFloat(input.value) || getMin();
    const step = getStep();
    const min = getMin();
    v = Math.max(min, +(v - step));
    if (Number.isInteger(step)) input.value = Math.round(v); else input.value = parseFloat(v.toFixed(2));
  });

  inc && inc.addEventListener('click', (e) => {
    e.preventDefault();
    let v = parseFloat(input.value) || getMin();
    const step = getStep();
    v = +(v + step);
    if (Number.isInteger(step)) input.value = Math.round(v); else input.value = parseFloat(v.toFixed(2));
  });

  // Ensure on manual change the value is valid
  input.addEventListener('change', clamp);
});

// Product API - Load products from endpoint
const productsContainer = document.getElementById('products-container');

fetch('http://localhost:3000/api/client/products')
  .then(res => {
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    return res.json();
  })
  .then(data => {
    if (!productsContainer) return;

    if (!Array.isArray(data) || data.length === 0) {
      productsContainer.innerHTML = '<p>No products available</p>';
      return;
    }

    productsContainer.innerHTML = '';

    data.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>KES ${product.price}</p>
        <button>Order</button>
      `;

      productsContainer.appendChild(card);
    });
  })
.catch(err => {
  console.error('Product fetch error:', err);
  if (productsContainer) {
    productsContainer.innerHTML = '<p>Error loading products</p>';
  }
});

// ---------- REGISTER ----------
const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // ✅ VALIDATION (INSIDE FUNCTION)
    if (!username || !phone || !email || !password) {
      alert('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid phone number (e.g., 0712345678).');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // ✅ SEND TO BACKEND
    try {
      const res = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, email, password })
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message);
        return;
      }

      console.log('SUCCESS → redirecting to login');
      window.location.href = 'login.html';

    } catch (err) {
      console.error(err);
      alert('Server not responding');
    }
  });
}
// ---------- LOGIN ----------
const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('login-password').value;

    // basic validation
    if (!identifier || !password) {
      alert('All fields are required');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message);
        return;
      }

      console.log('SUCCESS → redirecting to products');
      window.location.href = 'products.html';


    } catch (err) {
      console.error(err);
      alert('Server not responding');
    }
  });
}

// Ensure feeds use kg (allow decimals) and others use integer steps
document.querySelectorAll('.product-card').forEach(card => {
  const qcont = card.querySelector('.quantity-container');
  if (!qcont) return;
  const input = qcont.querySelector('input.qty-input');
  if (!input) return;
  const isFeed = (card.getAttribute('data-category') || '').toLowerCase() === 'feeds';
  // locate the label placed before the quantity-container
  let lbl = qcont.previousElementSibling;
  if (lbl && lbl.nodeType === 3) lbl = lbl.previousElementSibling; // skip text nodes
  if (isFeed) {
    input.setAttribute('step', '0.5');
    input.setAttribute('min', '0.5');
    if (lbl && lbl.tagName === 'LABEL') lbl.textContent = 'quantity (kg):';
    // ensure value respects step
    input.value = parseFloat(input.value) ? parseFloat(input.value).toFixed(2) : '0.50';
  } else {
    input.setAttribute('step', '1');
    input.setAttribute('min', '1');
    if (lbl && lbl.tagName === 'LABEL') lbl.textContent = 'quantity:';
    input.value = Math.max(1, Math.round(parseFloat(input.value) || 1));
  }
});

// Create hover previews for product images: small thumbnail strip that appears
// when hovering a product card. Clicking a thumbnail will set the card's main
// image (the first image in `.image-container`) to the clicked image.
function createImagePreviews() {
  products.forEach(product => {
    const imgContainer = product.querySelector('.image-container');
    if (!imgContainer) return;

    const imgs = Array.from(imgContainer.querySelectorAll('img'));
    if (imgs.length === 0) return;

    // Build preview strip
    const previews = document.createElement('div');
    previews.className = 'image-previews';

    imgs.forEach((img) => {
      const thumb = document.createElement('img');
      thumb.className = 'preview-thumb';
      // prefer src attribute; if empty, fall back safely
      thumb.src = img.src && img.src.trim() !== '' ? img.src : img.getAttribute('data-src') || '';
      thumb.alt = img.alt || 'preview';

      // clicking thumbnail swaps main image
      thumb.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const mainImg = imgContainer.querySelector('img');
        if (mainImg && thumb.src) {
          mainImg.src = thumb.src;
        }
      });

      previews.appendChild(thumb);
    });

    // Append previews after the image container
    imgContainer.parentNode.insertBefore(previews, imgContainer.nextSibling);
  });
}

// initialize image previews
createImagePreviews();

if (categoryFilter && searchInput) {
  function filterProducts() {
    const category = categoryFilter.value;
    const search = searchInput.value.trim().toLowerCase();

    products.forEach(product => {
      const prodCategory = (product.getAttribute('data-category') || '').toLowerCase();
      const prodName = (product.querySelector('h3')?.textContent || '').toLowerCase();

      // Category selector must match (or be 'all')
      const matchesCategoryFilter = (category === 'all') || prodCategory === category || prodCategory.includes(category);

      // Search input matches either name OR category (or empty search matches everything)
      const matchesSearch = !search || prodName.includes(search) || prodCategory.includes(search);

      if (matchesCategoryFilter && matchesSearch) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
      }
    });
  }

  categoryFilter.addEventListener('change', filterProducts);
  searchInput.addEventListener('keyup', filterProducts);
}

const toggle = document.getElementById("themeToggle");
const body = document.body;

// Load saved mode
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
}

toggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");

  // Save user preference
  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// If on cart page, display cart items
if (document.getElementById('cart-items')) {
  const cartItemsContainer = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('total-price');
  const checkoutBtn = document.querySelector('.checkout-btn');

  try {
    // Defensive: ensure `cart` is an array (handle case where it's a JSON string)
    if (!Array.isArray(cart) && typeof cart === 'string') {
      try { cart = JSON.parse(cart); } catch (e) { console.warn('Could not parse cart string', e); cart = []; }
    }

    // Update debug panel if present
    const debugPre = document.getElementById('cart-debug');
    if (debugPre) debugPre.textContent = cart && cart.length ? JSON.stringify(cart, null, 2) : '(no cart data)';

    console.log('Cart data:', cart);

    // Helper to render cart contents (call after changes)
    function renderCart() {
      let total = 0;
      cartItemsContainer.innerHTML = "";

      if (!cart || cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";
        if (debugPre) debugPre.textContent = '(no cart data)';
      } else {
        cart.forEach((item, index) => {
          const qty = Number.parseFloat(item.quantity) || 1;
          const unit = Number.parseFloat(item.unitPrice ?? item.price) || 0;
          const subtotal = unit * qty;
          total += subtotal;

          console.log(`Item ${index}:`, item, `qty: ${qty}, unit: ${unit}, subtotal: ${subtotal}`);

          const div = document.createElement('div');
          div.classList.add('cart-item');

          div.innerHTML = `
            <span class="cart-name">${item.name}</span>
            <span class="cart-qty">x${qty}</span>
            <span class="cart-unit">Ksh ${Math.round(unit).toLocaleString()}</span>
            <span class="cart-sub">Ksh ${Math.round(subtotal).toLocaleString()}</span>
            <button class="remove-btn" data-index="${index}" aria-label="Remove ${item.name}">Remove</button>
          `;

          cartItemsContainer.appendChild(div);
        });
      }

      if (totalPriceEl) totalPriceEl.textContent = Math.round(total || 0).toLocaleString();
      // update debug panel
      if (debugPre) debugPre.textContent = cart && cart.length ? JSON.stringify(cart, null, 2) : '(no cart data)';
    }

    // initial render
    renderCart();

    // Event delegation for remove buttons
    cartItemsContainer.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.remove-btn');
      if (!btn) return;
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (Number.isNaN(idx) || idx < 0 || idx >= cart.length) return;

      // Remove item
      const removed = cart.splice(idx, 1)[0];
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      renderCart();
      alert(`${removed.name} removed from cart.`);
    });

    // Checkout action - redirect to checkout form
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (!cart || cart.length === 0) {
          alert("Cart yako iko empty!");
          return;
        }
        window.location.href = "checkout.html";
      });
    }

  } catch (err) {
    console.error('Error rendering cart:', err);
    cartItemsContainer.innerHTML = '<p style="color:crimson">Unable to load cart. Check console for details.</p>';
    if (document.getElementById('cart-debug')) document.getElementById('cart-debug').textContent = String(err);
  }

  function goToCheckout() { window.location.href = "checkout.html"; }

  // Cancel from cart with confirmation
  function cancelFromCart() {
    try {
      const ok = confirm('Are you sure you want to cancel and go back to home? Your cart will remain saved.');
      if (ok) location.href = 'index.html';
    } catch (e) {
      // fallback
      location.href = 'index.html';
    }
  }
}
  

