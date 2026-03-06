import { createBdd } from 'playwright-bdd';
import { test, expect } from '../utiles/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { error, log } from 'console';
import { SidebarPage } from '../pages/sidebar.page';

const { Given, When, Then } = createBdd(test);


Given('ingreso credeciales de administrador en el sistema SIAQR', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillEmail('pruebaqa@gmail.com');
    await loginPage.fillPassword('123456');
    await loginPage.clickLoginButton();
});

When('el menú lateral debe estar visible', async ({ page }) => {
    const sidebarPage = new SidebarPage(page);
    await sidebarPage.verifySidebar();
});

Then('debe incluir las opciones Home, Usuarios, Personal, Asistencia y Reporte Asistencia', async ({ page }) => {
    const sidebarPage = new SidebarPage(page);
    await sidebarPage.verifyOptionsSidebar();
});

When('hago clic en la opción {string} del menú lateral', async ({}, arg: string) => {
  // Step: When hago clic en la opción "Home" del menú lateral
  // From: src\resources\features\dashboard\navegacion-dashboard.feature:19:9
});

Then('soy dirigido a la pantalla de {string}', async ({}, arg: string) => {
  // Step: Then soy dirigido a la pantalla de "Home"
  // From: src\resources\features\dashboard\navegacion-dashboard.feature:20:9
});