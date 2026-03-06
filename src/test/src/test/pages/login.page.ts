import { expect, Page } from '@playwright/test';
import { LoginLocator } from '../locators/login.locator';
import { pageFixture } from '../utiles/pageFixture';

export class LoginPage {

    readonly page: Page;
    readonly loginLocator: LoginLocator;

    constructor(page: Page) {
        this.page = page;
        this.loginLocator = new LoginLocator(page);
    }

    async navigateToUrl(url: string) {
        await this.page.goto(url);
    }

    async fillEmail(email: string) {
        await this.loginLocator.emailTextBox.waitFor({ state: 'visible' });
        await this.loginLocator.emailTextBox.isEnabled();
        await this.loginLocator.emailTextBox.fill(email);
    }

    async fillPassword(password: string) {
        await this.loginLocator.passwordTextBox.waitFor({ state: 'visible' });
        await this.loginLocator.passwordTextBox.isEnabled();
        await this.loginLocator.passwordTextBox.fill(password);
    }

    async clickLoginButton() {
        await this.loginLocator.loginButton.click();
    }

    async verifySuccessfulLogin() {
        await expect(this.loginLocator.headerDashboard).toBeVisible();
        console.log('✅ Login exitoso, redirigido a la aplicacion de QR UGEL');
    }

    async verifyErrorMessage(expectedMessage: string) {
        await expect(this.loginLocator.errorMessage).toBeVisible();
        await expect(this.loginLocator.errorMessage).toContainText(expectedMessage);
        console.log(`✅ Mensaje de error validado: "${expectedMessage}"`);
    }

    async verifyLoginScreen() {
        await expect(this.loginLocator.emailTextBox).toBeVisible();
        await expect(this.loginLocator.passwordTextBox).toBeVisible();
        await expect(this.loginLocator.loginButton).toBeVisible();
        console.log('✅ Pantalla de login validada correctamente.');
    }
};