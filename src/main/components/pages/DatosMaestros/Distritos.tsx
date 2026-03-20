import React, { useState, useEffect } from 'react';
import Sidebar from '../../sections/Sidebar';
import Header from '../../sections/Header';
import axios from 'axios';

interface Distrito {
    id: number;
    distrito: string;
    alias: string;
    estado: boolean;
    createdat?: string;
}

const Distritos = () => {
    const URL_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken') || '';
    
    const [distritos, setDistritos] = useState<Distrito[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ distrito: '', alias: '', estado: true });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [pagina, setPagina] = useState(1);
    const [limite, setLimite] = useState(10);
    const [buscar, setBuscar] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');

    useEffect(() => {
        cargarDistritos();
    }, []);

    const cargarDistritos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL_API}/distritos?pagina=1&limite=999`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDistritos(response.data?.distritos || response.data || []);
        } catch (error) {
            console.error('Error al cargar distritos:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (distrito: Distrito | null = null) => {
        if (distrito) {
            setFormData({ distrito: distrito.distrito, alias: distrito.alias, estado: distrito.estado });
            setEditingId(distrito.id);
        } else {
            setFormData({ distrito: '', alias: '', estado: true });
            setEditingId(null);
        }
        setShowModal(true);
    };

    const guardarDistrito = async () => {
        if (!formData.distrito.trim() || !formData.alias.trim()) {
            alert('Los campos nombre y alias son requeridos');
            return;
        }

        try {
            if (editingId) {
                await axios.put(`${URL_API}/distritos/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${URL_API}/distritos`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            cargarDistritos();
        } catch (error) {
            console.error('Error al guardar distrito:', error);
            alert('Error al guardar el distrito');
        }
    };

    const eliminarDistrito = async (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este distrito?')) {
            try {
                await axios.delete(`${URL_API}/distritos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                cargarDistritos();
            } catch (error) {
                console.error('Error al eliminar distrito:', error);
                alert('Error al eliminar el distrito');
            }
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

    const filtrados = distritos.filter(d => {
        const cumpleBusqueda = d.distrito?.toLowerCase().includes(buscar.toLowerCase()) || d.alias?.toLowerCase().includes(buscar.toLowerCase());
        const cumpleFiltro = filtroEstado === 'todos' || (filtroEstado === 'activos' ? d.estado : !d.estado);
        return cumpleBusqueda && cumpleFiltro;
    });

    const totalPaginas = Math.ceil(filtrados.length / limite);
    const distritosActuales = filtrados.slice((pagina - 1) * limite, pagina * limite);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            <main className="md:ml-64 pt-16">
                <div className="p-6">

                    {/* Encabezado */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">LISTADO DE DISTRITOS</h1>
                            <p className="text-gray-400 text-xs mt-0.5">Gestión de distritos educativos</p>
                        </div>
                        <button
                            onClick={() => abrirModal()}
                            className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-800/20 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Distrito
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
                                        value={filtroEstado}
                                        onChange={e => handleFiltroEstadoChange(e.target.value)}
                                        className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer">
                                        <option value="todos">Todos</option>
                                        <option value="activos">Activos</option>
                                        <option value="inactivos">Inactivos</option>
                                    </select>
                                </div>
                                
                                {distritos.length > 0 && (
                                    <span className="text-gray-400">— <span className="font-bold text-gray-600">{distritos.length}</span> registros</span>
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-semibold w-10">#</th>
                                        <th className="px-5 py-3 text-left font-semibold">Distrito</th>
                                        <th className="px-5 py-3 text-left font-semibold">Alias</th>
                                        <th className="px-5 py-3 text-left font-semibold">Estado</th>
                                        <th className="px-5 py-3 text-left font-semibold">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                         <tr>
                                            <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Cargando distritos...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : distritosActuales.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">
                                                No hay distritos registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        distritosActuales.map((distrito, idx) => (
                                            <tr key={distrito.id} className="hover:bg-blue-50/40 transition-colors">
                                                <td className="px-5 py-3 text-gray-500 font-medium">{(pagina - 1) * limite + idx + 1}</td>
                                                <td className="px-5 py-3 font-semibold text-gray-800">{distrito.distrito}</td>
                                                <td className="px-5 py-3">
                                                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                        {distrito.alias}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${distrito.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${distrito.estado ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                                        {distrito.estado ? 'ACTIVO' : 'INACTIVO'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => abrirModal(distrito)}
                                                            className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => eliminarDistrito(distrito.id)}
                                                            className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors border border-red-200"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination - Always visible */}
                        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 text-sm text-gray-500">
                            <span>Mostrando <span className="font-bold text-gray-700">{filtrados.length > 0 ? (pagina - 1) * limite + 1 : 0}</span>–<span className="font-bold text-gray-700">{Math.min(pagina * limite, filtrados.length)}</span> de <span className="font-bold text-gray-700">{filtrados.length}</span> registros</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPagina(1)}
                                    disabled={pagina === 1}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium text-gray-600 transition-colors text-xs"
                                >
                                    «
                                </button>
                                <button
                                    onClick={() => setPagina(Math.max(1, pagina - 1))}
                                    disabled={pagina === 1}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium text-gray-600 transition-colors text-xs"
                                >
                                    Anterior
                                </button>
                                <span className="px-3 py-1.5 rounded-lg bg-blue-800 text-white font-bold text-xs">{pagina}</span>
                                <button
                                    onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                                    disabled={pagina === totalPaginas}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium text-gray-600 transition-colors text-xs"
                                >
                                    Siguiente
                                </button>
                                <button
                                    onClick={() => setPagina(totalPaginas)}
                                    disabled={pagina === totalPaginas}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium text-gray-600 transition-colors text-xs"
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />

                        {/* Panel */}
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            {/* Header del modal */}
                            <div className="bg-gradient-to-r from-blue-900 to-blue-600 px-6 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-white font-extrabold text-base">{editingId ? 'Editar Distrito' : 'Nuevo Distrito'}</h2>
                                        <p className="text-blue-200 text-xs">El estado será ACTIVO por defecto</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Formulario */}
                            <form className="p-6 flex flex-col gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del Distrito *</label>
                                        <input
                                            type="text"
                                            value={formData.distrito}
                                            onChange={(e) => setFormData({...formData, distrito: e.target.value})}
                                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                            placeholder="Ej: Grocio Prado"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Alias *</label>
                                        <input
                                            type="text"
                                            value={formData.alias}
                                            onChange={(e) => setFormData({...formData, alias: e.target.value.toUpperCase()})}
                                            maxLength={3}
                                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                            placeholder="Ej: GP"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={guardarDistrito}
                                        className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 text-sm"
                                    >
                                        {editingId ? 'Actualizar' : 'Crear Distrito'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                </div>
            </main>
        </div>
    );
};

export default Distritos;
