@test @personal @ver-detalles @HU-004 @DailyTest @REQ-F-004 @SIAQR
Feature: Ver Detalles de Personal
    Como administrador de UGEL Chincha
    Quiero visualizar toda la información de un personal registrado
    Para revisar y verificar los datos completos del empleado

    Background:
        Given estoy en la página de login del sistema SIAQR
        And ingreso credeciales de administrador en el sistema SIAQR
        And ingreso al sistema y se ve mensaje de bienvenida personalizado
        And hago clic en la opción "Personal" del menú lateral

    @CP-050 @smoke @happy-path @Escenario50
    Scenario: CP-050 Ver detalles de un personal registrado exitosamente
        When hago clic en el botón Ver de un personal de la tabla
        Then debe abrirse un modal con los detalles del personal
        And debe mostrar la foto, nombre completo, DNI, cargo y estado
        And debe mostrar la información del cargo con su descripción
        And debe mostrar la información del distrito con su alias
        And debe mostrar el código QR del personal
        And puedo cerrar el modal correctamente

    @CP-051 @regression @happy-path @Escenario51
    Scenario: CP-051 Validar que se muestren todos los campos en el modal de detalles
        When hago clic en el botón Ver de un personal de la tabla
        Then debe abrirse un modal con los detalles del personal
        And los campos obligatorios deben estar presentes Nombre, DNI, Cargo, Estado
        And debe mostrar la información del cargo con su descripción
        And debe mostrar la información del distrito con su alias
        And puedo cerrar el modal correctamente
