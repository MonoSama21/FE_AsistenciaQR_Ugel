import { Page } from '@playwright/test';

export class ReporteAsistenciaLocator {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    get tablaAsistencia() {
        return this.page.locator('table').first();
    }

    get headerTabla() {
        return this.page.locator('table thead tr');
    }

    get colDNI() {
        return this.page.locator('table th:has-text("DNI")');
    }

    get colPersonal() {
        return this.page.locator('table th:has-text("Personal")');
    }

    get colCargo() {
        return this.page.locator('table th:has-text("Cargo")');
    }

    get colDistrito() {
        return this.page.locator('table th:has-text("Distrito")');
    }

    get colFecha() {
        return this.page.locator('table th:has-text("Fecha")');
    }

    get colEntrada() {
        return this.page.locator('table th:has-text("Entrada")');
    }

    get colSalida() {
        return this.page.locator('table th:has-text("Salida")');
    }

    get colHorasTrab() {
        return this.page.locator('table th:has-text("Horas Trab.")');
    }

    get colEstado() {
        return this.page.locator('table th:has-text("Estado")');
    }

    get filas() {
        return this.page.locator('table tbody tr');
    }

    get inputFechaInicio() {
        return this.page.locator('input[type="date"]').first();
    }

    get inputFechaFin() {
        return this.page.locator('input[type="date"]').nth(1);
    }

    get btnBuscar() {
        return this.page.locator('button:has-text("Buscar")');
    }

    get btnExportarPDF() {
        return this.page.locator('button:has-text("Exportar PDF")');
    }
}
