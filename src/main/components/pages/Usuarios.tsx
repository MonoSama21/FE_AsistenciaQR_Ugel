import React, { useEffect, useState } from "react";
import Sidebar from "../sections/Sidebar";
import Header from "../sections/Header";
import axios from "axios";

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    estado: boolean;
}

const Usuarios = () => {
    const URL_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken') || '';

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [buscar, setBuscar] = useState('');
    const [pagina, setPagina] = useState(1);
    const [limite, setLimite] = useState(10);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);

    // Modal nuevo usuario
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ nombre: '', email: '', rol: 'Admin', telefono: '', password: '' });
    const [loadingCrear, setLoadingCrear] = useState(false);
    const [errorCrear, setErrorCrear] = useState<string | null>(null);
    const [successCrear, setSuccessCrear] = useState<string | null>(null);

    useEffect(() => {
        obtenerUsuarios(pagina, limite);
    }, [pagina, limite]);

    const obtenerUsuarios = async (pag: number, lim: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL_API}/usuarios?pagina=${pag}&limite=${lim}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.usuarios || response.data?.data || response.data;
            const totalRegs = response.data?.total || 0;
            const totalPags = response.data?.totalPaginas || response.data?.total_paginas || (totalRegs > 0 ? Math.ceil(totalRegs / lim) : 1);
            setUsuarios(Array.isArray(data) ? data : []);
            setTotalPaginas(totalPags);
            setTotalRegistros(totalRegs);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLimiteChange = (nuevoLimite: number) => {
        setLimite(nuevoLimite);
        setPagina(1);
    };

    const abrirModal = () => {
        setForm({ nombre: '', email: '', rol: 'Admin', telefono: '', password: '' });
        setErrorCrear(null);
        setSuccessCrear(null);
        setModalOpen(true);
    };

    const crearUsuario = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingCrear(true);
        setErrorCrear(null);
        setSuccessCrear(null);
        try {
            await axios.post(`${URL_API}/usuarios`, form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            setSuccessCrear('Usuario creado correctamente.');
            setTimeout(() => {
                setModalOpen(false);
                obtenerUsuarios(pagina, limite);
            }, 1200);
        } catch (error: any) {
            setErrorCrear(error.response?.data?.message || 'Error al crear el usuario.');
        } finally {
            setLoadingCrear(false);
        }
    };

    const filtrados = usuarios.filter(u =>
        u.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
        u.email?.toLowerCase().includes(buscar.toLowerCase()) ||
        u.rol?.toLowerCase().includes(buscar.toLowerCase()) ||
        u.estado?.toString().includes(buscar.toLowerCase())
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
                            <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">LISTADO DE USUARIOS</h1>
                            <p className="text-gray-400 text-xs mt-0.5">Gestión de acceso al sistema</p>
                        </div>
                        <button onClick={abrirModal} className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-800/20 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Usuario
                        </button>
                    </div>

                    {/* Tarjeta tabla */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Barra superior */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>Mostrar</span>
                                <select
                                    value={limite}
                                    onChange={e => handleLimiteChange(Number(e.target.value))}
                                    className="border border-gray-200 bg-gray-50 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer">
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                                <span>registros</span>
                                {totalRegistros > 0 && (
                                    <span className="ml-2 text-gray-400">— <span className="font-bold text-gray-600">{totalRegistros}</span>   Registros en total</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Buscar:</span>
                                <input
                                    type="text"
                                    value={buscar}
                                    onChange={e => setBuscar(e.target.value)}
                                    className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all w-48"
                                    placeholder="Buscar..."
                                />
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                        <th className="px-5 py-3 text-left font-semibold w-10">#</th>
                                        <th className="px-5 py-3 text-left font-semibold">Usuario</th>
                                        <th className="px-5 py-3 text-left font-semibold">Rol</th>
                                        <th className="px-5 py-3 text-left font-semibold">Empleado</th>
                                        <th className="px-5 py-3 text-left font-semibold">Estado</th>
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
                                                    Cargando usuarios...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filtrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                No se encontraron usuarios.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtrados.map((u, index) => (
                                            <tr key={u.id} className="hover:bg-blue-50/40 transition-colors">
                                                <td className="px-5 py-3 text-gray-500 font-medium">
                                                    {(pagina - 1) * limite + index + 1}
                                                </td>
                                                <td className="px-5 py-3 font-semibold text-gray-800">{u.nombre}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                                        ${u.rol?.toUpperCase() === 'ADMIN'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'}`}>
                                                        {u.rol}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-gray-600">{u.email}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold
                                                        ${u.estado
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-600'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${u.estado ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                                        {u.estado ? 'ACTIVO' : 'INACTIVO'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <button className="px-3 py-1 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold text-xs transition-colors border border-yellow-200">
                                                            Editar
                                                        </button>
                                                        <button className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors border border-red-200">
                                                            Eliminar
                                                        </button>
                                                        <button className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200">
                                                            Ver
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
                                <button
                                    onClick={() => setPagina(1)}
                                    disabled={pagina === 1}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                    «
                                </button>
                                <button
                                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                                    disabled={pagina === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                    Anterior
                                </button>
                                <span className="px-3 py-1.5 rounded-lg bg-blue-800 text-white font-bold text-xs">{pagina}</span>
                                <button
                                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                                    disabled={pagina === totalPaginas}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                    Siguiente
                                </button>
                                <button
                                    onClick={() => setPagina(totalPaginas)}
                                    disabled={pagina === totalPaginas}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                    »
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Modal Nuevo Usuario */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />

                    {/* Panel */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header del modal */}
                        <div className="bg-linear-to-r from-blue-900 to-blue-600 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-extrabold text-base">Nuevo Usuario</h2>
                                    <p className="text-blue-200 text-xs">El estado será ACTIVO por defecto</p>
                                </div>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={crearUsuario} className="p-6 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo</label>
                                    <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="Nombre completo" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Correo electrónico</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="correo@ejemplo.com" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rol</label>
                                    <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all cursor-pointer">
                                        <option value="Admin">Admin</option>
                                        <option value="Personal">Personal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono</label>
                                    <input type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="999 999 999" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña</label>
                                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="••••••••" required />
                                </div>
                            </div>

                            {successCrear && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs">{successCrear}</div>}
                            {errorCrear && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs">{errorCrear}</div>}

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loadingCrear}
                                    className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 text-sm">
                                    {loadingCrear ? 'Guardando...' : 'Crear usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Usuarios;
