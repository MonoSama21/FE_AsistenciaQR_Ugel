@test @dashboard @navegacion @HU-010 @DailyTest @REQ-F-010 @SIAQR
Feature: Navegación del Dashboard
    Como administrador de UGEL Chincha
    Quiero navegar fácilmente entre las diferentes secciones del sistema
    Para acceder rápidamente a las funcionalidades que necesito

    Background:
        Given estoy en la página de login del sistema SIAQR
        And ingreso credeciales de administrador en el sistema SIAQR
        And ingreso al sistema y se ve mensaje de bienvenida personalizado

    @CP-007 @smoke @critical @happy-path @Escenario07 @ugel5
    Scenario: CP-007 Menú lateral visible y accesible desde todas las pantallas
        When el menú lateral debe estar visible
        Then debe incluir las opciones Home, Usuarios, Personal, Asistencia y Reporte Asistencia

    @CP-008 @smoke @critical @happy-path @Escenario09 @ugel6
    Scenario Outline: CP-008 Navegación a la sección <opcionMenu> desde el menú lateral 
        When hago clic en la opción "<opcionMenu>" del menú lateral
        Then soy dirigido a la pantalla de "<opcionMenu>"

        Examples: 
        | opcionMenu              |
        | Home                    |
        | Usuarios                |
        | Personal                |
        | Asistencia              |
        | Reportes de Asistencia  |

   @CP-014 @regression @ui @Escenario14 @ugel7
    Scenario: CP-014 Botón Cerrar Sesión siempre accesible en el menú
        Then el botón Cerrar Sesión debe estar visible en el menú lateral

    #@CP-015 @regression @ui @Escenario15
    #Scenario: CP-015 Nombre del usuario y botón de configuración visible en la cabecera
    #    Then el nombre del usuario debe estar visible en la cabecera superior
    #    And el botón de configuración debe estar accesible en la cabecera


