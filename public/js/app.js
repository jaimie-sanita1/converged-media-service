const state = {
  demoMode: 'normal',
  products: [],
  cart: { items: [], total: 0, itemCount: 0 },
  currentView: 'catalog',
};

const productListEl = document.getElementById('product-list');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const confirmationMessageEl = document.getElementById('confirmation-message');
const orderDetailsEl = document.getElementById('order-details');
const toastEl = document.getElementById('toast');
const demoModeBadgeEl = document.getElementById('demo-mode-badge');

document.querySelectorAll('[data-view]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showView(link.dataset.view);
  });
});

document.getElementById('checkout-btn').addEventListener('click', checkout);
document.getElementById('shop-again-btn').addEventListener('click', () => {
  showView('catalog');
});

init();

async function init() {
  const config = await fetchJson('/api/config');
  state.demoMode = config.demoMode;
  demoModeBadgeEl.textContent = `Demo mode: ${state.demoMode}`;

  state.products = (await fetchJson('/api/products')).products;
  renderProducts();
  await refreshCart();
  showView('catalog');
}

function showView(viewName) {
  state.currentView = viewName;
  document.getElementById('catalog-view').classList.toggle('hidden', viewName !== 'catalog');
  document.getElementById('cart-view').classList.toggle('hidden', viewName !== 'cart');
  document.getElementById('confirmation-view').classList.toggle('hidden', viewName !== 'confirmation');
}

function renderProducts() {
  productListEl.innerHTML = state.products
    .map(
      (product) => `
        <article class="product-card" data-product-id="${product.id}">
          <div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p><strong>$${product.price.toFixed(2)}</strong></p>
          </div>
          <button type="button" data-add-id="${product.id}">Add to Cart</button>
        </article>
      `
    )
    .join('');

  productListEl.querySelectorAll('[data-add-id]').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.addId));
  });
}

async function addToCart(productId) {
  const endpoint =
    state.demoMode === 'drift' ? '/api/cart/add' : '/api/cart/items';

  await fetchJson(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity: 1 }),
  });

  showToast('Added to cart');
  await refreshCart();
}

async function refreshCart() {
  const response = await fetchJson('/api/cart');
  state.cart = response.cart;
  cartCountEl.textContent = String(state.cart.itemCount);
  cartTotalEl.textContent = state.cart.total.toFixed(2);
  checkoutBtn.disabled = state.cart.itemCount === 0;

  cartItemsEl.innerHTML = state.cart.items
    .map(
      (item) => `
        <div class="cart-line">
          ${item.name} x ${item.quantity} — $${item.lineTotal.toFixed(2)}
        </div>
      `
    )
    .join('');
}

async function checkout() {
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'Processing...';

  try {
    const response = await fetch('/api/checkout', { method: 'POST' });
    const payload = await response.json();

    if (state.demoMode === 'silent-error') {
      showConfirmation(payload.order || {
        id: 'ord-demo-fallback',
        total: state.cart.total,
        status: 'confirmed',
      });
      showToast('Order placed successfully');
      await refreshCart();
      return;
    }

    if (!response.ok) {
      throw new Error(payload.error || 'Checkout failed');
    }

    showConfirmation(payload.order);
    showToast('Order placed successfully');
    await refreshCart();
  } catch (error) {
    showToast(error.message);
    checkoutBtn.disabled = false;
  } finally {
    checkoutBtn.textContent = 'Checkout';
  }
}

function showConfirmation(order) {
  confirmationMessageEl.textContent = `Thanks for your order! Confirmation #${order.id}`;
  orderDetailsEl.innerHTML = `
    <dt>Order ID</dt><dd>${order.id}</dd>
    <dt>Status</dt><dd>${order.status}</dd>
    <dt>Total</dt><dd>$${Number(order.total).toFixed(2)}</dd>
  `;
  showView('confirmation');
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  window.setTimeout(() => toastEl.classList.add('hidden'), 2500);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  return response.json();
}
