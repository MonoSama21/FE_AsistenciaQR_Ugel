import { Page } from '@playwright/test'

export class PersonalLocator {
    readonly page: Page;


    constructor(page: Page) {
        this.page = page;
    }

    get btnNewRegister(){
        return this.page.locator("#btn-nuevo-personal");
    }

}