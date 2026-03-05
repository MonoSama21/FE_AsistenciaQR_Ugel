import React, { useEffect, useState } from "react";
import Sidebar from "../sections/Sidebar";
import Header from "../sections/Header";
import axios from "axios";

interface Personal {
    id?: number;
    dni?: string;
    nombres?: string;
    apellidos?: string;
    cargo?: string;
    codigoQR?: string;
}

const Personal = () => {
    const URL_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken') || '';

    const [personal, setPersonal] = useState<Personal[]>([]);
    const [loading, setLoading] = useState(true);
    const [buscar, setBuscar] = useState('');
    const [pagina, setPagina] = useState(1);
    const [limite, setLimite] = useState(10);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);

    // Modal nuevo personal
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ dni: '', nombres: '', apellidos: '', cargo: '' });
    const [loadingCrear, setLoadingCrear] = useState(false);
    const [errorCrear, setErrorCrear] = useState<string | null>(null);
    const [successCrear, setSuccessCrear] = useState<string | null>(null);

    useEffect(() => {
        obtenerPersonal(pagina, limite);
    }, [pagina, limite]);

    const obtenerPersonal = async (pag: number, lim: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL_API}/personal?pagina=${pag}&limite=${lim}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.personal || response.data?.data || response.data;
            const totalRegs = response.data?.total || 0;
            const totalPags = response.data?.totalPaginas || response.data?.total_paginas || (totalRegs > 0 ? Math.ceil(totalRegs / lim) : 1);
            setPersonal(Array.isArray(data) ? data : []);
            setTotalPaginas(totalPags);
            setTotalRegistros(totalRegs);
        } catch (error) {
            console.error('Error al obtener personal:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLimiteChange = (nuevoLimite: number) => {
        setLimite(nuevoLimite);
        setPagina(1);
    };

    const abrirModal = () => {
        setForm({ dni: '', nombres: '', apellidos: '', cargo: '' });
        setErrorCrear(null);
        setSuccessCrear(null);
        setModalOpen(true);
    };

    const crearPersonal = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingCrear(true);
        setErrorCrear(null);
        setSuccessCrear(null);
        try {
            await axios.post(`${URL_API}/personal`, form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            setSuccessCrear('Personal registrado correctamente.');
            setTimeout(() => {
                setModalOpen(false);
                obtenerPersonal(pagina, limite);
            }, 1200);
        } catch (error: any) {
            setErrorCrear(error.response?.data?.message || 'Error al registrar personal.');
        } finally {
            setLoadingCrear(false);
        }
    };

    const filtrados = personal.filter(p =>
        p.nombres?.toLowerCase().includes(buscar.toLowerCase()) ||
        p.apellidos?.toLowerCase().includes(buscar.toLowerCase()) ||
        p.cargo?.toLowerCase().includes(buscar.toLowerCase()) ||
        p.dni?.includes(buscar)
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            <main className="md:ml-64 pt-16">
                <div className="p-6">

                    {/* Encabezado */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">LISTADO DE PERSONAL</h1>
                            <p className="text-gray-400 text-xs mt-0.5">Gestión de personal de la institución</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 border border-blue-800 text-blue-800 hover:bg-blue-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Carné Masivo
                            </button>
                            <button onClick={abrirModal} className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-800/20 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo Registro
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta tabla */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Barra superior */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>Mostrar</span>
                                <select value={limite} onChange={e => handleLimiteChange(Number(e.target.value))}
                                    className="border border-gray-200 bg-gray-50 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer">
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                                <span>registros</span>
                                {totalRegistros > 0 && (
                                    <span className="ml-2 text-gray-400">— <span className="font-bold text-gray-600">{totalRegistros}</span> en total</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Buscar:</span>
                                <input type="text" value={buscar} onChange={e => setBuscar(e.target.value)}
                                    className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all w-48"
                                    placeholder="Buscar..." />
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                        <th className="px-5 py-3 text-left font-semibold w-10">#</th>
                                        <th className="px-5 py-3 text-left font-semibold">DNI</th>
                                        <th className="px-5 py-3 text-left font-semibold">Personal</th>
                                        <th className="px-5 py-3 text-left font-semibold">Cargo</th>
                                        <th className="px-5 py-3 text-left font-semibold">QR</th>
                                        <th className="px-5 py-3 text-left font-semibold">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Cargando personal...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filtrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                No se encontraron registros.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtrados.map((p, index) => (
                                            <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                                                <td className="px-5 py-3 text-gray-500 font-medium">
                                                    {(pagina - 1) * limite + index + 1}
                                                </td>
                                                <td className="px-5 py-3 font-mono font-semibold text-gray-800">{p.dni}</td>
                                                <td className="px-5 py-3 text-gray-800 font-medium">{p.nombres} {p.apellidos}</td>
                                                <td className="px-5 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                        {p.cargo}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {p.codigoQR ? (
                                                        <img src={p.codigoQR} alt={`QR ${p.dni}`} className="w-10 h-10 object-contain rounded border border-gray-200" />
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">Sin QR</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <button className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors border border-indigo-200">
                                                            Carné
                                                        </button>
                                                        <button className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200">
                                                            Foto
                                                        </button>
                                                    </div>
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
                                Mostrando <span className="font-bold text-gray-700">{(pagina - 1) * limite + 1}</span>–<span className="font-bold text-gray-700">{Math.min(pagina * limite, totalRegistros || pagina * limite)}</span>
                                {totalRegistros > 0 && <> de <span className="font-bold text-gray-700">{totalRegistros}</span> registros</>}
                            </span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPagina(1)} disabled={pagina === 1}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">«</button>
                                <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">Anterior</button>
                                <span className="px-3 py-1.5 rounded-lg bg-blue-800 text-white font-bold text-xs">{pagina}</span>
                                <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">Siguiente</button>
                                <button onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">»</button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Modal Nuevo Personal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header */}
                        <div className="bg-linear-to-r from-blue-900 to-blue-600 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-extrabold text-base">Registro de Personal</h2>
                                    <p className="text-blue-200 text-xs">Complete los datos del nuevo personal</p>
                                </div>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={crearPersonal} className="p-6 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">DNI</label>
                                    <input type="text" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="12345678" maxLength={8} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cargo</label>
                                    <input type="text" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="Ej: Jefe de área" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombres</label>
                                    <input type="text" value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="Nombres" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Apellidos</label>
                                    <input type="text" value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="Apellidos" required />
                                </div>
                            </div>

                            {successCrear && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs">{successCrear}</div>}
                            {errorCrear && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs">{errorCrear}</div>}

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                                    Cerrar
                                </button>
                                <button type="submit" disabled={loadingCrear}
                                    className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 text-sm">
                                    {loadingCrear ? 'Registrando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Personal;

