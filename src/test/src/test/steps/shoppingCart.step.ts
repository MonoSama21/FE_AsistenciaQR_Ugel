import { createBdd } from 'playwright-bdd';
import { test, expect } from '../utiles/test-fixtures';
import { ShoppingCartPage } from '../pages/shoppingCart.page';
import { error, log } from 'console';

const { Given, When, Then } = createBdd(test);

let selectProduct: { name: string; description: string; price: string; };

When('hace clic en el botón Add to cart de un producto', async ({ page }) => {
    const shoppingCartPage = new ShoppingCartPage(page);
    selectProduct = await shoppingCartPage.clickRandomProduct();
});

Then('el ícono del carrito debe mostrar la cantidad de productos actualizada', async ({ page }) => {
    const shoppingCartPage = new ShoppingCartPage(page);
    await shoppingCartPage.verifyCountItem();
});

When('hace clic en el ícono del carrito', async ({ page }) => {
    const shoppingCartPage = new ShoppingCartPage(page);
    await shoppingCartPage.clickOnCart();
});

Then('debe visualizar el productos seleccionado con su nombre, descripción y precio', async ({ page }) => {
    const { name, description, price } = selectProduct;
    console.log(`🛒 Producto en el carrito -> Nombre: ${name} | Precio: ${price} | Descripción: ${description}`);
    const shoppingCartPage = new ShoppingCartPage(page);
    await shoppingCartPage.verifyProductInCart(name, description, price);
});


When('hace clic en Checkout', async ({ page }) => {
  const shoppingCartPage = new ShoppingCartPage(page);
  await shoppingCartPage.clickbtnCheckout();
});

When('completa el formulario con su información', async ({ page }) => {
  const shoppingCartPage = new ShoppingCartPage(page);
  await shoppingCartPage.fillCheckoutInformation('Yrvin', 'Pachas Saravia', '4390000');
});

When('hace clic en Continue y luego en Finish', async ({ page }) => {
  const shoppingCartPage = new ShoppingCartPage(page);
  await shoppingCartPage.clickbtnContinue();
  await shoppingCartPage.clickbtnFinish();
});

Then('debe mostrarse un mensaje de confirmación de la compra', async ({ page }) => {
  const shoppingCartPage = new ShoppingCartPage(page);
    await shoppingCartPage.orderConfirmationMessage();
});

When('completa el formulario sin campo {string}', async ({ page }, campo: string) => {
  // campo puede ser "nombre", "apellido" o "codigo"
  const shoppingCartPage = new ShoppingCartPage(page);
  await shoppingCartPage.fillCheckoutWithMissingField(campo);
});

When('hace clic en Continue', async ({ page }) => {
  const shoppingCartPage = new ShoppingCartPage(page);
  await shoppingCartPage.clickbtnContinue();
});

Then('debe mostrarse un mensaje de error {string}', async ({ page }, expectedMessage: string) => {
  const shoppingCartPage = new ShoppingCartPage(page);
  await shoppingCartPage.validateErrorMessage(expectedMessage);
});