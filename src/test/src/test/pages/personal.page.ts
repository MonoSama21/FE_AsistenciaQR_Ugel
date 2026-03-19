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

        // Seleccionar Cargo
        await this.personalLocator.inputCargo.click();
        const opcionesLocator = this.personalLocator.optionsCargo;
        await opcionesLocator.first().waitFor({ state: 'visible', timeout: 5000 });
        const opcionesCargo = await opcionesLocator.allTextContents();

        if (opcionesCargo.length === 0) {
            throw new Error('❌ No se encontraron opciones de cargo en el dropdown.');
        }

        const randomCargoIndex = Math.floor(Math.random() * opcionesCargo.length);
        const cargoSeleccionado = opcionesCargo[randomCargoIndex];
        await this.page.getByText(cargoSeleccionado, { exact: true }).click();

        // Seleccionar Distrito
        await this.personalLocator.inputDistrito.click();
        const opcionesDistritoLocator = this.personalLocator.optionsDistrito;
        await opcionesDistritoLocator.first().waitFor({ state: 'visible', timeout: 5000 });
        const opcionesDistrito = await opcionesDistritoLocator.allTextContents();

        if (opcionesDistrito.length === 0) {
            throw new Error('❌ No se encontraron opciones de distrito en el dropdown.');
        }

        const randomDistritoIndex = Math.floor(Math.random() * opcionesDistrito.length);
        const distritoSeleccionado = opcionesDistrito[randomDistritoIndex];
        
        // Hacer clic en el distrito seleccionado dentro del contenedor correcto
        await this.page.locator('.dropdown-distrito-container').locator(`text=${distritoSeleccionado}`).click();

        // Guardar el usuario creado para validaciones posteriores
        this.lastCreatedUser = { 
            ...randomData, 
            cargo: cargoSeleccionado,
            distrito: distritoSeleccionado 
        };

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

    async clickBtnVerPersonal(index: number = 0) {
        const botonesVer = await this.page.locator('button:has-text("Ver")').all();
        if (botonesVer.length === 0) {
            throw new Error('❌ No se encontraron botones "Ver" en la tabla.');
        }
        await botonesVer[index].click();
        console.log('✅ Botón "Ver" clickeado correctamente.');
    }

    async verifyDetallesPersonalLoaded() {
        // Esperamos a que se carguen los detalles
        await expect(this.page.locator('text=Nombre Completo')).toBeVisible({ timeout: 10000 });
        console.log('✅ Detalles del personal cargados correctamente.');
    }

    async verifyDetallesPersonalContain(nombre: string, dni: string) {
        await expect(this.page.locator(`text=${nombre}`)).toBeVisible();
        await expect(this.page.locator(`text=${dni}`)).toBeVisible();
        console.log(`✅ Detalles verificados: ${nombre}, ${dni}`);
    }

    async verifyDetallesErrorMessage(mensaje: string) {
        const errorLocator = this.personalLocator.msgErrorDetalles;
        await expect(errorLocator).toBeVisible();
        await expect(errorLocator).toContainText(mensaje);
        console.log(`✅ Mensaje de error validado: "${mensaje}"`);
    }

    async cerrarModalDetalles() {
        await this.personalLocator.btnCerrarDetalles.click();
        console.log('✅ Modal de detalles cerrado correctamente.');
    }
    

};