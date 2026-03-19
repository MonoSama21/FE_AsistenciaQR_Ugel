@test @reporte @asistencia @HU-005 @DailyTest @REQ-F-005 @SIAQR
Feature: Reporte de Asistencia con Información de Distrito
    Como administrador de UGEL Chincha
    Quiero generar reportes de asistencia filtrando por fechas
    Para visualizar los registros de entrada y salida con información del personal y distrito

    Background:
        Given estoy en la página de login del sistema SIAQR
        And ingreso credeciales de administrador en el sistema SIAQR
        And ingreso al sistema y se ve mensaje de bienvenida personalizado
        And hago clic en la opción "Reporte Asistencia" del menú lateral

    @CP-060 @smoke @happy-path @Escenario60
    Scenario: CP-060 Visualizar tabla de asistencia con columna de Distrito
        When ingreso un rango de fechas válido
        And hago clic en el botón Buscar
        Then debe mostrarse la tabla de asistencia con todos los registros
        And la tabla debe contener las columnas: DNI, Personal, Cargo, Distrito, Fecha, Entrada, Salida, Horas Trab., Estado
        And cada fila debe mostrar el alias del distrito del personal

    @CP-061 @regression @happy-path @Escenario61
    Scenario: CP-061 Distritón mostrado correctamente en exportación PDF
        When ingreso un rango de fechas válido
        And hago clic en el botón Buscar
        Then debe mostrarse la tabla de asistencia con todos los registros
        And hago clic en el botón Exportar PDF
        Then el PDF debe incluir la columna de Distrito con el alias de cada registro
