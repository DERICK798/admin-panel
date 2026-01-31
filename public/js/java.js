// GLOBAL CART
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product, qty) {
  if (!qty || qty < 1) qty = 1;

  const exist = cart.find(item => item.id === product.id);

  if (exist) {
    exist.qty += qty;
    exist.total = exist.qty * exist.price;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      qty: qty,
      total: Number(product.price) * qty
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(product.name + ' added to cart');
}

//stars control
function renderStars(rating) {
  let starsHTML = "";

  for (let i = 1; i <= 5; i++) {
    starsHTML += `
      <span class="star ${i <= rating ? "active" : ""}" data-value="${i}">
        ★
      </span>
    `;
  }

  return starsHTML;
}

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

    // Notify 
    alert(`${name} (x${quantity}) added to cart!`);
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
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});
//fetch of products

function fetchProducts() {
  fetch("http://localhost:3000/api/products")
    .then(res => res.json())
    .then(products => renderProducts(products))
    .catch(err => console.error(err));
}

function renderProducts(products) {
  const container = document.getElementById("products-container");
  if (!container) return;

  container.innerHTML = "";

  // 1️⃣ GROUP PRODUCTS BY CATEGORY
  const grouped = {};

  products.forEach(product => {
    const category = product.category || "Other";

    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(product);
  });

  // 2️⃣ RENDER EACH CATEGORY
  Object.keys(grouped).forEach(category => {
    // CATEGORY TITLE
    const categorySection = document.createElement("section");
    categorySection.className = "category-section";

    const title = document.createElement("h2");
    title.textContent = category;
    categorySection.appendChild(title);

    // PRODUCTS ROW
    const row = document.createElement("div");
    row.className = "product-row";

    grouped[category].forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
card.innerHTML = `
  <img src="/uploads/${product.image}" alt="${product.name}">
  <h3>${product.name}</h3>

  <div class="rating">
    ${renderStars(product.rating || 0)}
    <span class="rating-value">(${product.rating || 0})</span>
  </div>

  <p>KES ${product.price}</p>

  <div class="quantity-container">
    <button class="decrement">-</button>
    <input type="number" class="qty-input" value="1" min="1">
    <button class="increment">+</button>
  </div>

  <button class="btn-shop">Add to Cart</button>
`;
//stars control
const stars = card.querySelectorAll(".star");
    const ratingValue = card.querySelector(".rating-value");

    stars.forEach(star => {
      star.addEventListener("click", () => {
        const selectedRating = Number(star.dataset.value);

        stars.forEach(s =>
          s.classList.toggle("active", Number(s.dataset.value) <= selectedRating)
        );

        ratingValue.textContent = `(${selectedRating})`;
        console.log("Rated:", selectedRating);
      });
    });
      // ELEMENTS
      const qtyInput = card.querySelector(".qty-input");
      const dec = card.querySelector(".decrement");
      const inc = card.querySelector(".increment");
      const addBtn = card.querySelector(".btn-shop");

      dec.addEventListener("click", () => {
        if (qtyInput.value > 1) qtyInput.value--;
      });

      inc.addEventListener("click", () => {
        qtyInput.value++;
      });

      addBtn.addEventListener("click", () => {
        addToCart(product, Number(qtyInput.value));
      });

      row.appendChild(card);
    });

    categorySection.appendChild(row);
    container.appendChild(categorySection);
  });
}

const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = '/products.html';
      } else {
        alert(result.message || 'Login failed');
      }
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

if (toggle) {
  toggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    // Save user preference
    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
}

// If on cart page, display cart items
if (document.getElementById('cartBody')) {
  const cartBody = document.getElementById('cartBody');
  const grandTotalEl = document.getElementById('grandTotal');

  try {
    // Defensive: ensure `cart` is an array (handle case where it's a JSON string)
    if (!Array.isArray(cart) && typeof cart === 'string') {
      try { cart = JSON.parse(cart); } catch (e) { console.warn('Could not parse cart string', e); cart = []; }
    }

    console.log('Cart data:', cart);

    // Helper to render cart contents (call after changes)
    function renderCart() {
      let total = 0;
      cartBody.innerHTML = "";

      if (!cart || cart.length === 0) {
        cartBody.innerHTML = '<tr><td colspan="5">Your cart is empty</td></tr>';
      } else {
        cart.forEach((item, index) => {
          const qty = Number.parseFloat(item.quantity) || 1;
          const unit = Number.parseFloat(item.unitPrice ?? item.price) || 0;
          const subtotal = unit * qty;
          total += subtotal;

          console.log(`Item ${index}:`, item, `qty: ${qty}, unit: ${unit}, subtotal: ${subtotal}`);

          const row = document.createElement('tr');

          row.innerHTML = `
            <td>${item.name}</td>
            <td>Ksh ${Math.round(unit).toLocaleString()}</td>
            <td>${qty}</td>
            <td>Ksh ${Math.round(subtotal).toLocaleString()}</td>
            <td><button class="remove-btn" data-index="${index}" aria-label="Remove ${item.name}">Remove</button></td>
          `;

          cartBody.appendChild(row);
        });
      }

      if (grandTotalEl) grandTotalEl.textContent = Math.round(total || 0).toLocaleString();
    }

    // initial render
    renderCart();

    // Event delegation for remove buttons
    cartBody.addEventListener('click', (ev) => {
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

    } catch (err) {
      console.error('Error rendering cart:', err);
      cartBody.innerHTML = '<tr><td colspan="5" style="color:crimson">Unable to load cart. Check console for details.</td></tr>';
    }
  }