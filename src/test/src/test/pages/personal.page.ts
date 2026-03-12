import { expect, Page } from '@playwright/test';
import { PersonalLocator } from '../locators/personal.locator';
import { pageFixture } from '../utiles/pageFixture';
import {faker} from '@faker-js/faker';

export class PersonalPage {

    readonly page: Page;
    readonly personalLocator: PersonalLocator;
    public lastCreatedUser: any = null;

    constructor(page: Page) {
        this.page = page;
        this.personalLocator = new PersonalLocator(page);
    }

    async clickBtnNewRegister() {
        await this.personalLocator.btnNewRegister.click();
        console.log('✅ Botón "Nuevo Registro" clickeado correctamente.');
    }

    async fillNewPersonalForm() {
        const randomData = {
            dni: faker.string.numeric(8),
            nombres: `${faker.person.firstName()} ${faker.person.firstName()}`,
            apellidos: `${faker.person.lastName()} ${faker.person.lastName()}`,
        };

        // Llenar campos básicos
        await this.personalLocator.inputDni.fill(randomData.dni);
        await this.personalLocator.inputNombres.fill(randomData.nombres);
        await this.personalLocator.inputApellidos.fill(randomData.apellidos);

        // Abrir el dropdown de cargo
        await this.personalLocator.inputCargo.click();

        // Esperar a que al menos una opción esté visible (máx 5s)
        const opcionesLocator = this.personalLocator.optionsCargo;
        await opcionesLocator.first().waitFor({ state: 'visible', timeout: 5000 });

        // Obtener todas las opciones
        const opcionesCargo = await opcionesLocator.allTextContents();

        if (opcionesCargo.length === 0) {
            throw new Error('❌ No se encontraron opciones de cargo en el dropdown.');
        }

        // Elegir una opción aleatoria
        const randomIndex = Math.floor(Math.random() * opcionesCargo.length);
        const cargoSeleccionado = opcionesCargo[randomIndex];

        // Seleccionar la opción aleatoria
        await this.personalLocator.optionsCargo.getByText(cargoSeleccionado, { exact: true }).click();

        // Guardar el usuario creado para validaciones posteriores
        this.lastCreatedUser = { ...randomData, cargo: cargoSeleccionado };

        console.log('✅ Formulario de nuevo personal llenado correctamente:', this.lastCreatedUser);
    }

    async clickBtnCreatePersonal() {
        await this.personalLocator.btnCreatePersonal.click();
    }

    async verifySuccessMessagePersonal(mensajeExitoso: string) {
        const successMessageLocator = this.personalLocator.successMessage;
        await expect(successMessageLocator).toBeVisible();
        await expect(successMessageLocator).toContainText(mensajeExitoso);
        console.log(`✅ Mensaje de éxito validado: "${mensajeExitoso}"`);
    }
    

};