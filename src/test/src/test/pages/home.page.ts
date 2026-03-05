import { expect, Page } from '@playwright/test';
import { HomeLocator } from '../locators/home.locator';
import { pageFixture } from '../utiles/pageFixture';

export class HomePage {

    readonly page: Page;
    readonly homeLocator: HomeLocator;

    constructor(page: Page) {
        this.page = page;
        this.homeLocator = new HomeLocator(page);
    }


    async verifyMessageWelcome() {
        await expect(this.homeLocator.welcomeTitle).toBeVisible();
        await expect(this.homeLocator.systemDescription).toBeVisible();
        console.log('✅ Mensaje de bienvenida personalizado validado correctamente.');
    }


};