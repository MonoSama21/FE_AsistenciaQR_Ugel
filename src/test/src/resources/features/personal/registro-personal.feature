@test @personal @registro @HU-003 @DailyTest @REQ-F-003 @SIAQR
Feature: Registro de Personal
    Como administrador de UGEL Chincha
    Quiero registrar los datos del personal de la institución
    Para que puedan usar sus códigos QR para marcar asistencia

    Background:
        Given estoy en la página de login del sistema SIAQR
        And ingreso credeciales de administrador en el sistema SIAQR
        And ingreso al sistema y se ve mensaje de bienvenida personalizado
        And hago clic en la opción "Personal" del menú lateral

    @CP-042 @smoke @critical @happy-path @Escenario42
    Scenario: CP-042 Registro exitoso de empleado con todos los campos obligatorios
        When hago clic en el botón Nuevo Registro
        And completo el formulario con DNI, Nombres, Apellidos, Cargo y Distrito válidos
        And hago clic en Registrar
        Then se debe ver un mensaje de confirmación "Personal registrado correctamente."
        #And el nuevo personal debe aparecer en el listado
        #And el personal debe tener estado un QR

    @CP-045 @regression @happy-path @Escenario45
    Scenario: CP-045 Subir fotografía del empleado desde archivo
        When observo un registro de empleado sin fotografía
        And hago clic en el botón Foto
        And selecciono una imagen válida JPG, PNG
        And la imagen debe mostrarse como vista previa
        And hago clic en Subir Foto
        Then debo ver un mensaje "Foto subida correctamente"
        And la imagen debe guardarse correctamente con el registro

    #@CP-046 @regression @negative @validation @critical @unhappy-path @Escenario46
    #Scenario: CP-046 Validación de DNI único - no permite duplicados
    #    Given observo un DNI existente en el sistema
    #    When intento registrar un nuevo empleado con el mismo DNI
    #    Then debo ver un mensaje de error "El DNI ya está registrado"
    #    And debo permanecer en el formulario de registro


    #@CP-051 @regression @negative @validation @unhappy-path @Escenario51
    #Scenario Outline: CP-051 Validación de campos obligatorios vacíos
    #    When hago clic en el botón Nuevo Registro
    #    And intento registrar un empleado sin completar el campo "<campo>"
    #    Then el sistema permanece en el formulario de registro
    #    Examples: 
    #        | campo     |
    #        | DNI       |
    #        | Nombres   |
    #        | Apellidos |
    #        | Cargo     |

    @CP-052 @regression @negative @validation @unhappy-path @Escenario52 @ugel15
    Scenario Outline: CP-052 Validación de formato de DNI (8 dígitos numéricos) con valor <valorDNI>
        When hago clic en el botón Nuevo Registro
        #And ingreso un DNI con formato inválido "<valorDNI>"
        #And hago clic en Registrar
        #Then debo ver un mensaje "DNI debe contener 8 dígitos"

        Examples:
            | valorDNI | mensajeError                 |
            | 123ABC78 | DNI debe contener 8 dígitos  |
            | 123456   | DNI debe contener 8 dígitos  |
            

