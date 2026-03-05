import { expect, Page } from '@playwright/test';
import { ShoppingCartLocator } from '../locators/shoppingCart.locator';
import { pageFixture } from '../utiles/pageFixture';

export class ShoppingCartPage {

    readonly page: Page;
    readonly shoppingCartLocator: ShoppingCartLocator;

    constructor(page: Page) {
        this.page = page;
        this.shoppingCartLocator = new ShoppingCartLocator(page);
    }

    async navigateToUrl(url: string) {
        await this.page.goto(url);
    }

    async clickRandomProduct() {
        const totalItems = await this.shoppingCartLocator.itemsContainer.count();
        const index = Math.floor(Math.random() * totalItems);
        const item = this.shoppingCartLocator.itemsContainer.nth(index);
        const name = await item.locator(this.shoppingCartLocator.itemName).innerText();
        const description = await item.locator(this.shoppingCartLocator.itemDescription).innerText();
        const price = await item.locator(this.shoppingCartLocator.itemPrice).innerText();
        console.log(`✅ Agregado al carrito -> Nombre: ${name} | Precio: ${price} | Descripción: ${description}`);
        await item.locator(this.shoppingCartLocator.btnAddToCart).click();
        return { name, description, price };
    }

    async verifyCountItem(){
        const cartIconBadge = this.shoppingCartLocator.countItems; 
        await cartIconBadge.waitFor({ state: 'visible' });   
        const cartCountText = await cartIconBadge.innerText(); 
        const cartCount = parseInt(cartCountText);
        expect(cartCount).toBeGreaterThanOrEqual(1);
        console.log(`🛒 El carrito muestra: ${cartCount} producto seleccionado`);
    }

    async clickOnCart(){
        await this.shoppingCartLocator.btnCart.click();
    }

    async verifyProductInCart(expectedName: string, expectedDescription: string, expectedPrice: string, ) {
        await this.shoppingCartLocator.cartItem.waitFor({ state: 'visible' });
        // HACEMOS LA VALIDACION DE LOS CAMPOS 
        const actualName = await this.shoppingCartLocator.itemName.innerText();
        expect(actualName).toBe(expectedName);

        const actualDescription = await this.shoppingCartLocator.itemDescription.innerText();
        expect(actualDescription).toBe(expectedDescription);
    
        const actualPrice = await this.shoppingCartLocator.itemPrice.innerText();
        expect(actualPrice).toBe(expectedPrice);
    
        console.log(`🛒 Validado en el carrito -> Nombre: ${actualName} | Precio: ${actualPrice} | Descripción: ${actualDescription}`);    
    }

    async clickbtnCheckout(){
        await this.shoppingCartLocator.btnCheckout.click();
    }

    async fillFirstName(firstName: string) {
        await this.shoppingCartLocator.inputFirstName.fill(firstName);
    }

    async fillLastName(lastName: string) {
        await this.shoppingCartLocator.inputLastName.fill(lastName);
    }
    async fillPostalCode(postalCode: string) {
        await this.shoppingCartLocator.inputPostalCode.fill(postalCode);
    }

    async fillCheckoutInformation(firstName: string, lastName: string, postalCode: string) {
        await this.fillFirstName(firstName);
        await this.fillLastName(lastName);
        await this.fillPostalCode(postalCode);
    }

    async clickbtnContinue(){
        await this.shoppingCartLocator.btnContinue.click();
    }

    async clickbtnFinish(){
        await this.shoppingCartLocator.btnFinish.click();
    }

    async orderConfirmationMessage(){
        await this.shoppingCartLocator.confirmationMessage.waitFor({ state: 'visible' });
        console.log('✅ Compra finalizada con éxito. Mensaje de confirmación visible.');
    }

    async validateErrorMessage(expectedMessage: string) {
        await this.shoppingCartLocator.errorMessageContainer.waitFor({ state: 'visible'});
        const actualMessage = await this.shoppingCartLocator.errorMessageContainer.innerText();
        expect(actualMessage).toContain(expectedMessage);
        console.log(`✅ Mensaje de error validado: "${expectedMessage}"`);
    }

    /**
     * Llena el formulario de checkout dejando vacío el campo indicado
     * @param fieldToSkip: "nombre" | "apellido" | "codigo"
     */

    async fillCheckoutWithMissingField(fieldToSkip: string) {
        const firstName = fieldToSkip === 'nombre' ? '' : 'Yrvin';
        const lastName = fieldToSkip === 'apellido' ? '' : 'Pachas Saravia';
        const postalCode = fieldToSkip === 'código postal' ? '' : '4390000';
        await this.fillCheckoutInformation(firstName, lastName, postalCode);
    }
};