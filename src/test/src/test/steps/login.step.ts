import { createBdd } from 'playwright-bdd';
import { test, expect } from '../utiles/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { error, log } from 'console';

const { Given, When, Then } = createBdd(test);

let selectedRole = '';

// Obtener URL dinámica según ambiente
function getEnvironmentUrl(): string {
    const environment = process.env.TEST_ENVIRONMENT || 'certificacion';
    
    if (environment === 'integracion') {
        return process.env.URL_INTEGRACION || 'https://siasis-dev.vercel.app';
    } else {
        return process.env.URL_CERTIFICACION || 'https://siasis-cert.vercel.app';
    }
}

Given('el usuario se encuentra en el login de SauceDemo', async ({ page }) => {
    const baseUrl = getEnvironmentUrl();
    console.log(`🌍 Ejecutando en ambiente: ${process.env.TEST_ENVIRONMENT || 'certificacion'}`);
    await page.goto(`${baseUrl}`);
});

When('ingresa un nombre de usuario válido y contraseña válida', async ({ page }) => {
   const loginPage = new LoginPage(page);
   await loginPage.fillUsername('standard_user');
   await loginPage.fillPassword('secret_sauce');
});

When('hace clic en el botón Login', async ({ page }) => {
   const loginPage = new LoginPage(page);
   await loginPage.clickLoginButton();
});

Given('el usuario ha ingresado sesión con éxito en SauceDemo', async ({ page }) => {
    const baseUrl = getEnvironmentUrl();
    console.log(`🌍 Ejecutando en ambiente: ${process.env.TEST_ENVIRONMENT || 'certificacion'}`);
    await page.goto(`${baseUrl}`);
    const loginPage = new LoginPage(page);
    await loginPage.fillUsername('standard_user');
    await loginPage.fillPassword('secret_sauce');
    await loginPage.clickLoginButton();
});

Then('debe ser redirigido a la página de productos', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifySuccessfulLogin();
    console.log('✅ Login exitoso, redirigido a la página de productos.');
});

When('ingresa un nombre de usuario válido y contraseña incorrecta', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillUsername('standard_user');
    await loginPage.fillPassword('incorrect_password');
});

When('ingresa un nombre de usuario bloqueado y contraseña válida', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillUsername('locked_out_user');
    await loginPage.fillPassword('secret_sauce');
});

When('ingresa un nombre de usuario inválido y contraseña incorrecta', async ({ page}) => {
  const loginPage = new LoginPage(page);
  await loginPage.fillUsername('invalid_user');
  await loginPage.fillPassword('incorrect_password');
});

Then('debe ver un mensaje de error: {string}', async ({ page }, expectedMessage: string) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyErrorMessage(expectedMessage);
});

When('deja vacío el campo de usuario e ingresa una contraseña válida', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.fillPassword('secret_sauce');
});

When('ingresa un nombre de usuario válido y deja vacío el campo de contraseña', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.fillUsername('standard_user');
});