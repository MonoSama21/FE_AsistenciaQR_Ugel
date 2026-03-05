import { Page } from '@playwright/test'

export class LoginLocator {
    readonly page: Page;


    constructor(page: Page) {
        this.page = page;
    }

    get optionExecutive(){
        return this.page.getByText('Directivo');
    }
    
    get optionTeacherPrimary(){
        return this.page.getByText('Profesor (Primaria)');
    }

    get usernameTextBox(){
        return this.page.locator('#user-name');
    }

    get passwordTextBox(){
        return this.page.locator('#password');
    }

    get loginButton(){
        return this.page.locator('#login-button');
    }

    get headerProducts(){
        return this.page.locator("#header_container");
    }

    get incorrectCredentialsAlert(){
        return this.page.locator("//div[@class='error-message-container error']");
    }


}