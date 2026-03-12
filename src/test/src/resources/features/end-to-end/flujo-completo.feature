
Feature: Flujo completo

    Background:
        Given estoy en la página de login del sistema SIAQR
        And ingreso credeciales de administrador en el sistema SIAQR
        And ingreso al sistema y se ve mensaje de bienvenida personalizado
        And hago clic en la opción "Usuarios" del menú lateral


    @CP-042 @smoke @critical @happy-path @Escenario42
    Scenario: Flujo completo
        #CREACION DE USUARIO ADMINISTRATIVO

        #When hago clic en el botón Nuevo Registro
        #And completo el formulario con DNI, Nombres, Apellidos y Cargo válidos
        #And hago clic en Registrar
        #Then se debe ver un mensaje de confirmación "Personal registrado correctamente."

        #CREACION DE PERSONAL CON USUARIO ADMINISTRATIVO PREVIAMENTE CREADO
        

        #CREACION DE USUARIO PERSONAL CON USUARIO ADMINISTRATIVO PREVIAMENTE CREADO


        #ACCEDER CON USUARIO PERSONAL PARA LA TOMA DE ASISTENCIA TANTO ENTRADA Y SALIDA


        #ENTRAR DE NUEVO CON USUARIO ADMINISTRATIVO PARA GENERAR REPORTE DE ASISTENCIA DEL PERSONAL CREADO ANTERIORMENTE

