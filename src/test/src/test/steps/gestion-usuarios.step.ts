import { createBdd } from 'playwright-bdd';
import { test, expect } from '../utiles/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { error, log } from 'console';
import { SidebarPage } from '../pages/sidebar.page';
import { UsersPage } from '../pages/users.page';

const { Given, When, Then } = createBdd(test);

// Variable para almacenar datos del usuario creado entre steps
let lastCreatedUserData: any = null;


Then('debo ver la columna {string}', async ({ page }, columna: string) => {
    const usersPage = new UsersPage(page);
    await usersPage.verifyColum(columna);
});

When('hago clic en el botón Nuevo Usuario', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.clickBtnNewUser();
});

When('completo el formulario con datos válidos', async ({page}) => {
    const usersPage = new UsersPage(page);
    lastCreatedUserData = await usersPage.fillNewUserForm();
});

When('hago clic en Crear Usuario', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.clickBtnCreateUser();
    
});

Then('debo ver un mensaje de confirmación {string}', async ({page}, mensajeExitoso: string) => {
    const usersPage = new UsersPage(page);
    await usersPage.verifySuccessMessage(mensajeExitoso);
});

Then('el nuevo usuario debe aparecer en el listado', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.verifyNewUserAppearsInList(lastCreatedUserData);
});

Then('el usuario debe tener estado {string}', async ({page}, estado: string) => {
    const usersPage = new UsersPage(page);
    await usersPage.verifyUserStatus(estado);
});