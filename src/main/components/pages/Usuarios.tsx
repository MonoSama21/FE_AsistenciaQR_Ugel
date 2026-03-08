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
    const [filtroEstado, setFiltroEstado] = useState<string>('todos'); // 'todos', 'activos', 'inactivos'

    // Modal nuevo usuario
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ nombre: '', email: '', rol: 'Admin', telefono: '', password: '' });
    const [loadingCrear, setLoadingCrear] = useState(false);
    const [errorCrear, setErrorCrear] = useState<string | null>(null);
    const [successCrear, setSuccessCrear] = useState<string | null>(null);

    // Modal eliminar usuario
    const [modalEliminar, setModalEliminar] = useState(false);
    const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
    const [loadingEliminar, setLoadingEliminar] = useState(false);
    const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
    const [successEliminar, setSuccessEliminar] = useState<string | null>(null);

    // Modal ver usuario
    const [modalVer, setModalVer] = useState(false);
    const [usuarioVer, setUsuarioVer] = useState<any>(null);
    const [loadingVer, setLoadingVer] = useState(false);
    const [errorVer, setErrorVer] = useState<string | null>(null);

    useEffect(() => {
        obtenerUsuarios(pagina, limite, filtroEstado);
    }, [pagina, limite, filtroEstado]);

    const obtenerUsuarios = async (pag: number, lim: number, estado: string) => {
        setLoading(true);
        try {
            let url = `${URL_API}/usuarios?pagina=${pag}&limite=${lim}`;
            
            // Agregar parámetro estado si no es 'todos'
            if (estado === 'activos') {
                url += '&estado=true';
            } else if (estado === 'inactivos') {
                url += '&estado=false';
            }
            
            const response = await axios.get(url, {
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

    const handleFiltroEstadoChange = (nuevoEstado: string) => {
        setFiltroEstado(nuevoEstado);
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
                obtenerUsuarios(pagina, limite, filtroEstado);
            }, 1200);
        } catch (error: any) {
            setErrorCrear(error.response?.data?.message || 'Error al crear el usuario.');
        } finally {
            setLoadingCrear(false);
        }
    };

    const abrirModalEliminar = (usuario: Usuario) => {
        setUsuarioAEliminar(usuario);
        setErrorEliminar(null);
        setSuccessEliminar(null);
        setModalEliminar(true);
    };

    const eliminarUsuario = async () => {
        if (!usuarioAEliminar) return;
        
        setLoadingEliminar(true);
        setErrorEliminar(null);
        setSuccessEliminar(null);
        
        try {
            await axios.delete(`${URL_API}/usuarios/${usuarioAEliminar.id}`, {
                headers: { Authorization: token }
            });
            setSuccessEliminar('Usuario eliminado correctamente.');
            setTimeout(() => {
                setModalEliminar(false);
                setUsuarioAEliminar(null);
                obtenerUsuarios(pagina, limite, filtroEstado);
            }, 1200);
        } catch (error: any) {
            setErrorEliminar(error.response?.data?.message || 'Error al eliminar el usuario.');
        } finally {
            setLoadingEliminar(false);
        }
    };

    const abrirModalVer = async (usuarioId: number) => {
        setModalVer(true);
        setLoadingVer(true);
        setErrorVer(null);
        setUsuarioVer(null);

        try {
            const response = await axios.get(`${URL_API}/usuarios/${usuarioId}`, {
                headers: { Authorization: token }
            });
            setUsuarioVer(response.data.usuario || response.data);
        } catch (error: any) {
            setErrorVer(error.response?.data?.message || 'Error al obtener información del usuario.');
        } finally {
            setLoadingVer(false);
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
                            <h1 id="titulo-listado-usuarios" data-testid="page-title" className="text-2xl font-extrabold text-blue-900 tracking-tight">LISTADO DE USUARIOS</h1>
                            <p className="text-gray-400 text-xs mt-0.5">Gestión de acceso al sistema</p>
                        </div>
                        <button id="btn-nuevo-usuario" data-testid="btn-new-user" onClick={abrirModal} className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-800/20 transition-all">
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
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span>Mostrar</span>
                                    <select
                                        id="select-limite"
                                        data-testid="select-limit"
                                        value={limite}
                                        onChange={e => handleLimiteChange(Number(e.target.value))}
                                        className="border border-gray-200 bg-gray-50 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer">
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                    </select>
                                    <span>registros</span>
                                </div>
                                
                                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                                    <span>Estado:</span>
                                    <select
                                        id="select-filtro-estado"
                                        data-testid="select-filter-status"
                                        value={filtroEstado}
                                        onChange={e => handleFiltroEstadoChange(e.target.value)}
                                        className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer">
                                        <option value="todos">Todos</option>
                                        <option value="activos">Activos</option>
                                        <option value="inactivos">Inactivos</option>
                                    </select>
                                </div>
                                
                                {totalRegistros > 0 && (
                                    <span className="text-gray-400">— <span className="font-bold text-gray-600">{totalRegistros}</span> registros</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Buscar:</span>
                                <input
                                    id="input-buscar-usuario"
                                    data-testid="search-input"
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
                            <table id="tabla-usuarios" data-testid="users-table" className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                        <th id="col-numero" data-testid="column-number" className="px-5 py-3 text-left font-semibold w-10">#</th>
                                        <th id="col-usuario" data-testid="column-usuario" className="px-5 py-3 text-left font-semibold">Usuario</th>
                                        <th id="col-rol" data-testid="column-rol" className="px-5 py-3 text-left font-semibold">Rol</th>
                                        <th id="col-empleado" data-testid="column-empleado" className="px-5 py-3 text-left font-semibold">Correo</th>
                                        <th id="col-estado" data-testid="column-estado" className="px-5 py-3 text-left font-semibold">Estado</th>
                                        <th id="col-accion" data-testid="column-accion" className="px-5 py-3 text-left font-semibold">Acción</th>
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

                                                        {u.estado ? (
                                                            <button 
                                                                data-testid="btn-eliminar-usuario" 
                                                                onClick={() => abrirModalEliminar(u)}
                                                                className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors border border-red-200">
                                                                Eliminar
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                data-testid="btn-activar-usuario" 
                                                                onClick={() => console.log('Activar usuario', u.id)}
                                                                className="px-3 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 font-semibold text-xs transition-colors border border-green-200">
                                                                Activar
                                                            </button>
                                                        )}
                                                        <button 
                                                            data-testid="btn-ver-usuario" 
                                                            onClick={() => abrirModalVer(u.id)}
                                                            className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200">
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
                                    id="btn-primera-pagina"
                                    data-testid="btn-first-page"
                                    onClick={() => setPagina(1)}
                                    disabled={pagina === 1}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                    «
                                </button>
                                <button
                                    id="btn-pagina-anterior"
                                    data-testid="btn-prev-page"
                                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                                    disabled={pagina === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                    Anterior
                                </button>
                                <span id="pagina-actual" data-testid="current-page" className="px-3 py-1.5 rounded-lg bg-blue-800 text-white font-bold text-xs">{pagina}</span>
                                <button
                                    id="btn-pagina-siguiente"
                                    data-testid="btn-next-page"
                                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                                    disabled={pagina === totalPaginas}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">
                                    Siguiente
                                </button>
                                <button
                                    id="btn-ultima-pagina"
                                    data-testid="btn-last-page"
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
                <div id="modal-nuevo-usuario" data-testid="modal-new-user" className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                        <form id="form-nuevo-usuario" data-testid="form-new-user" onSubmit={crearUsuario} className="p-6 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo</label>
                                    <input id="input-nombre" data-testid="input-nombre" type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="Nombre completo" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Correo electrónico</label>
                                    <input id="input-email" data-testid="input-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="correo@ejemplo.com" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rol</label>
                                    <select id="select-rol" data-testid="select-rol" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all cursor-pointer">
                                        <option value="Admin">Admin</option>
                                        <option value="Personal">Personal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono</label>
                                    <input id="input-telefono" data-testid="input-telefono" type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="999 999 999" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña</label>
                                    <input id="input-password" data-testid="input-password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="••••••••" required />
                                </div>
                            </div>

                            {successCrear && <div id="mensaje-exito" data-testid="success-message" className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs">{successCrear}</div>}
                            {errorCrear && <div id="mensaje-error" data-testid="error-message" className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs">{errorCrear}</div>}

                            <div className="flex gap-3 pt-1">
                                <button id="btn-cancelar-modal" data-testid="btn-cancel-modal" type="button" onClick={() => setModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                                    Cancelar
                                </button>
                                <button id="btn-guardar-usuario" data-testid="btn-save-user" type="submit" disabled={loadingCrear}
                                    className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 text-sm">
                                    {loadingCrear ? 'Guardando...' : 'Crear usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Eliminar Usuario */}
            {modalEliminar && usuarioAEliminar && (
                <div id="modal-eliminar-usuario" data-testid="modal-delete-user" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" onClick={() => setModalEliminar(false)} />

                    {/* Panel */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header del modal */}
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-extrabold text-base">Eliminar Usuario</h2>
                                    <p className="text-red-100 text-xs">Esta acción no se puede deshacer</p>
                                </div>
                            </div>
                            <button onClick={() => setModalEliminar(false)} className="text-white/70 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <p className="text-sm text-gray-700 mb-3">
                                    ¿Está seguro que desea eliminar al usuario?
                                </p>
                                <div className="bg-white rounded-lg p-3 border border-red-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm">{usuarioAEliminar.nombre}</p>
                                            <p className="text-xs text-gray-500">{usuarioAEliminar.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                                    {usuarioAEliminar.rol}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                    usuarioAEliminar.estado 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {usuarioAEliminar.estado ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {successEliminar && (
                                <div id="mensaje-exito-eliminar" data-testid="success-delete-message" className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs mb-4">
                                    {successEliminar}
                                </div>
                            )}
                            {errorEliminar && (
                                <div id="mensaje-error-eliminar" data-testid="error-delete-message" className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs mb-4">
                                    {errorEliminar}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button 
                                    id="btn-cancelar-eliminar" 
                                    data-testid="btn-cancel-delete"
                                    type="button" 
                                    onClick={() => setModalEliminar(false)}
                                    disabled={loadingEliminar}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm disabled:opacity-50">
                                    Cancelar
                                </button>
                                <button 
                                    id="btn-confirmar-eliminar" 
                                    data-testid="btn-confirm-delete"
                                    type="button" 
                                    onClick={eliminarUsuario}
                                    disabled={loadingEliminar}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 text-sm">
                                    {loadingEliminar ? 'Eliminando...' : 'Sí, eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ver Usuario */}
            {modalVer && (
                <div id="modal-ver-usuario" data-testid="modal-view-user" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" onClick={() => setModalVer(false)} />

                    {/* Panel */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Header del modal */}
                        <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-extrabold text-base">Información del Usuario</h2>
                                    <p className="text-blue-200 text-xs">Detalles completos del usuario</p>
                                </div>
                            </div>
                            <button onClick={() => setModalVer(false)} className="text-white/70 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6">
                            {loadingVer ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        <span className="text-gray-600 text-sm">Cargando información...</span>
                                    </div>
                                </div>
                            ) : errorVer ? (
                                <div id="mensaje-error-ver" data-testid="error-view-message" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {errorVer}
                                </div>
                            ) : usuarioVer ? (
                                <div className="space-y-4">
                                    {/* Foto de perfil */}
                                    <div className="flex justify-center mb-4">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Información en tarjetas */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-4">
                                            <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1 block">ID Usuario</label>
                                            <p id="ver-id" data-testid="view-id" className="text-sm font-bold text-gray-800">{usuarioVer.id}</p>
                                        </div>

                                        <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-4">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Nombre Completo</label>
                                            <p id="ver-nombre" data-testid="view-nombre" className="text-sm font-bold text-gray-800">{usuarioVer.nombre}</p>
                                        </div>

                                        <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-4">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Correo Electrónico</label>
                                            <p id="ver-email" data-testid="view-email" className="text-sm font-bold text-gray-800 break-all">{usuarioVer.email}</p>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Rol</label>
                                            <span id="ver-rol" data-testid="view-rol" className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                usuarioVer.rol?.toUpperCase() === 'ADMIN'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {usuarioVer.rol}
                                            </span>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Estado</label>
                                            <span id="ver-estado" data-testid="view-estado" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                usuarioVer.estado
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${usuarioVer.estado ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                                {usuarioVer.estado ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </div>

                                        {usuarioVer.telefono && (
                                            <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-4">
                                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Teléfono</label>
                                                <p id="ver-telefono" data-testid="view-telefono" className="text-sm font-bold text-gray-800">{usuarioVer.telefono}</p>
                                            </div>
                                        )}

                                        {usuarioVer.createdAt && (
                                            <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-4">
                                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Fecha de Creación</label>
                                                <p id="ver-fecha-creacion" data-testid="view-created-at" className="text-sm font-bold text-gray-800">
                                                    {new Date(usuarioVer.createdAt).toLocaleString('es-PE', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {usuarioVer.updatedAt && (
                                            <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-4">
                                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Última Actualización</label>
                                                <p id="ver-fecha-actualizacion" data-testid="view-updated-at" className="text-sm font-bold text-gray-800">
                                                    {new Date(usuarioVer.updatedAt).toLocaleString('es-PE', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botón cerrar */}
                                    <div className="pt-2">
                                        <button 
                                            id="btn-cerrar-ver" 
                                            data-testid="btn-close-view"
                                            type="button" 
                                            onClick={() => setModalVer(false)}
                                            className="w-full py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm">
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Usuarios;
