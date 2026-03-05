import React, { useEffect, useState } from "react";
import Sidebar from "../sections/Sidebar";
import Header from "../sections/Header";
import axios from "axios";

const Configuracion = () => {
    const URL_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken') || '';
    const userId = localStorage.getItem('userId') || '';

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [loadingDatos, setLoadingDatos] = useState(false);
    const [successDatos, setSuccessDatos] = useState<string | null>(null);
    const [errorDatos, setErrorDatos] = useState<string | null>(null);

    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loadingPass, setLoadingPass] = useState(false);
    const [successPass, setSuccessPass] = useState<string | null>(null);
    const [errorPass, setErrorPass] = useState<string | null>(null);

    useEffect(() => {
        obtenerDatos();
    }, []);

    const obtenerDatos = async () => {
        try {
            const response = await axios.get(`${URL_API}/usuarios/${userId}`, {
                headers: { Authorization: token }
            });
            const u = response.data;
            setNombre(u.nombre || '');
            setEmail(u.email || '');
            setTelefono(u.telefono || '');
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
        }
    };

    const actualizarDatos = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingDatos(true);
        setSuccessDatos(null);
        setErrorDatos(null);
        try {
            await axios.put(`${URL_API}/usuarios/datos`, { nombre, email, telefono }, {
                headers: { Authorization: token }
            });
            localStorage.setItem('userName', nombre);
            localStorage.setItem('userEmail', email);
            setSuccessDatos('Datos actualizados correctamente.');
        } catch (error: any) {
            setErrorDatos(error.response?.data?.message || 'Error al actualizar datos.');
        } finally {
            setLoadingDatos(false);
        }
    };

    const cambiarPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessPass(null);
        setErrorPass(null);
        if (passwordNueva !== passwordConfirm) {
            setErrorPass('Las contraseñas nuevas no coinciden.');
            return;
        }
        setLoadingPass(true);
        try {
            await axios.put(`${URL_API}/usuarios/password`, { passwordActual, passwordNueva }, {
                headers: { Authorization: token }
            });
            setSuccessPass('Contraseña actualizada correctamente.');
            setPasswordActual('');
            setPasswordNueva('');
            setPasswordConfirm('');
        } catch (error: any) {
            setErrorPass(error.response?.data?.message || 'Error al cambiar la contraseña.');
        } finally {
            setLoadingPass(false);
        }
    };

    const userRol = localStorage.getItem('userRol') || 'Usuario';

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            <main className="md:ml-64 pt-16 h-screen overflow-hidden">
                <div className="h-[calc(100vh-4rem)] flex flex-col p-5 gap-4">

                    {/* Header de página */}
                    <div className="flex items-center gap-4 shrink-0">

                        <div>
                            <h1 className="text-xl font-extrabold text-blue-900 leading-tight">CONFIGURACIÓN DE CUENTA</h1>
                            <p className="text-gray-400 text-xs">Gestiona tu información personal y acceso al sistema</p>
                        </div>
                    </div>

                    {/* Contenido en dos columnas */}
                    <div className="grid md:grid-cols-2 gap-3 items-start">

                        {/* Tarjeta izquierda - Perfil + Datos */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                            {/* Banner */}
                            <div className="bg-blue-900 px-6 py-5 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 border-2 border-white/30 shadow-lg">
                                    <span className="text-white font-extrabold text-2xl">{nombre.charAt(0).toUpperCase() || 'U'}</span>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base leading-tight">{nombre || 'Usuario'}</p>
                                    <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mt-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                        {userRol}
                                    </span>
                                </div>
                            </div>

                            {/* Formulario datos */}
                            <form onSubmit={actualizarDatos} className="flex flex-col p-5 gap-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Datos personales</p>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo</label>
                                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="Nombre completo" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Correo electrónico</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="correo@ejemplo.com" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono</label>
                                    <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="999 999 999" />
                                </div>

                                {successDatos && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs">{successDatos}</div>}
                                {errorDatos && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs">{errorDatos}</div>}

                                <button type="submit" disabled={loadingDatos}
                                    className="mt-3 w-full py-2.5 bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-800/20 text-sm">
                                    {loadingDatos ? 'Actualizando...' : 'Guardar cambios'}
                                </button>
                            </form>
                        </div>

                        {/* Tarjeta derecha - Cambiar contraseña */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                            {/* Banner */}
                            <div className="bg-slate-800 to-slate-600 px-6 py-5 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 border-2 border-white/20">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base leading-tight">Seguridad</p>
                                    <p className="text-white/60 text-xs mt-0.5">Actualiza tu contraseña de acceso</p>
                                </div>
                            </div>

                            {/* Formulario contraseña */}
                            <form onSubmit={cambiarPassword} className="flex flex-col p-5 gap-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cambiar contraseña</p>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña actual</label>
                                    <input type="password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="••••••••" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nueva contraseña</label>
                                    <input type="password" value={passwordNueva} onChange={e => setPasswordNueva(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="••••••••" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Confirmar nueva contraseña</label>
                                    <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="••••••••" required />
                                </div>

                                {successPass && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs">{successPass}</div>}
                                {errorPass && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs">{errorPass}</div>}

                                <button type="submit" disabled={loadingPass}
                                    className="mt-3 w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-slate-800/20 text-sm">
                                    {loadingPass ? 'Cambiando...' : 'Cambiar contraseña'}
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default Configuracion;