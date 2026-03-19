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

    async clickOption(optionName: string) {
        let optionLocator;
        switch (optionName) {
            case 'Home':
                optionLocator = this.sidebarLocator.optionHome;
                break;
            case 'Usuarios':
                optionLocator = this.sidebarLocator.optionUsers;
                break;
            case 'Personal':
                optionLocator = this.sidebarLocator.optionStaff;
                break;
            case 'Asistencia':
                optionLocator = this.sidebarLocator.optionAttendance;
                break;
            case 'Reporte Asistencia':
                optionLocator = this.sidebarLocator.optionReportAttendance;
                break;
            default:
                throw new Error(`❌ Opción no reconocida: "${optionName}"`);
        }
        await optionLocator.click();
        console.log(`✅ Clic en la opción "${optionName}" del menú lateral.`);
    }

    async verifyNavigation(optionName: string) {
        let expectedUrlFragment;
        switch (optionName) {
            case 'Home':
                expectedUrlFragment = 'home';
                break;
            case 'Usuarios':
                expectedUrlFragment = 'usuarios';
                break;
            case 'Personal':
                expectedUrlFragment = 'personal';
                break;
            case 'Asistencia':
                expectedUrlFragment = 'asistencia';
                break;
            case 'Reportes de Asistencia':
                expectedUrlFragment = 'reporte-asistencia';
                break;
            default:
                throw new Error(`❌ Opción no reconocida para navegación: "${optionName}"`);
        }
        await expect(this.page).toHaveURL(new RegExp(`${expectedUrlFragment}$`));
        console.log(`✅ Navegación a la pantalla de "${optionName}" verificada correctamente.`);
    }

    async verifyLogoutButton() {
        await expect(this.sidebarLocator.btnLogout).toBeVisible();
        console.log('✅ El botón Cerrar Sesión está visible en el menú lateral.');
    }

    async clickLogoutButton() {
        await this.sidebarLocator.btnLogout.click();
        console.log('✅ Clic en el botón Cerrar Sesión del menú lateral.');
    }

    async verifyOptionsSidebarAdmin(optionHome: string, optionUsers: string, optionStaff: string, optionAttendance: string, optionReportAttendance: string) {
        const expectedOptions = [optionHome, optionUsers, optionStaff, optionAttendance, optionReportAttendance];
        await expect(this.sidebarLocator.allMenuOptions).toHaveCount(expectedOptions.length);
        const allOptionsTexts = await this.sidebarLocator.allMenuOptions.allTextContents();
        
        for (const optionText of expectedOptions) {
            if (!allOptionsTexts.some(text => text.trim() === optionText)) {
                throw new Error(`❌ Falta la opción "${optionText}" en el menú lateral."`);
            }
            console.log(`✅ Opción "${optionText}" encontrada en el menú lateral.`);
        }

        for (const text of allOptionsTexts) {
            if (!expectedOptions.includes(text.trim())) {
                throw new Error(`❌ Opción inesperada encontrada en el menú: "${text.trim()}"`);
            }

        }
        console.log('✅ Opciones del menú lateral para administrador validadas correctamente.');
    }

    async verifyOptionsSidebarPersonal(optionHome: string, optionAttendance: string) {
        const expectedOptions = [optionHome, optionAttendance];
        await expect(this.sidebarLocator.allMenuOptions).toHaveCount(expectedOptions.length);
        const allOptionsTexts = await this.sidebarLocator.allMenuOptions.allTextContents();

        for (const optionText of expectedOptions) {
            if (!allOptionsTexts.some(text => text.trim() === optionText)) {
                throw new Error(`❌ Falta la opción "${optionText}" en el menú lateral."`);
            }
            console.log(`✅ Opción "${optionText}" encontrada en el menú lateral.`);
        }

        for (const text of allOptionsTexts) {
            if (!expectedOptions.includes(text.trim())) {
                throw new Error(`❌ Opción inesperada encontrada en el menú: "${text.trim()}"`);
            }
        }
        console.log('✅ Opciones del menú lateral para personal validadas correctamente.');
    }

};