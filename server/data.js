const products = [
  {
    id: 'prod-001',
    name: 'Wireless Keyboard',
    price: 49.99,
    description: 'Compact mechanical keyboard with quiet switches.',
  },
  {
    id: 'prod-002',
    name: 'USB-C Hub',
    price: 34.99,
    description: '7-in-1 adapter with HDMI and SD card reader.',
  },
  {
    id: 'prod-003',
    name: 'Desk Lamp',
    price: 24.99,
    description: 'Adjustable LED lamp with warm and cool modes.',
  },
];

let cart = {
  items: [],
};

let orders = {};

function resetState() {
  cart = { items: [] };
  orders = {};
}

function getDemoMode() {
  return process.env.DEMO_MODE || 'normal';
}

module.exports = {
  products,
  cart,
  orders,
  resetState,
  getDemoMode,
};
