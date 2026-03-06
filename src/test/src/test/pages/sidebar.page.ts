import { expect, Page } from '@playwright/test';
import { SidebarLocator } from '../locators/sidebar.locator';
import { pageFixture } from '../utiles/pageFixture';

export class SidebarPage {

    readonly page: Page;
    readonly sidebarLocator: SidebarLocator;

    constructor(page: Page) {
        this.page = page;
        this.sidebarLocator = new SidebarLocator(page);
    }


    async verifyMessageWelcome() {
        await expect(this.sidebarLocator.welcomeTitle).toBeVisible();
        await expect(this.sidebarLocator.systemDescription).toBeVisible();
        console.log('✅ Mensaje de bienvenida personalizado validado correctamente.');
    }

    async verifySidebar() {
        await expect(this.sidebarLocator.sidebarMenu).toBeVisible();
        console.log('✅ El menú lateral se muestra correctamente.');
    }

    async verifyOptionsSidebar() {
        const expectedOptions = ['Home', 'Usuarios', 'Personal', 'Asistencia', 'Reporte Asistencia'];
        
        // Validar que hay exactamente 5 opciones (no más, no menos)
        await expect(this.sidebarLocator.allMenuOptions).toHaveCount(expectedOptions.length);
        console.log(`✅ Cantidad correcta de opciones: ${expectedOptions.length}`);

        // Validar cada opción individualmente
        await expect(this.sidebarLocator.optionHome).toBeVisible();
        await expect(this.sidebarLocator.optionHome).toContainText(expectedOptions[0]);

        await expect(this.sidebarLocator.optionUsers).toBeVisible();
        await expect(this.sidebarLocator.optionUsers).toContainText(expectedOptions[1]);

        await expect(this.sidebarLocator.optionStaff).toBeVisible();
        await expect(this.sidebarLocator.optionStaff).toContainText(expectedOptions[2]);

        await expect(this.sidebarLocator.optionAttendance).toBeVisible();
        await expect(this.sidebarLocator.optionAttendance).toContainText(expectedOptions[3]);
        
        await expect(this.sidebarLocator.optionReportAttendance).toBeVisible();
        await expect(this.sidebarLocator.optionReportAttendance).toContainText(expectedOptions[4]);
        
        // Validación adicional: verificar que cada opción encontrada esté en la lista esperada
        const allOptionsTexts = await this.sidebarLocator.allMenuOptions.allTextContents();
        for (const optionText of allOptionsTexts) {
            if (!expectedOptions.includes(optionText.trim())) {
                throw new Error(`❌ Opción inesperada encontrada en el menú: "${optionText.trim()}"`);
            }
        }
        
        console.log('✅ Todas las opciones del menú lateral están presentes, visibles y no hay opciones adicionales.');
    }    
};