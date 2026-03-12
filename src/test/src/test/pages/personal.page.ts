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


};