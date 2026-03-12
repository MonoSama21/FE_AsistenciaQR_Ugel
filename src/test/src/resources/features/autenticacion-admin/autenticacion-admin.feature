@test @autenticacion @admin @HU-001 @DailyTest @REQ-F-001 @SIAQR
Feature: Autenticación de Usuario por rol Administrativo
    Como administrador de UGEL Chincha
    Quiero iniciar sesión en el sistema con credenciales seguras
    Para acceder al panel administrativo y gestionar los registros de asistencia

    Background:
        Given estoy en la página de login del sistema SIAQR

    @CP-001 @smoke @critical @happy-path @Escenario01
    Scenario: CP-001 Autenticación exitosa con credenciales válidas para rol administrador
        When ingreso mi correo electrónico y contraseña válidos como administrador
        And hago clic en el botón Inciar Sesion
        Then ingreso al sistema y se ve mensaje de bienvenida personalizado
        And en el sidebar se muestran las opciones de "Home", "Usuarios", "Personal", "Asistencia" y "Reporte Asistencia"

    @CP-002 @regression @negative @error-handling @unhappy-path @Escenario02
    Scenario: CP-002 Autenticación fallida con contraseña incorrecta para rol administrador
        When ingreso mi correo electrónico válido como administrador
        And ingreso una contraseña incorrecta
        And hago clic en el botón Inciar Sesion        
        Then se muestra un mensaje de error que dice "Contraseña incorrecta"

    @CP-003 @regression @negative @validation @unhappy-path @Escenario03 
    Scenario: CP-003 Autenticación fallida con correo incorrecto para rol administrador
        When ingreso un correo electrónico inválido
        And ingreso una contraseña válida
        And hago clic en el botón Inciar Sesion        
        Then se muestra un mensaje de error que dice "Usuario no encontrado"
