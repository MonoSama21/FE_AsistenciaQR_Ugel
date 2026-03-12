import { createBdd } from 'playwright-bdd';
import { test, expect } from '../utiles/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { error, log } from 'console';
import { SidebarPage } from 'test/pages/sidebar.page';

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



Given('estoy en la página de login del sistema SIAQR', async ({ page }) => {
    const baseUrl = getEnvironmentUrl();
    console.log(`🌍 Ejecutando en ambiente: ${process.env.TEST_ENVIRONMENT || 'certificacion'}`)
    await page.goto(`${baseUrl}`);
});

When('ingreso mi correo electrónico y contraseña válidos como administrador', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmail('admin@gmail.com');
    await loginPage.fillPassword('123456');
});

When('ingreso mi correo electrónico y contraseña válidos como personal', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmail('personal@gmail.com');
    await loginPage.fillPassword('123456');
});


When('hago clic en el botón Inciar Sesion', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.clickLoginButton();
});

Then('ingreso al sistema y se ve mensaje de bienvenida personalizado', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    await loginPage.verifySuccessfulLogin();
    await homePage.verifyMessageWelcome();
});


When('ingreso mi correo electrónico válido como administrador', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmail('admin@gmail.com');
});

When('ingreso mi correo electrónico válido como personal', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmail('personal@gmail.com');
});


When('ingreso una contraseña incorrecta', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillPassword('incorrecta');
});

Then('se muestra un mensaje de error que dice {string}', async ({ page }, mensajeEsperado: string) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyErrorMessage(mensajeEsperado);
});


When('ingreso un correo electrónico inválido', async ({page}) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmail('invalido@gmail.com');
});

When('ingreso una contraseña válida', async ({page}) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillPassword('123456');
});





Then('en el sidebar se muestran las opciones de {string}, {string}, {string}, {string} y {string}', async ({page}, optionHome: string, optionUsers: string, optionStaff: string, optionAttendance: string, optionReportAttendance: string) => {
    const sidebarPage = new SidebarPage(page);
    await sidebarPage.verifyOptionsSidebarAdmin(optionHome, optionUsers, optionStaff, optionAttendance, optionReportAttendance);
});

Then('en el sidebar se muestran las opciones de {string} y {string}', async ({page}, optionHome: string, optionAttendance: string) => {
    const sidebarPage = new SidebarPage(page);
    await sidebarPage.verifyOptionsSidebarPersonal(optionHome, optionAttendance);
});