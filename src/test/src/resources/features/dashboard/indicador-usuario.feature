@test @dashboard @usuario @indicador @HU-013 @DailyTest @REQ-F-013 @SIAQR
Feature: Indicador de Usuario Autenticado
    Como administrador de UGEL Chincha
    Quiero ver mi nombre de usuario en la cabecera del sistema
    Para confirmar con qué cuenta estoy trabajando

    Background:
        Given estoy en la página de login del sistema SIAQR
        And ingreso credeciales de administrador en el sistema SIAQR
        And ingreso al sistema y se ve mensaje de bienvenida personalizado

    #@CP-026 @smoke @critical @ui @happy-path @Escenario26
    #Scenario Outline: CP-026 Nombre del usuario visible en la cabecera superior derecha
    #    When hago clic en la opción "<opcionMenu>" del menú lateral
    #    Then mi nombre de usuario debe estar visible en la cabecera superior derecha
    #    And debe mostrar el nombre completo del usuario autenticado

    #    Examples: 
    #        | opcionMenu              |
    #        | Home                    |
    #        | Usuarios                |
    #        | Personal                |
    #        | Asistencia              |
    #        | Reportes de Asistencia  |

    #@CP-027 @regression @ui @Escenario27
    #Scenario: CP-027 Ícono de usuario acompañando al nombre
    #    When me encuentro en cualquier pantalla del dashboard
    #    Then debe aparecer un ícono de usuario junto al nombre
    #    And el ícono debe ser visualmente reconocible

    #@CP-028 @regression @ui @DailyTest @Escenario28
    #Scenario Outline: CP-028 Ícono de configuración accesible
    #    When hago clic en la opción "<opcionMenu>" del menú lateral
    #    Then debe haber un ícono de configuración accesible
    #    And debe estar ubicado en la zona del indicador de usuario

    #    Examples: 
    #        | opcionMenu              |
    #        | Home                    |
    #        | Usuarios                |
    #        | Personal                |
    #        | Asistencia              |
    #        | Reportes de Asistencia  |

    #@CP-031 @regression @functional @Escenario31
    #Scenario: CP-031 Interacción con el ícono de configuración
    #    When hago clic en el ícono de configuración del indicador de usuario
    #    Then se observa la configuración de ususario
    #    And se observa la configuración de cambio de contraseña
