import React, { useEffect, useState } from "react";
import Sidebar from "../sections/Sidebar";
import Header from "../sections/Header";
import axios from "axios";
import jsPDF from "jspdf";
import logoUgel from "../../assets/img/logo.jpeg";

interface Cargo {
    cargo: string;
}

interface PersonalResumen {
    id: number;
    dni: string;
    nombres: string;
    apellidos: string;
    cargo: Cargo;
}

interface Asistencia {
    id: number;
    personalId: number;
    personal: PersonalResumen;
    fecha: string;
    horaEntrada: string;
    horaSalida: string | null;
    horasTrabajadas: string | null;
    estado: string;
    createdat: string;
}

interface RespuestaReporte {
    success: boolean;
    total: number;
    pagina: number;
    limite: number;
    asistencias: Asistencia[];
}

// Convierte imagen a base64 para uso en PDF (evita CORS)
const convertirLogoABase64 = (src: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = () => resolve('');
        img.src = src;
    });
};

const ReporteAsistencia = () => {
    const URL_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken') || '';

    // Filtros
    const [fechaInicio, setFechaInicio] = useState<string>('');
    const [fechaFin, setFechaFin] = useState<string>('');
    const [buscarTexto, setBuscarTexto] = useState<string>('');
    const [errorFecha, setErrorFecha] = useState<string>('');

    // Datos
    const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasBuscado, setHasBuscado] = useState<boolean>(false);

    // Paginación
    const [pagina, setPagina] = useState<number>(1);
    const limite = 10;
    const totalPaginas = Math.ceil(total / limite);

    // PDF
    const [generandoPDF, setGenerandoPDF] = useState<boolean>(false);

    // ─── Inicializar con fecha de hoy ───────────────────────────────────────
    useEffect(() => {
        const hoy = new Date().toISOString().split('T')[0];
        setFechaInicio(hoy);
        setFechaFin(hoy);
    }, []);

    // ─── Validar y buscar ───────────────────────────────────────────────────
    const validarFechas = (): boolean => {
        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
            setErrorFecha('La fecha de fin no puede ser menor a la fecha de inicio.');
            return false;
        }
        setErrorFecha('');
        return true;
    };

    const buscar = async (nuevaPagina: number = 1) => {
        if (!validarFechas()) return;
        setLoading(true);
        setHasBuscado(true);
        setPagina(nuevaPagina);
        try {
            const params: Record<string, string | number> = {
                pagina: nuevaPagina,
                limite,
            };
            if (fechaInicio) params['fechaInicio'] = fechaInicio;
            if (fechaFin)    params['fechaFin']    = fechaFin;

            const resp = await axios.get<RespuestaReporte>(`${URL_API}/asistencia/reporte`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            setAsistencias(resp.data.asistencias || []);
            setTotal(resp.data.total || 0);
        } catch (err) {
            console.error('Error al obtener reporte:', err);
            setAsistencias([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // ─── Filtro local por nombre / DNI ──────────────────────────────────────
    const asistenciasFiltradas = asistencias.filter((a) => {
        if (!buscarTexto.trim()) return true;
        const texto = buscarTexto.toLowerCase();
        const nombreCompleto = `${a.personal.nombres} ${a.personal.apellidos}`.toLowerCase();
        return nombreCompleto.includes(texto) || a.personal.dni.includes(texto);
    });

    // ─── Formatear fechas y horas ───────────────────────────────────────────
    const formatearFecha = (fecha: string) => {
        const [anio, mes, dia] = fecha.split('-');
        return `${dia}/${mes}/${anio}`;
    };

    const formatearHora = (hora: string | null) => {
        if (!hora) return '-';
        return hora.substring(0, 5); // HH:MM
    };

    const badgeEstado = (estado: string) => {
        if (estado === 'COMPLETO')
            return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">COMPLETO</span>;
        return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700">EN CURSO</span>;
    };

    // ─── Exportar PDF (REQ-F-009) ────────────────────────────────────────────
    const exportarPDF = async () => {
        if (asistencias.length === 0) return;
        setGenerandoPDF(true);

        try {
            // Obtener TODOS los registros para el PDF (sin límite de página)
            const params: Record<string, string | number> = { pagina: 1, limite: 9999 };
            if (fechaInicio) params['fechaInicio'] = fechaInicio;
            if (fechaFin)    params['fechaFin']    = fechaFin;

            const resp = await axios.get<RespuestaReporte>(`${URL_API}/asistencia/reporte`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            const todos = resp.data.asistencias || [];

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const ancho = doc.internal.pageSize.getWidth();
            const alto  = doc.internal.pageSize.getHeight();
            const margen = 15;

            // ── Encabezado ──
            const logoB64 = await convertirLogoABase64(logoUgel);
            if (logoB64) {
                doc.addImage(logoB64, 'JPEG', margen, 8, 22, 22);
            }

            doc.setFillColor(124, 58, 237); // purple-600
            doc.rect(0, 0, ancho, 35, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('UGEL - REPORTE DE ASISTENCIA', margen + 26, 15);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Unidad de Gestión Educativa Local - Chincha Alta, Ica', margen + 26, 22);

            // Rango de fechas
            const periodoTexto = fechaInicio && fechaFin
                ? `Período: ${formatearFecha(fechaInicio)}  al  ${formatearFecha(fechaFin)}`
                : fechaInicio
                    ? `Desde: ${formatearFecha(fechaInicio)}`
                    : 'Todos los registros';
            doc.text(periodoTexto, margen + 26, 29);

            // Fecha de generación (esquina derecha)
            const ahora = new Date();
            doc.setFontSize(8);
            doc.text(
                `Generado: ${ahora.toLocaleDateString('es-PE')} ${ahora.toLocaleTimeString('es-PE')}`,
                ancho - margen,
                29,
                { align: 'right' }
            );

            // Total de registros
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text(`Total de registros: ${todos.length}`, ancho - margen, 15, { align: 'right' });

            // ── Tabla ──
            const cabeceras = ['#', 'DNI', 'PERSONAL', 'CARGO', 'FECHA', 'ENTRADA', 'SALIDA', 'HORAS TRAB.', 'ESTADO'];
            const anchos    = [10, 22, 60, 55, 24, 22, 22, 24, 22];

            let y = 42;
            const filaAltura = 8;
            const headerAltura = 9;

            const dibujarCabecera = () => {
                doc.setFillColor(109, 40, 217); // purple-700
                doc.rect(margen, y, ancho - margen * 2, headerAltura, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                let x = margen + 2;
                cabeceras.forEach((cab, i) => {
                    doc.text(cab, x, y + 6);
                    x += anchos[i];
                });
                y += headerAltura;
            };

            dibujarCabecera();

            todos.forEach((a, idx) => {
                // Nueva página si no hay espacio
                if (y + filaAltura > alto - 15) {
                    doc.addPage();
                    y = 15;
                    dibujarCabecera();
                }

                const fila = idx % 2 === 0;
                doc.setFillColor(fila ? 250 : 240, fila ? 245 : 235, fila ? 255 : 255);
                doc.rect(margen, y, ancho - margen * 2, filaAltura, 'F');

                doc.setTextColor(40, 40, 40);
                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'normal');

                const nombreCompleto = `${a.personal.nombres} ${a.personal.apellidos}`;
                const horasTrab = a.horasTrabajadas || (a.horaSalida ? '-' : 'En curso');

                const celdas = [
                    String((resp.data.pagina - 1) * resp.data.limite + idx + 1),
                    a.personal.dni,
                    nombreCompleto.length > 28 ? nombreCompleto.substring(0, 26) + '…' : nombreCompleto,
                    (a.personal.cargo?.cargo || '-').length > 24
                        ? (a.personal.cargo?.cargo || '-').substring(0, 22) + '…'
                        : (a.personal.cargo?.cargo || '-'),
                    formatearFecha(a.fecha),
                    formatearHora(a.horaEntrada),
                    formatearHora(a.horaSalida),
                    horasTrab,
                    a.estado,
                ];

                let x = margen + 2;
                celdas.forEach((val, i) => {
                    doc.text(String(val), x, y + 5.5);
                    x += anchos[i];
                });

                // Línea separadora
                doc.setDrawColor(200, 200, 220);
                doc.line(margen, y + filaAltura, margen + ancho - margen * 2, y + filaAltura);
                y += filaAltura;
            });

            // ── Pie de página en cada hoja ──
            const totalPags = doc.getNumberOfPages();
            for (let p = 1; p <= totalPags; p++) {
                doc.setPage(p);
                doc.setFontSize(7);
                doc.setTextColor(130, 130, 130);
                doc.text(
                    `Página ${p} de ${totalPags}  ·  UGEL Chincha Alta, Ica`,
                    ancho / 2,
                    alto - 5,
                    { align: 'center' }
                );
            }

            const nombreArchivo = `reporte-asistencia${fechaInicio ? `-${fechaInicio}` : ''}${fechaFin && fechaFin !== fechaInicio ? `-${fechaFin}` : ''}.pdf`;
            doc.save(nombreArchivo);
        } catch (err) {
            console.error('Error al generar PDF:', err);
        } finally {
            setGenerandoPDF(false);
        }
    };

    // ─── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            <main className="md:ml-64 pt-16">
                <div className="p-6">

                    {/* Encabezado */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">REPORTE DE ASISTENCIA</h1>
                            <p className="text-gray-400 text-xs mt-0.5">Consulta y exporta los registros de asistencia del personal</p>
                        </div>
                        {hasBuscado && asistencias.length > 0 && (
                            <button
                                onClick={exportarPDF}
                                disabled={generandoPDF}
                                className="flex items-center gap-2 bg-red-700 hover:bg-red-600 active:bg-red-800 disabled:bg-red-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-red-700/20 transition-all">
                                {generandoPDF ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                )}
                                {generandoPDF ? 'Generando PDF...' : 'Exportar PDF'}
                            </button>
                        )}
                    </div>

                    {/* Tarjeta principal */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Barra de filtros */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <span>Desde:</span>
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => { setFechaInicio(e.target.value); setErrorFecha(''); }}
                                        className="border border-gray-200 bg-gray-50 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                                    <span>Hasta:</span>
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => { setFechaFin(e.target.value); setErrorFecha(''); }}
                                        className="border border-gray-200 bg-gray-50 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer"
                                    />
                                </div>
                                {total > 0 && (
                                    <span className="text-gray-400 border-l border-gray-200 pl-4">
                                        — <span className="font-bold text-gray-600">{total}</span> registros
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Buscar:</span>
                                <input
                                    type="text"
                                    value={buscarTexto}
                                    onChange={(e) => setBuscarTexto(e.target.value)}
                                    className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all w-48"
                                    placeholder="Nombre o DNI..."
                                />
                                <button
                                    onClick={() => buscar(1)}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 active:bg-blue-900 disabled:bg-blue-300 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-md shadow-blue-800/20 transition-all">
                                    {loading ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    )}
                                    {loading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </div>

                        {/* Error de fecha */}
                        {errorFecha && (
                            <div className="px-5 py-2 bg-red-50 border-b border-red-100">
                                <p className="text-red-600 text-xs flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errorFecha}
                                </p>
                            </div>
                        )}

                        {/* Tabla */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                        <th className="px-5 py-3 text-left font-semibold w-10">#</th>
                                        <th className="px-5 py-3 text-left font-semibold">DNI</th>
                                        <th className="px-5 py-3 text-left font-semibold">Personal</th>
                                        <th className="px-5 py-3 text-left font-semibold">Cargo</th>
                                        <th className="px-5 py-3 text-left font-semibold">Fecha</th>
                                        <th className="px-5 py-3 text-center font-semibold">Entrada</th>
                                        <th className="px-5 py-3 text-center font-semibold">Salida</th>
                                        <th className="px-5 py-3 text-center font-semibold">Horas Trab.</th>
                                        <th className="px-5 py-3 text-center font-semibold">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Cargando registros...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : !hasBuscado ? (
                                        <tr>
                                            <td colSpan={9} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                Selecciona un rango de fechas y presiona <span className="font-semibold text-blue-800">Buscar</span> para ver los registros.
                                            </td>
                                        </tr>
                                    ) : asistenciasFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                No se encontraron registros para el período seleccionado.
                                            </td>
                                        </tr>
                                    ) : (
                                        asistenciasFiltradas.map((a, idx) => (
                                            <tr key={a.id} className="hover:bg-blue-50/40 transition-colors">
                                                <td className="px-5 py-3 text-gray-500 font-medium">
                                                    {(pagina - 1) * limite + idx + 1}
                                                </td>
                                                <td className="px-5 py-3 font-mono font-semibold text-gray-700">
                                                    {a.personal.dni}
                                                </td>
                                                <td className="px-5 py-3 font-semibold text-gray-800">
                                                    {a.personal.nombres} {a.personal.apellidos}
                                                </td>
                                                <td className="px-5 py-3 text-gray-500 text-xs">
                                                    {a.personal.cargo?.cargo || '-'}
                                                </td>
                                                <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                                                    {formatearFecha(a.fecha)}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    {a.horaEntrada ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                            {formatearHora(a.horaEntrada)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    {a.horaSalida ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                                            {formatearHora(a.horaSalida)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    {a.horasTrabajadas ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                            {a.horasTrabajadas}
                                                        </span>
                                                    ) : a.horaSalida ? (
                                                        <span className="text-gray-400 text-xs">00:00</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                            En curso
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    {badgeEstado(a.estado)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 text-sm text-gray-500">
                            <span>
                                {hasBuscado && !loading && total > 0 ? (
                                    <>
                                        Mostrando{' '}
                                        <span className="font-bold text-gray-700">{(pagina - 1) * limite + 1}</span>–
                                        <span className="font-bold text-gray-700">{Math.min(pagina * limite, total)}</span>
                                        {' '}de{' '}
                                        <span className="font-bold text-gray-700">{total}</span> registros
                                    </>
                                ) : (
                                    <span className="text-gray-300">—</span>
                                )}
                            </span>
                            {totalPaginas > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => buscar(1)}
                                        disabled={pagina === 1}
                                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                        «
                                    </button>
                                    <button
                                        onClick={() => buscar(pagina - 1)}
                                        disabled={pagina === 1}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                        Anterior
                                    </button>
                                    <span className="px-3 py-1.5 rounded-lg bg-blue-800 text-white font-bold text-xs">{pagina}</span>
                                    <button
                                        onClick={() => buscar(pagina + 1)}
                                        disabled={pagina === totalPaginas}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                        Siguiente
                                    </button>
                                    <button
                                        onClick={() => buscar(totalPaginas)}
                                        disabled={pagina === totalPaginas}
                                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                        »
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default ReporteAsistencia;

