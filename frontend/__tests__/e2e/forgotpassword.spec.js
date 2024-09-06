import { test, expect } from '@playwright/test';

test.describe.serial('Forgot Password Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login/forgotpassword');
  });

  // // Empty Email Field
  // test('should display error for empty email field', async ({ page }) => {
  //   await page.click('.blue_btn:last-child');
  //   const error = await page.textContent('#email ~ .error_text');
  //   expect(error).toBe('This field is required');
  // });

  // // back goes to login page
  // test('should go back to login page', async ({ page }) => {
  //   await page.click('.blue_btn:first-child');
  //   expect(page.url()).toBe('http://localhost:3000/login');
  // });
});