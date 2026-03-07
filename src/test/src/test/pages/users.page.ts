import { expect, Page } from '@playwright/test';
import { UsersLocator } from '../locators/users.locator';
import { pageFixture } from '../utiles/pageFixture';
import {faker} from '@faker-js/faker';

export class UsersPage {

    readonly page: Page;
    readonly usersLocator: UsersLocator;
    public lastCreatedUser: any = null;

    constructor(page: Page) {
        this.page = page;
        this.usersLocator = new UsersLocator(page);
    }

    async verifyColum(columna: string) {
        let columnLocator;
        switch (columna) {
            case 'Usuario':
                columnLocator = this.usersLocator.columnUsers;
                break;
            case 'Rol':
                columnLocator = this.usersLocator.columnRole;
                break;
            case 'Empleado':
                columnLocator = this.usersLocator.columnEmpleado;
                break;
            case 'Estado':
                columnLocator = this.usersLocator.columnEstado;
                break;
            case 'Acción':
                columnLocator = this.usersLocator.columnAccion;
                break;
            default:
                throw new Error(`Columna desconocida: ${columna}`);
        }
        await expect(columnLocator).toBeVisible();
        await expect(columnLocator).toContainText(columna);
        console.log(`✅ Columna "${columna}" validada correctamente en el listado de usuarios.`);
    }

    async clickBtnNewUser() {
        await this.usersLocator.btnNewUser.click();
        console.log('✅ Botón "Nuevo Usuario" clickeado correctamente.');
    }

    async fillNewUserForm() {
        const randomData = {
            nombre: `${faker.person.firstName()} ${faker.person.firstName()} ${faker.person.lastName()} ${faker.person.lastName()}`,
            email: faker.internet.email().toLowerCase(),
            telefono: '9' + faker.string.numeric(8),
            password: 'Test123!',
            rol: 'Admin'
        };
        
        await this.usersLocator.inputNombre.fill(randomData.nombre);
        await this.usersLocator.inputEmail.fill(randomData.email);
        await this.usersLocator.inputTelefono.fill(randomData.telefono);
        await this.usersLocator.selectRol.selectOption(randomData.rol);
        await this.usersLocator.inputPassword.fill(randomData.password);
        
        // Guardar datos para validación posterior
        this.lastCreatedUser = randomData;
        console.log(`✅ Formulario completado con datos: ${randomData.nombre} | ${randomData.email}`);
        
        return randomData;
    }

    async clickBtnCreateUser() {
        await this.usersLocator.btnCreateUser.click();
    }

    async verifySuccessMessage(expectedMessage: string) {
        const successMessageLocator = this.usersLocator.successMessage;
        await expect(successMessageLocator).toBeVisible();
        await expect(successMessageLocator).toContainText(expectedMessage);
        console.log(`✅ Mensaje de éxito validado: "${expectedMessage}"`);
    }

    async verifyNewUserAppearsInList(userData?: any) {
        const userToVerify = userData || this.lastCreatedUser;
        
        if (!userToVerify) {
            throw new Error('No hay datos de usuario creado. Debe ejecutar fillNewUserForm() primero o pasar los datos como parámetro.');
        }

        // Esperar que la primera fila sea visible
        await expect(this.usersLocator.firstRowUserName).toBeVisible();

        // Verificar nombre en la primera fila
        await expect(this.usersLocator.firstRowUserName).toContainText(userToVerify.nombre);
        
        // Verificar email en la primera fila
        await expect(this.usersLocator.firstRowEmail).toContainText(userToVerify.email);
        
        // Verificar rol en la primera fila
        await expect(this.usersLocator.firstRowRole).toContainText(userToVerify.rol);
        
        console.log(`✅ Usuario "${userToVerify.nombre}" aparece correctamente en la primera fila del listado.`);
    }

    async verifyUserStatus(expectedStatus: string) {
        await expect(this.usersLocator.firstRowStatus).toBeVisible();
        await expect(this.usersLocator.firstRowStatus).toContainText(expectedStatus);
        console.log(`✅ Estado del usuario validado: "${expectedStatus}"`);
    }

};