import { test, expect } from '@playwright/test';

test.describe('Acme Shop checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.request.post('/api/demo/reset');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('customer can browse, add to cart, and checkout', async ({ page }) => {
    const firstProduct = page.locator('.product-card').first();
    await expect(firstProduct).toBeVisible();

    const productName = (await firstProduct.locator('h3').textContent())?.trim();
    expect(productName?.length ?? 0).toBeGreaterThan(0);

    await firstProduct.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.locator('#toast')).toContainText('Added to cart');

    await page.locator('a[data-view="cart"]').click();
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();
    await expect(page.locator('.cart-line').first()).toContainText(productName ?? '');

    const checkoutBtn = page.getByRole('button', { name: 'Checkout' });
    await expect(checkoutBtn).toBeEnabled();
    await checkoutBtn.click();

    await expect(page.getByRole('heading', { name: 'Order Confirmation' })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#confirmation-message')).toContainText('Thanks for your order!');
    await expect(page.locator('#toast')).toContainText('Order placed successfully');
  });
});
