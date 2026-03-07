import { Page } from '@playwright/test'

export class UsersLocator {
    readonly page: Page;


    constructor(page: Page) {
        this.page = page;
    }

    get welcomeTitle(){
        return this.page.locator("#welcome-title");
    }

    get columnUsers(){
        return this.page.locator("#col-usuario");
    }

    get columnRole(){
        return this.page.locator("#col-rol");
    }

    get columnEmpleado(){
        return this.page.locator("#col-empleado");
    }

    get columnEstado(){
        return this.page.locator("#col-estado");
    }

    get columnAccion(){
        return this.page.locator("#col-accion");
    }

    get tableRows(){
        return this.page.locator("#tabla-usuarios tbody tr");
    }

    get tableBody(){
        return this.page.locator("#tabla-usuarios tbody");
    }

    get btnNewUser(){
        return this.page.locator("#btn-nuevo-usuario");
    }

    get inputNombre(){ 
        return this.page.locator("#input-nombre");
    }

    get inputEmail(){
        return this.page.locator("#input-email");
    }

    get inputTelefono(){
        return this.page.locator("#input-telefono");
    }

    get selectRol(){
        return this.page.locator("#select-rol");
    }

    get inputPassword(){
        return this.page.locator("#input-password");
    }

    get btnCreateUser(){
        return this.page.locator("#btn-guardar-usuario");
    }
    
    get successMessage(){
        return this.page.locator("#mensaje-exito");
    }

    get firstRowUserName(){
        return this.page.locator("#tabla-usuarios tbody tr:first-child td:nth-child(2)");
    }

    get firstRowRole(){
        return this.page.locator("#tabla-usuarios tbody tr:first-child td:nth-child(3)");
    }

    get firstRowEmail(){
        return this.page.locator("#tabla-usuarios tbody tr:first-child td:nth-child(4)");
    }

    get firstRowStatus(){
        return this.page.locator("#tabla-usuarios tbody tr:first-child td:nth-child(5)");
    }

}