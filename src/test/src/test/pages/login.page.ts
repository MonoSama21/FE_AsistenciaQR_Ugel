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

    async fillUsername(username: string) {
        await this.loginLocator.usernameTextBox.waitFor({ state: 'visible' });
        await this.loginLocator.usernameTextBox.isEnabled();
        await this.loginLocator.usernameTextBox.fill(username);
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
        await expect(this.loginLocator.headerProducts).toBeVisible();
    }

    async verifyErrorMessage(expectedMessage: string) {
        await expect(this.loginLocator.incorrectCredentialsAlert).toBeVisible();
        await expect(this.loginLocator.incorrectCredentialsAlert).toContainText(expectedMessage);
        console.log(`✅ Mensaje de error validado: "${expectedMessage}"`);
    }
};