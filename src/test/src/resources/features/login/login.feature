@test @login @authentication @HU-001 @DailyTest @WeekendTest
Feature: Inicio de sesión en SauceDemo

    Como usuario de SauceDemo
    Quiero iniciar sesión con credenciales válidas
    Para acceder a la página de productos

    Background:
      Given el usuario se encuentra en el login de SauceDemo

    @CP-001 @smoke @critical @happy-path
    Scenario: CP-001 Login exitoso con usuario válido
      When ingresa un nombre de usuario válido y contraseña válida
      And hace clic en el botón Login
      Then debe ser redirigido a la página de productos

    @CP-002 @regression @negative @error-handling @unhappy-path
    Scenario: CP-002 Login fallido con contraseña incorrecta
      When ingresa un nombre de usuario válido y contraseña incorrecta
      And hace clic en el botón Login
      Then debe ver un mensaje de error: "Epic sadface: Username and password do not match any user in this service"

    @CP-003 @regression @negative @security @unhappy-path
    Scenario: CP-003 Login fallido con cuenta bloqueada
        When ingresa un nombre de usuario bloqueado y contraseña válida
        And hace clic en el botón Login
        Then debe ver un mensaje de error: "Epic sadface: Sorry, this user has been locked out."

    @CP-004 @regression @negative @error-handling @unhappy-path
    Scenario: CP-004 Login fallido con credenciales inválidas
        When ingresa un nombre de usuario inválido y contraseña incorrecta
        And hace clic en el botón Login
        Then debe ver un mensaje de error: "Epic sadface: Username and password do not match any user in this service"

    @CP-005 @regression @negative @validation @unhappy-path
    Scenario: CP-005 Login fallido con campo de usuario vacío
        When deja vacío el campo de usuario e ingresa una contraseña válida
        And hace clic en el botón Login
        Then debe ver un mensaje de error: "Epic sadface: Username is required"

    @CP-006 @regression @negative @validation @DailyTest @unhappy-path
    Scenario: CP-006 Login fallido con campo de contraseña vacío
        When ingresa un nombre de usuario válido y deja vacío el campo de contraseña
        And hace clic en el botón Login
        Then debe ver un mensaje de error: "Epic sadface: Password is required"