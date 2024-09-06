import { test, expect } from '@playwright/test';

const fillInitialForm = async (page, email, confirmEmail, password) => {
  await page.fill('input#email', email);
  await page.fill('input#confirmEmail', confirmEmail);
  await page.fill('input#password', password);
  await page.click('.blue_btn:last-child');
};

const fillDetailsForm = async (page, firstName, lastName, phoneNumber) => {
  await page.fill('input#firstName', firstName);
  await page.fill('input#lastName', lastName);
  await page.fill('input#phoneNumber', phoneNumber);
  await page.click('.blue_btn:last-child');
};

const checkErrorMessage = async (page, inputId, expectedError) => {
  const error = await page.textContent(`#${inputId} ~ .error_text`);
  expect(error).toBe(expectedError);
  expect(page.url()).toBe('http://localhost:3000/register');  // Ensure no redirection
};

test.describe.serial('Registration Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/register');
  });

  // // Successful Registration & Token Storage
  // test('should register successfully and store token', async ({ page, context }) => {
  //   await fillInitialForm(page, 'test@example.com', 'test@example.com', 'Test@12345');
  //   await fillDetailsForm(page, 'Test', 'User', '0412345678');
  //   expect(page.url()).toBe('http://localhost:3000/');
  //   const localStorage = await context.storageState();
  //   expect(localStorage.localStorage[0].value).toBeDefined();  // Assuming token is non-empty
  // });

  // Invalid Email
  test('should display error for invalid email', async ({ page }) => {
    await fillInitialForm(page, 'invalidEmail', 'invalidEmail', 'Test@12345');
    await checkErrorMessage(page, 'email', 'Enter a valid email address');
  });

  // Mismatched Emails
  test('should display error for mismatched emails', async ({ page }) => {
    await fillInitialForm(page, 'test@example.com', 'different@example.com', 'Test@12345');
    await checkErrorMessage(page, 'confirmEmail', 'Email addresses do not match');
  });

  // Empty Email Field
  test('should display error for empty email field', async ({ page }) => {
    await fillInitialForm(page, '', '', 'Test@12345');
    await checkErrorMessage(page, 'email', 'This field is required');
    await checkErrorMessage(page, 'confirmEmail', 'This field is required');
  });

  // Password Errors

  const passwordErrorCases = [
    ['Test @12345', 'Password must not contain Whitespaces'],
    ['test@12345', 'Password must have at least one Uppercase Character'],
    ['TEST@12345', 'Password must have at least one Lowercase Character'],
    ['Test@pass', 'Password must contain at least one Digit'],
    ['Testpassword1', 'Password must contain at least one Special Symbol'],
    ['Test@1', 'Password must be 8-20 Characters Long'],
    ['', 'This field is required'],
  ];

  passwordErrorCases.forEach(([password, errorMessage]) => {
    test(`should display error for password: ${password}`, async ({ page }) => {
      await fillInitialForm(page, 'test@example.com', 'test@example.com', password);
      await checkErrorMessage(page, 'password', errorMessage);
    });
  });

  // Further Registration Errors

  // Missing First Name
  test('should display error for missing first name', async ({ page }) => {
    await fillInitialForm(page, 'test@example.com', 'test@example.com', 'Test@12345');
    await fillDetailsForm(page, '', 'User', '0412345678');
    await checkErrorMessage(page, 'firstName', 'This field is required');
  });

  // Missing Last Name
  test('should display error for missing last name', async ({ page }) => {
    await fillInitialForm(page, 'test@example.com', 'test@example.com', 'Test@12345');
    await fillDetailsForm(page, 'Test', '', '0412345678');
    await checkErrorMessage(page, 'lastName', 'This field is required');
  });

  // Invalid Phone Number
  test('should display error for invalid phone number', async ({ page }) => {
    await fillInitialForm(page, 'test@example.com', 'test@example.com', 'Test@12345');
    await fillDetailsForm(page, 'Test', 'User', '1234567890'); // Not starting with '04'
    await checkErrorMessage(page, 'phoneNumber', 'Enter a valid phone number');
  });

  // Invalid Phone Number Length
  test('should display error for invalid phone number length', async ({ page }) => {
    await fillInitialForm(page, 'test@example.com', 'test@example.com', 'Test@12345');
    await fillDetailsForm(page, 'Test', 'User', '04123456789'); // More than 10 digits
    await checkErrorMessage(page, 'phoneNumber', 'Enter a valid phone number');
  });

  // Missing Phone Number
  test('should display error for missing phone number', async ({ page }) => {
    await fillInitialForm(page, 'test@example.com', 'test@example.com', 'Test@12345');
    await fillDetailsForm(page, 'Test', 'User', ''); // More than 10 digits
    await checkErrorMessage(page, 'phoneNumber', 'This field is required');
  });

  // Back Button
  test('should go back to initial registration from further registration', async ({ page }) => {
    await fillInitialForm(page, 'test@example.com', 'test@example.com', 'Test@12345');
    await page.click('.blue_btn:first-child');
    const heading = await page.textContent('.heading_text');
    expect(heading).toBe('Register');
    expect(page.url()).toBe('http://localhost:3000/register');
  });

  // // Email Already in Use
  // test('should display error for email already in use', async ({ page }) => {
  //   await fillInitialForm(page, 'test@example.com', 'test@example.com', 'Test@12345');
  //   await fillDetailsForm(page, 'Test', 'User', '0412345678');
  //   const error = await page.textContent('.error_text');
  //   expect(error).toBe('This email is already in use');
  //   const heading = await page.textContent('.heading_text');
  //   expect(heading).toBe('Register');
  //   expect(page.url()).toBe('http://localhost:3000/register');  // Ensure no redirection
  // });
});