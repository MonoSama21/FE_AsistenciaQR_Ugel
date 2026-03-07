@test @usuarios @gestion @HU-002 @DailyTest @REQ-F-002 @SIAQR
Feature: Gestión de Usuarios Administrativos
    Como administrador principal de UGEL Chincha
    Quiero gestionar las cuentas de usuarios administrativos del sistema
    Para controlar quien tiene acceso a la administración del sistema

    Background:
        Given estoy en la página de login del sistema SIAQR
        And ingreso credeciales de administrador en el sistema SIAQR
        And ingreso al sistema y se ve mensaje de bienvenida personalizado
        And hago clic en la opción "Usuarios" del menú lateral

    @CP-032 @smoke @critical @happy-path @Escenario32 @ugel9
    Scenario Outline: CP-032 Visualización de la columna "<columna>" del listado completo de usuarios administrativos
        Then debo ver la columna "<columna>"
        Examples:
            | columna     |
            | Usuario     |
            | Rol         |
            | Empleado    |
            | Estado      |
            | Acción      |

    @CP-033 @smoke @critical @happy-path @Escenario33 @ugel10
    Scenario: CP-033 Creación exitosa de nuevo usuario administrativo con credenciales únicas
        When hago clic en el botón Nuevo Usuario
        And completo el formulario con datos válidos
        And hago clic en Crear Usuario
        Then debo ver un mensaje de confirmación "Usuario creado correctamente."
        And el nuevo usuario debe aparecer en el listado
        And el usuario debe tener estado "ACTIVO"

    #@CP-034 @regression @negative @validation @unhappy-path @Escenario34
    #Scenario: CP-034 Error al crear usuario con correo electrónico duplicado
    #    When intento crear un nuevo usuario con un correo ya existente
    #    Then debo ver un mensaje de error "El email ya está registrado"













    #@CP-035 @regression @happy-path @Escenario35
    #Scenario: CP-035 Edición exitosa de información de usuario existente
    #    Given existe un usuario "test.user" en el sistema
    #    When hago clic en el botón "Editar" del usuario "test.user"
    #    And modifico el campo "rol" a "PERSONAL"
    #    And hago clic en "Guardar cambios"
    #    Then debo ver un mensaje "Usuario actualizado exitosamente"
    #    And el usuario debe mostrar el nuevo rol "PERSONAL"

    #@CP-036 @regression @critical @Escenario36
    #Scenario: CP-036 Eliminación de usuario del sistema
    #    Given existe un usuario "usuario.temporal" en el sistema
    #    When hago clic en el botón "Eliminar" del usuario "usuario.temporal"
    #    And confirmo la eliminación en el diálogo de confirmación
    #    Then debo ver un mensaje "Usuario eliminado exitosamente"
    #    And el usuario "usuario.temporal" no debe aparecer en el listado

    #@CP-037 @regression @functional @DailyTest @Escenario37
    #Scenario: CP-037 Visualización de estados ACTIVO e INACTIVO para usuarios
    #    Then cada usuario en el listado debe mostrar su estado
    #    And los estados disponibles deben ser "ACTIVO" o "INACTIVO"
    #    And el estado debe estar claramente diferenciado visualmente
    #    And puedo filtrar usuarios por estado

    #@CP-038 @regression @functional @Escenario38
    #Scenario: CP-038 Búsqueda de usuarios mediante función de filtrado
    #    When ingreso "admin" en el campo de búsqueda
    #    Then debo ver solo los usuarios que contienen "admin" en su nombre o correo
    #    And el listado debe actualizarse en tiempo real
    #    When limpio el campo de búsqueda
    #    Then debo ver nuevamente todos los usuarios

    #@CP-039 @regression @ui @Escenario39
    #Scenario: CP-039 Paginación de registros mostrando 10 usuarios por página
    #    Given existen más de 10 usuarios en el sistema
    #    Then debo ver exactamente 10 usuarios en la primera página
    #    And debo ver controles de paginación
    #    When hago clic en "Siguiente página"
    #    Then debo ver los siguientes 10 usuarios
    #    And el número de página debe actualizarse correctamente

    #@CP-040 @regression @validation @unhappy-path @Escenario40
    #Scenario: CP-040 Validación de roles disponibles en creación de usuarios
    #    When accedo al formulario de creación de usuario
    #    Then el campo "Rol" debe mostrar solo las opciones
    #        | ADMIN    |
    #        | PERSONAL |
    #    And no debo poder ingresar roles personalizados
    #    And debo poder seleccionar solo un rol por usuario

    #@CP-041 @regression @security @Escenario41
    #Scenario: CP-041 Usuario PERSONAL tiene acceso limitado al sistema
    #    Given existe un usuario con rol "PERSONAL" autenticado
    #    Then el usuario debe tener acceso a funcionalidades limitadas
    #    And no debe poder acceder a "Gestión de Usuarios"
    #    And debe poder acceder solo a funcionalidades de su rol
