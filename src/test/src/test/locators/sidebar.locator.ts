import { Page } from '@playwright/test'

export class SidebarLocator {
    readonly page: Page;


    constructor(page: Page) {
        this.page = page;
    }

    get welcomeTitle(){
        return this.page.locator("#welcome-title");
    }

    get systemDescription(){
        return this.page.locator("#system-description");
    }

    get sidebarMenu(){
        return this.page.locator("#sidebar-menu");
    }

    get optionHome(){
        return this.page.locator('#menu-home');
    }

    get optionUsers(){
        return this.page.locator('#menu-usuarios');
    }

    get optionStaff(){
        return this.page.locator('#menu-personal');
    }

    get optionAttendance(){
        return this.page.locator('#menu-asistencia');
    }
    
    get optionReportAttendance(){
        return this.page.locator('#menu-reporte-asistencia');
    }

    // Obtener todas las opciones del menú (para validar que no haya opciones adicionales)
    get allMenuOptions(){
        return this.page.locator('#sidebar-menu nav ul li a');
    }

}