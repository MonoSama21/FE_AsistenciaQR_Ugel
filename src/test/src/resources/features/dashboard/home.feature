@test @dashboard @home @HU-012 @DailyTest @REQ-F-012 @SIAQR
Feature: Dashboard Principal (Home)
    Como administrador de UGEL Chincha
    Quiero ver un dashboard principal con información relevante
    Para tener una visión general del sistema al iniciar sesión

    Background:
        Given estoy en la página de login del sistema SIAQR
        And ingreso credeciales de administrador en el sistema SIAQR
        And ingreso al sistema y se ve mensaje de bienvenida personalizado

    #@CP-021 @regression @ui @Escenario21
    #Scenario: CP-021 Visualización del título institucional
    #    Then debo ver el título institucional "SIAQR UGEL CHINCHA"

    #@CP-022 @regression @ui @Escenario22
    #Scenario: CP-022 Visualización de la descripción del propósito del sistema
    #    Then la descripción debe ser "Controle las entradas y salidas de los trabajadores"

    #@CP-023 @regression @ui @Escenario23
    #Scenario: CP-023 Visualización del logo y imagen institucional de UGEL
    #    Then debo ver el logo y imagen institucional de UGEL

