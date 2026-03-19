import { Page } from '@playwright/test'

export class PersonalLocator {
    readonly page: Page;


    constructor(page: Page) {
        this.page = page;
    }

    get btnNewRegister(){
        return this.page.locator("#btn-nuevo-personal");
    }

    get btnCreatePersonal(){
        return this.page.locator("#btn-registrar-personal");
    }


    get inputDni(){
        return this.page.locator("#input-dni");
    }

    get inputNombres(){
        return this.page.locator("#input-nombres");
    }

    get inputApellidos(){
        return this.page.locator("#input-apellidos");
    }

    get inputCargo(){
        return this.page.locator("#input-buscar-cargo");
    }

    get optionsCargo(){
        return this.page.locator('.text-sm.font-semibold.text-gray-800');
    }

    get inputDistrito(){
        return this.page.locator("#input-buscar-distrito");
    }

    get optionsDistrito(){
        return this.page.locator('.dropdown-distrito-container .text-sm.font-semibold.text-gray-800');
    }

    get successMessage() {
        return this.page.locator("#msg-success-crear");
    }

    get btnVerPersonal(){
        return this.page.locator('button:has-text("Ver")');
    }

    get btnCarnePersonal(){
        return this.page.locator('button:has-text("Carné")');
    }

    get btnFotoPersonal(){
        return this.page.locator('button:has-text("Foto")');
    }

    get modalDetalles(){
        return this.page.locator('[data-testid="modal-detalles"]');
    }

    get msgErrorDetalles(){
        return this.page.locator("#msg-error-detalles");
    }

    get btnCerrarDetalles(){
        return this.page.locator("#btn-cerrar-detalles");
    }

}