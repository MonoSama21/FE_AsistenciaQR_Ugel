@test @shoppingCart @cart @HU-002 @DailyTest
Feature: Carrito de compras en la tienda en línea

    Como usuario de la tienda en línea SauceDemo
    Quiero poder seleccionar productos y agregarlos al carrito de compras
    Para poder revisar y gestionar los productos seleccionados antes de realizar una compra

    Background:
        Given el usuario ha ingresado sesión con éxito en SauceDemo
        When debe ser redirigido a la página de productos    

    @CP-007 @smoke @critical @happy-path @cart-management
    Scenario: CP-007 Validar que se pueda agregar un producto al carrito de compras
        And hace clic en el botón Add to cart de un producto
        Then el ícono del carrito debe mostrar la cantidad de productos actualizada

    @CP-008 @regression @happy-path @cart-validation @ui-validation
    Scenario: CP-008 Validar que el carrito de compras muestre el producto seleccionado
        And hace clic en el botón Add to cart de un producto
        And hace clic en el ícono del carrito
        Then debe visualizar el productos seleccionado con su nombre, descripción y precio