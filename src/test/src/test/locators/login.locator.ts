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

    get emailTextBox(){
        return this.page.locator('#email');
    }

    get passwordTextBox(){
        return this.page.locator('#password');
    }

    get loginButton(){
        return this.page.locator('#btn-login');
    }

    get headerDashboard(){
        return this.page.locator("#header-dashboard");
    }

    get errorMessage(){
        return this.page.locator("#error-message");
    }


}