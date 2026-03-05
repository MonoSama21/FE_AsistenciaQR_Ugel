@test @purchase @checkout @HU-003 @DailyTest
Feature: Proceso de compra en la tienda en línea

    Como usuario autenticado
    Quiero poder comprar productos en el carrito de compras
    Para completar una compra exitosa y recibir los productos

    Background:
        Given el usuario ha ingresado sesión con éxito en SauceDemo
        When debe ser redirigido a la página de productos    

    @CP-009 @smoke @critical @happy-path @e2e @checkout-flow
    Scenario: CP-009 Validar que se pueda completar una compra exitosa
        And hace clic en el botón Add to cart de un producto
        And hace clic en el ícono del carrito
        And hace clic en Checkout
        And completa el formulario con su información
        And hace clic en Continue y luego en Finish
        Then debe mostrarse un mensaje de confirmación de la compra

    @CP-010 @regression @negative @validation @error-handling @unhappy-path
    Scenario Outline: CP-010 Validar ingreso de información faltante <description> durante el Checkout de una compra
        And hace clic en el botón Add to cart de un producto
        And hace clic en el ícono del carrito
        And hace clic en Checkout
        And completa el formulario sin campo "<campo>"
        And hace clic en Continue
        Then debe mostrarse un mensaje de error "<errorMessage>"

        Examples:
            | campo          | description                | errorMessage                    |
            | nombre         | sin nombre                 | Error: First Name is required   |
            | apellido       | sin apellido               | Error: Last Name is required    |
            | código postal  | sin código postal          | Error: Postal Code is required  |