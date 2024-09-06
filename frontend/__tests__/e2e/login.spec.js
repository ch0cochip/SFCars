import { test, expect } from '@playwright/test';

const fillInitialForm = async (page, email, password) => {
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.click('.blue_btn:last-child');
};

const checkErrorMessage = async (page, inputId, expectedError) => {
  const error = await page.textContent(`#${inputId} ~ .error_text`);
  expect(error).toBe(expectedError);
  expect(page.url()).toBe('http://localhost:3000/login');
};

test.describe.serial('Login Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
  });

  // Empty Email Field
  test('should display error for empty email field', async ({ page }) => {
    await fillInitialForm(page, '', 'Test@12345');
    await checkErrorMessage(page, 'email', 'This field is required');
  });

  // Empty Password Field
  test('should display error for empty password field', async ({ page }) => {
    await fillInitialForm(page, 'test@example.com', '');
    await checkErrorMessage(page, 'password', 'This field is required');
  });

  // // Visit forgot password page
  // test('should visit forgot password page', async ({ page }) => {
  //   await page.getByRole('link', { name: 'Forgot password?' }).click();
  //   expect(page.url()).toBe('http://localhost:3000/login/forgotpassword');
  // });
});