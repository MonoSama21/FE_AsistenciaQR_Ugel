import { Page } from '@playwright/test'

export class HomeLocator {
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
    

}