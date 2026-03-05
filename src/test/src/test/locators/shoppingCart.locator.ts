import { Page } from '@playwright/test'

export class ShoppingCartLocator {
    readonly page: Page;


    constructor(page: Page) {
        this.page = page;
    }

    get optionExecutive(){
        return this.page.getByText('Directivo');
    }

    get itemsContainer(){
        return this.page.locator('#inventory_container .inventory_item');
    }

    get itemName(){
        return this.page.locator('.inventory_item_name');
    }

    get itemDescription(){
        return this.page.locator('.inventory_item_desc');
    }

    get itemPrice(){
        return this.page.locator('.inventory_item_price');
    }

    get btnAddToCart(){
        return this.page.locator('button:has-text("Add to cart")');
    }

    get btnCart(){
        return this.page.locator('a.shopping_cart_link');
    }
    
    get countItems(){
        return this.page.locator('.shopping_cart_badge');
    }

    get cartItem(){
        return this.page.locator('.cart_item');
    }

    get btnCheckout(){
        return this.page.getByRole('button', {name: 'Checkout'});
    }

    get inputFirstName(){
        return this.page.locator('#first-name');
    }

    get inputLastName(){
        return this.page.locator('#last-name');
    }

    get inputPostalCode(){
        return this.page.locator('#postal-code');
    }

    get btnContinue(){
        return this.page.locator("#continue");
    }

    get btnFinish(){
        return this.page.locator("#finish");
    }

    get confirmationMessage(){
        return this.page.locator('#checkout_complete_container');
    }

    get errorMessageContainer(){
        return this.page.locator('h3[data-test="error"]');
    }

}