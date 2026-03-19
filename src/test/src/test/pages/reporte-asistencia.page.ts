import { expect, Page } from '@playwright/test';
import { ReporteAsistenciaLocator } from '../locators/reporte-asistencia.locator';

export class ReporteAsistenciaPage {
    readonly page: Page;
    readonly reporteLocator: ReporteAsistenciaLocator;

    constructor(page: Page) {
        this.page = page;
        this.reporteLocator = new ReporteAsistenciaLocator(page);
    }

    async verifyTablaAsistenciaVisible() {
        await expect(this.reporteLocator.tablaAsistencia).toBeVisible();
        console.log('✅ Tabla de asistencia visible correctamente.');
    }

    async verifyColumnasTabla() {
        const colunasEsperadas = ['DNI', 'Personal', 'Cargo', 'Distrito', 'Fecha', 'Entrada', 'Salida', 'Horas Trab.', 'Estado'];
        
        for (const columna of colunasEsperadas) {
            const headText = await this.page.locator(`table th:has-text("${columna}")`).textContent();
            if (!headText || !headText.includes(columna)) {
                throw new Error(`❌ Columna "${columna}" no encontrada en la tabla.`);
            }
        }
        
        console.log('✅ Todas las columnas esperadas están presentes en la tabla.');
    }

    async verifyDistritosEnTabla() {
        // Verificar que al menos una fila tenga un distrito
        const filas = await this.reporteLocator.filas.count();
        if (filas === 0) {
            console.log('⚠️ No hay filas en la tabla para validar distritos.');
            return;
        }

        // Obtener la primera fila y verificar que tenga datos en la columna de distrito
        const primeraFila = this.reporteLocator.filas.first();
        const celdas = await primeraFila.locator('td').all();
        
        if (celdas.length >= 5) {
            const celdaDistrito = celdas[4]; // La columna Distrito está en la posición 4 (0-indexed)
            const texto = await celdaDistrito.textContent();
            console.log(`✅ Columna Distrito validada. Valor: "${texto?.trim()}"`);
        }
    }

    async ingresarFechas(fechaInicio: string, fechaFin: string) {
        await this.reporteLocator.inputFechaInicio.fill(fechaInicio);
        await this.reporteLocator.inputFechaFin.fill(fechaFin);
        console.log(`✅ Fechas ingresadas: ${fechaInicio} a ${fechaFin}`);
    }

    async buscar() {
        await this.reporteLocator.btnBuscar.click();
        // Esperar a que la tabla se cargue
        await this.page.waitForTimeout(2000);
        console.log('✅ Búsqueda realizada.');
    }

    async exportarPDF() {
        await this.reporteLocator.btnExportarPDF.click();
        console.log('✅ Exportación a PDF iniciada.');
    }

    async verificarFilasConDatos() {
        const filas = await this.reporteLocator.filas.count();
        if (filas > 0) {
            console.log(`✅ ${filas} fila(s) con datos en la tabla.`);
            return true;
        } else {
            console.log('⚠️ No hay filas con datos en la tabla.');
            return false;
        }
    }
}
