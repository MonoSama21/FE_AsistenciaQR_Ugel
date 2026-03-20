import React, { useState, useEffect } from 'react';
import Sidebar from '../../sections/Sidebar';
import Header from '../../sections/Header';
import axios from 'axios';

interface Distrito {
    id: number;
    distrito: string;
    alias: string;
}

interface InstitucionEducativa {
    id: number;
    codigoModular: string;
    nombreIE: string;
    nivelModalidad: string;
    distritoId: number;
    estado: boolean;
    distrito?: Distrito;
    createdat?: string;
}

const InstitucionesEducativas = () => {
    const URL_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken') || '';
    
    const [instituciones, setInstituciones] = useState<InstitucionEducativa[]>([]);
    const [distritos, setDistritos] = useState<Distrito[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        codigoModular: '',
        nombreIE: '',
        nivelModalidad: 'INICIAL-JARDIN',
        distritoId: '',
        estado: true
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [pagina, setPagina] = useState(1);
    const [limite, setLimite] = useState(10);
    const [buscar, setBuscar] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');

    const nivelModalidadOpciones = ['INICIAL-JARDIN', 'PRIMARIA', 'SECUNDARIA', 'EBA-CEPTPRO'];

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [instResponse, distResponse] = await Promise.all([
                axios.get(`${URL_API}/institucioneseducativas?pagina=1&limite=999`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${URL_API}/distritos?pagina=1&limite=999`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setInstituciones(instResponse.data?.institucioneseducativas || instResponse.data?.instituciones || instResponse.data || []);
            setDistritos(distResponse.data?.distritos || distResponse.data || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (institucion: InstitucionEducativa | null = null) => {
        if (institucion) {
            setFormData({
                codigoModular: institucion.codigoModular,
                nombreIE: institucion.nombreIE,
                nivelModalidad: institucion.nivelModalidad,
                distritoId: institucion.distritoId.toString(),
                estado: institucion.estado
            });
            setEditingId(institucion.id);
        } else {
            setFormData({
                codigoModular: '',
                nombreIE: '',
                nivelModalidad: 'INICIAL-JARDIN',
                distritoId: '',
                estado: true
            });
            setEditingId(null);
        }
        setShowModal(true);
    };

    const guardarInstitucion = async () => {
        if (!formData.codigoModular.trim() || !formData.nombreIE.trim() || !formData.distritoId) {
            alert('Los campos código modular, nombre y distrito son requeridos');
            return;
        }

        try {
            const payload = {
                ...formData,
                distritoId: parseInt(formData.distritoId)
            };

            if (editingId) {
                await axios.put(`${URL_API}/institucioneseducativas/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${URL_API}/institucioneseducativas`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            console.error('Error al guardar institución:', error);
            alert('Error al guardar la institución');
        }
    };

    const eliminarInstitucion = async (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta institución?')) {
            try {
                await axios.delete(`${URL_API}/institucioneseducativas/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                cargarDatos();
            } catch (error) {
                console.error('Error al eliminar institución:', error);
                alert('Error al eliminar la institución');
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

    const filtrados = instituciones.filter(i => {
        const cumpleBusqueda = i.nombreIE?.toLowerCase().includes(buscar.toLowerCase()) || i.codigoModular?.toLowerCase().includes(buscar.toLowerCase());
        const cumpleFiltro = filtroEstado === 'todos' || (filtroEstado === 'activos' ? i.estado : !i.estado);
        return cumpleBusqueda && cumpleFiltro;
    });

    const totalPaginas = Math.ceil(filtrados.length / limite);
    const institucionesActuales = filtrados.slice((pagina - 1) * limite, pagina * limite);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            <main className="md:ml-64 pt-16">
                <div className="p-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">LISTADO DE INSTITUCIONES EDUCATIVAS</h1>
                            <p className="text-gray-400 text-xs mt-0.5">Gestión de instituciones del sistema</p>
                        </div>
                        <button
                            onClick={() => abrirModal()}
                            className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-800/20 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Institución
                        </button>
                    </div>
                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Top Bar */}
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
                                
                                {instituciones.length > 0 && (
                                    <span className="text-gray-400">— <span className="font-bold text-gray-600">{instituciones.length}</span> registros</span>
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
                                        <th className="px-5 py-3 text-left font-semibold">#</th>
                                        <th className="px-5 py-3 text-left font-semibold">Institución</th>
                                        <th className="px-5 py-3 text-left font-semibold">Código</th>
                                        <th className="px-5 py-3 text-left font-semibold">Nivel</th>
                                        <th className="px-5 py-3 text-left font-semibold">Distrito</th>
                                        <th className="px-5 py-3 text-left font-semibold">Estado</th>
                                        <th className="px-5 py-3 text-left font-semibold">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                            <tr>
                                                <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                        Cargando Instituciones Educativas...
                                                    </div>
                                                </td>
                                            </tr>
                                    ) : institucionesActuales.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center text-gray-500 text-sm">
                                                No hay instituciones registradas
                                            </td>
                                        </tr>
                                    ) : (
                                        institucionesActuales.map((institucion, idx) => (
                                            <tr key={institucion.id} className="hover:bg-blue-50/40 transition-colors">
                                                <td className="px-5 py-3 text-gray-500 font-medium">{(pagina - 1) * limite + idx + 1}</td>
                                                <td className="px-5 py-3 font-semibold text-gray-800">{institucion.nombreIE}</td>
                                                <td className="px-5 py-3 font-mono text-gray-700">{institucion.codigoModular}</td>
                                                <td className="px-5 py-3">
                                                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                                        {institucion.nivelModalidad}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                        {institucion.distrito?.alias || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${institucion.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${institucion.estado ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                                        {institucion.estado ? 'ACTIVO' : 'INACTIVO'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => abrirModal(institucion)}
                                                            className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => eliminarInstitucion(institucion.id)}
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
            </main>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-white font-extrabold text-base">{editingId ? 'Editar Institución' : 'Nueva Institución'}</h2>
                                        <p className="text-blue-200 text-xs">Gestión de instituciones educativas</p>
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
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre de la IE *</label>
                                        <input
                                            type="text"
                                            value={formData.nombreIE}
                                            onChange={(e) => setFormData({...formData, nombreIE: e.target.value})}
                                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                            placeholder="Ej: 22226 NUESTRA SEÑORA"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Código Modular *</label>
                                        <input
                                            type="text"
                                            value={formData.codigoModular}
                                            onChange={(e) => setFormData({...formData, codigoModular: e.target.value})}
                                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                            placeholder="Ej: 0281774"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Nivel/Modalidad *</label>
                                        <select
                                            value={formData.nivelModalidad}
                                            onChange={(e) => setFormData({...formData, nivelModalidad: e.target.value})}
                                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        >
                                            {nivelModalidadOpciones.map(nivel => (
                                                <option key={nivel} value={nivel}>{nivel}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Distrito *</label>
                                        <select
                                            value={formData.distritoId}
                                            onChange={(e) => setFormData({...formData, distritoId: e.target.value})}
                                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        >
                                            <option value="">Seleccionar distrito</option>
                                            {distritos.map(d => (
                                                <option key={d.id} value={d.id}>{d.distrito} ({d.alias})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
                                        <select
                                            value={formData.estado ? 'true' : 'false'}
                                            onChange={(e) => setFormData({...formData, estado: e.target.value === 'true'})}
                                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        >
                                            <option value="true">Activo</option>
                                            <option value="false">Inactivo</option>
                                        </select>
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
                                        onClick={guardarInstitucion}
                                        className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 text-sm"
                                    >
                                        {editingId ? 'Actualizar' : 'Crear Institución'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default InstitucionesEducativas;
