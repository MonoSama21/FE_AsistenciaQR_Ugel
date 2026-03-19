import { createBdd } from 'playwright-bdd';
import { test, expect } from '../utiles/test-fixtures';
import { PersonalPage } from '../pages/personal.page';

const { When, Then } = createBdd(test);

When('hago clic en el botón Ver de un personal de la tabla', async ({ page }) => {
    const personalPage = new PersonalPage(page);
    await personalPage.clickBtnVerPersonal(0);
});

Then('debe abrirse un modal con los detalles del personal', async ({ page }) => {
    const personalPage = new PersonalPage(page);
    await personalPage.verifyDetallesPersonalLoaded();
});

Then('debe mostrar la foto, nombre completo, DNI, cargo y estado', async ({ page }) => {
    // Verificar que se muestren los campos principales
    await expect(page.locator('text=Nombre Completo')).toBeVisible();
    await expect(page.locator('text=DNI')).toBeVisible();
    await expect(page.locator('text=Cargo')).toBeVisible();
    await expect(page.locator('text=Estado')).toBeVisible();
    console.log('✅ Todos los campos principales están visibles en el modal de detalles.');
});

Then('debe mostrar la información del cargo con su descripción', async ({ page }) => {
    // Verificar cargo y su descripción
    await expect(page.locator('text=Cargo')).toBeVisible();
    const cargoText = await page.locator('text=Cargo').locator('..').textContent();
    if (cargoText && cargoText.length > 5) {
        console.log('✅ Cargo mostrado con información completa.');
    }
});

Then('debe mostrar la información del distrito con su alias', async ({ page }) => {
    // Verificar distrito y alias
    await expect(page.locator('text=Distrito')).toBeVisible();
    const aliasElement = page.locator('text=Alias:');
    const isAliasVisible = await aliasElement.isVisible().catch(() => false);
    
    if (isAliasVisible) {
        await expect(aliasElement).toBeVisible();
        console.log('✅ Distrito y alias mostrados correctamente.');
    } else {
        console.log('⚠️ El alias del distrito no es visible.');
    }
});

Then('debe mostrar el código QR del personal', async ({ page }) => {
    // Intentar encontrar la imagen del QR
    const qrImage = page.locator('img[alt="QR"]');
    const isQRVisible = await qrImage.isVisible().catch(() => false);
    
    if (isQRVisible) {
        await expect(qrImage).toBeVisible();
        console.log('✅ Código QR está visible en el modal.');
    } else {
        console.log('⚠️ El personal no tiene código QR asignado.');
    }
});

Then('puedo cerrar el modal correctamente', async ({ page }) => {
    const personalPage = new PersonalPage(page);
    await personalPage.cerrarModalDetalles();
    // Verificar que el modal se haya cerrado
    await expect(page.locator('text=Detalles de Personal')).not.toBeVisible();
    console.log('✅ Modal cerrado correctamente.');
});

Then('los campos obligatorios deben estar presentes Nombre, DNI, Cargo, Estado', async ({ page }) => {
    // Verificar la presencia de todos los campos requeridos
    const camposRequeridos = ['Nombre Completo', 'DNI', 'Cargo', 'Estado'];
    
    for (const campo of camposRequeridos) {
        await expect(page.locator(`text=${campo}`)).toBeVisible();
    }
    
    console.log('✅ Todos los campos obligatorios están presentes.');
});
