@test @autenticacion @admin @HU-001 @DailyTest @REQ-F-001 @SIAQR
Feature: Autenticación de Usuario Administrativo
    Como administrador de UGEL Chincha
    Quiero iniciar sesión en el sistema con credenciales seguras
    Para acceder al panel administrativo y gestionar los registros de asistencia

    Background:
        Given estoy en la página de login del sistema SIAQR

    @CP-001 @smoke @critical @happy-path @Escenario01 @ugel1
    Scenario: CP-001 Autenticación exitosa con credenciales válidas
        When ingreso mi correo electrónico y contraseña válidos como administrador
        And hago clic en el botón Inciar Sesion
        Then ingreso al sistema y se ve mensaje de bienvenida personalizado

    @CP-002 @regression @negative @error-handling @unhappy-path @Escenario02 @ugel2
    Scenario: CP-002 Autenticación fallida con contraseña incorrecta
        When ingreso mi correo electrónico válido como administrador
        And ingreso una contraseña incorrecta
        And hago clic en el botón Inciar Sesion        
        Then se muestra un mensaje de error que dice "Contraseña incorrecta"

    @CP-003 @regression @negative @validation @unhappy-path @Escenario03 @ugel3
    Scenario: CP-003 Autenticación fallida con correo incorrecto
        When ingreso un correo electrónico inválido
        And ingreso una contraseña válida
        And hago clic en el botón Inciar Sesion        
        Then se muestra un mensaje de error que dice "Usuario no encontrado"
