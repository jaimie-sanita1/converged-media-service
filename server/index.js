const express = require('express');
const path = require('path');
const {
  products,
  cart,
  orders,
  resetState,
  getDemoMode,
} = require('./data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/api/config', (req, res) => {
  res.json({ demoMode: getDemoMode(), storeName: 'Acme Shop' });
});

app.get('/api/products', (req, res) => {
  res.json({ products });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ product });
});

app.post('/api/cart/items', (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, product });
  }

  return res.status(201).json({ cart: summarizeCart() });
});

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, product });
  }

  return res.status(201).json({ cart: summarizeCart() });
});

app.get('/api/cart', (req, res) => {
  res.json({ cart: summarizeCart() });
});

app.post('/api/checkout', (req, res) => {
  if (getDemoMode() === 'silent-error') {
    return res.status(500).json({
      error: 'Payment gateway unavailable',
      code: 'PAYMENT_GATEWAY_DOWN',
    });
  }

  if (cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const orderId = `ord-${Date.now()}`;
  const total = summarizeCart().total;

  orders[orderId] = {
    id: orderId,
    items: cart.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    })),
    total,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  cart.items = [];

  return res.status(201).json({ order: orders[orderId] });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders[req.params.id];
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json({ order });
});

app.post('/api/demo/reset', (req, res) => {
  resetState();
  res.json({ ok: true, demoMode: getDemoMode() });
});

function summarizeCart() {
  const items = cart.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    quantity: item.quantity,
    unitPrice: item.product.price,
    lineTotal: Number((item.product.price * item.quantity).toFixed(2)),
  }));

  const total = Number(
    items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );

  return { items, total, itemCount: items.length };
}

app.listen(PORT, () => {
  console.log(`Acme Shop running at http://localhost:${PORT}`);
  console.log(`Demo mode: ${getDemoMode()}`);
});
