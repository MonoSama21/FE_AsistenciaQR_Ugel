@test @sesion @logout @HU-011 @DailyTest @REQ-F-011 @SIAQR
Feature: Cierre de Sesión
    Como administrador de UGEL Chincha
    Quiero cerrar sesión de forma segura
    Para proteger el acceso al sistema cuando termine de usarlo

    Background:
        Given estoy en la página de login del sistema SIAQR
        And ingreso credeciales de administrador en el sistema SIAQR
        And ingreso al sistema y se ve mensaje de bienvenida personalizado

    @CP-016 @smoke @critical @security @happy-path @Escenario16 @ugel8
    Scenario: CP-016 Cierre de sesión exitoso desde el menú lateral
        When hago clic en el botón Cerrar Sesión ubicado en el menú lateral
        Then soy redirigido automáticamente a la pantalla de login

    #@CP-017 @regression @security @critical @Escenario17
    #Scenario: CP-017 Prevención de acceso al dashboard sin autenticación tras cerrar sesión
    #    When cierro sesión correctamente
    #    And intento acceder directamente a cualquier URL del dashboard
    #    Then soy redirigido automáticamente a la página de login

    #@CP-019 @regression @ui @Escenario19
    #Scenario: CP-019 Visibilidad del botón "Cerrar Sesión" en todas las pantallas
    #    When navego a la sección "Home"
    #    Then el botón "Cerrar Sesión" debe estar visible
    #    When navego a la sección "Usuarios"
    #    Then el botón "Cerrar Sesión" debe estar visible
    #    When navego a la sección "Personal"
    #    Then el botón "Cerrar Sesión" debe estar visible
    #    When navego a la sección "Asistencia"
    #    Then el botón "Cerrar Sesión" debe estar visible
    #    When navego a la sección "Reporte Asistencia"
    #    Then el botón "Cerrar Sesión" debe estar visible
