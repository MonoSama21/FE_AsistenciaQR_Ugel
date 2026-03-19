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

When('completo el formulario con DNI, Nombres, Apellidos, Cargo y Distrito válidos', async ({page}) => {
  const personalPage = new PersonalPage(page);
  await personalPage.fillNewPersonalForm();
});

When('hago clic en Registrar', async ({page}) => {
  const personalPage = new PersonalPage(page);
  await personalPage.clickBtnCreatePersonal();
});

Then('el nuevo personal debe aparecer en el listado', async ({}) => {
  // Step: And el nuevo personal debe aparecer en el listado
  // From: src\resources\features\personal\registro-personal.feature:19:9
});

Then('el personal debe tener estado un QR', async ({}) => {
  // Step: And el personal debe tener estado un QR
  // From: src\resources\features\personal\registro-personal.feature:20:9
});


Then('se debe ver un mensaje de confirmación {string}', async ({page}, mensajeExitoso: string) => {
    const personalPage = new PersonalPage(page);
    await personalPage.verifySuccessMessagePersonal(mensajeExitoso);
});


When('observo un registro de empleado sin fotografía', async ({}) => {
  // Step: When observo un registro de empleado sin fotografía
  // From: src\resources\features\personal\registro-personal.feature:24:9
});

When('hago clic en el botón Foto', async ({}) => {
  // Step: And hago clic en el botón Foto
  // From: src\resources\features\personal\registro-personal.feature:25:9
});

When('selecciono una imagen válida JPG, PNG', async ({}) => {
  // Step: And selecciono una imagen válida (JPG, PNG)
  // From: src\resources\features\personal\registro-personal.feature:26:9
});

When('la imagen debe mostrarse como vista previa', async ({}) => {
  // Step: And la imagen debe mostrarse como vista previa
  // From: src\resources\features\personal\registro-personal.feature:27:9
});

When('hago clic en Subir Foto', async ({}) => {
  // Step: And hago clic en Subir Foto
  // From: src\resources\features\personal\registro-personal.feature:28:9
});

Then('debo ver un mensaje {string}', async ({}, arg: string) => {
  // Step: Then debo ver un mensaje "Foto subida correctamente"
  // From: src\resources\features\personal\registro-personal.feature:29:9
});

Then('la imagen debe guardarse correctamente con el registro', async ({}) => {
  // Step: And la imagen debe guardarse correctamente con el registro
  // From: src\resources\features\personal\registro-personal.feature:30:9
});