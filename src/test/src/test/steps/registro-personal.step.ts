import { createBdd } from 'playwright-bdd';
import { test, expect } from '../utiles/test-fixtures';;
import { PersonalPage } from '../pages/personal.page';

const { Given, When, Then } = createBdd(test);

// Variable para almacenar datos del usuario creado entre steps
let lastCreatedUserData: any = null;


Then('hago clic en el botón Nuevo Registro', async ({ page }) => {
    const personalPage = new PersonalPage(page);
    await personalPage.clickBtnNewRegister();
});


When('ingreso un DNI con formato inválido {string}', async ({}, arg: string) => {
  // Step: And ingreso un DNI con formato inválido "123ABC78"
  // From: src\resources\features\personal\registro-personal.feature:56:9
});

When('hago clic en Registrar', async ({}) => {
  // Step: And hago clic en Registrar
  // From: src\resources\features\personal\registro-personal.feature:57:9
});

Then('debo ver un mensaje {string}', async ({}, arg: string) => {
  // Step: Then debo ver un mensaje "DNI debe contener 8 dígitos"
  // From: src\resources\features\personal\registro-personal.feature:58:9
});