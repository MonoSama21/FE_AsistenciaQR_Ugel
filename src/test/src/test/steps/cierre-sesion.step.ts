import { createBdd } from 'playwright-bdd';
import { test, expect } from '../utiles/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { error, log } from 'console';
import { SidebarPage } from '../pages/sidebar.page';

const { Given, When, Then } = createBdd(test);


When('hago clic en el botón Cerrar Sesión ubicado en el menú lateral', async ({page}) => {
    const sidebarPage = new SidebarPage(page);
    await sidebarPage.clickLogoutButton();
});

Then('soy redirigido automáticamente a la pantalla de login', async ({page}) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyLoginScreen();
});