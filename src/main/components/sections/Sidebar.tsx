import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";


interface Configuracion {
    id?: number;
    nombre?: string;
    logo_url?: string;
    descripcion?: string;
    direccion?: string; 
    telefono?: string;
}

interface SidebarOption {
    to?: string;
    label: string;
    icon: React.ReactNode;
    subMenus?: { to: string; label: string }[];
}

const Sidebar = () => {
    const [configuracion, setConfiguracion] = React.useState<Configuracion>({});

    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Eliminar datos de autenticación
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        
        // Redirigir al login
        navigate('/login');
    };

    const optionsSidebar: SidebarOption[] = [
        {
            to: "/dashboard/home",
            label: "Home",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            to: "/dashboard/usuarios",
            label: "Usuarios",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            to: "/dashboard/personal",
            label: "Personal",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            to: "/dashboard/asistencia",
            label: "Asistencia",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            )
        },
        {
            to: "/dashboard/reporte-asistencia",
            label: "Reporte Asistencia",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
    ];
    
    
    return (
    <>
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden md:flex w-64 min-h-screen flex-col fixed left-0 top-0 z-40 bg-gradient-to-b from-blue-950 to-blue-900 shadow-2xl" id="sidebar-menu">

            {/* Header */}
            <div className="flex flex-col items-center py-8 px-4 border-b border-white/10" data-testid="sidebar-header">
                <div className="bg-white rounded-2xl p-2 shadow-lg mb-3">
                    <img
                        id="logo-institucional"
                        data-testid="institutional-logo"
                        src="https://res.cloudinary.com/dvrsdqsl1/image/upload/v1772813164/logoGP_c0bsos.png"
                        alt="Logo"
                        className="w-14 h-14 object-contain"
                    />
                </div>
                <h2 id="titulo-siaqr" data-testid="sidebar-title" className="text-white font-extrabold text-base text-center leading-tight tracking-wide">SIAQR</h2>
                <p data-testid="sidebar-subtitle" className="text-blue-300 text-xs font-medium text-center mt-0.5">UGEL CHINCHA</p>
            </div>

            {/* Navegación */}
            <nav className="flex-1 py-5 px-3 overflow-y-auto custom-scrollbar">
                <p className="text-blue-400/60 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Menú Principal</p>
                <ul className="space-y-1">
                    {optionsSidebar.map((option, index) => {
                        const menuId = option.label.toLowerCase().replace(/\s+/g, '-');
                        return (
                            <li key={index}>
                                <Link
                                    to={option.to!}
                                    id={`menu-${menuId}`}
                                    data-testid={`menu-${menuId}`}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                        location.pathname === option.to
                                            ? 'bg-white text-blue-900 shadow-lg font-bold'
                                            : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {/* Indicador activo */}
                                    {location.pathname === option.to && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full"></span>
                                    )}
                                    <span className={`p-1.5 rounded-lg transition-all ${
                                        location.pathname === option.to
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-white/10 text-blue-200 group-hover:bg-white/20'
                                    }`}>
                                        {option.icon}
                                    </span>
                                    <span className="text-sm font-semibold">{option.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer - usuario y logout */}
            <div className="p-4 border-t border-white/10">

                <button
                    id="btn-cerrar-sesion"
                    data-testid="logout-button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl transition-all duration-200 font-semibold text-sm border border-red-500/30 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/30"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        </aside>

        {/* NAVIGATION BAR MÓVIL */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-blue-950 border-t border-white/10 z-50 shadow-2xl" id="mobile-navbar" data-testid="mobile-navbar">
            <div className="flex justify-around items-center px-1 py-2">
                {optionsSidebar.map((option, index) => {
                    const menuId = option.label.toLowerCase().replace(/\s+/g, '-');
                    return (
                        <Link
                            key={index}
                            to={option.to!}
                            id={`mobile-menu-${menuId}`}
                            data-testid={`mobile-menu-${menuId}`}
                            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 min-w-[52px] ${
                                location.pathname === option.to
                                    ? 'bg-blue-600 text-white'
                                    : 'text-blue-300 hover:text-white'
                            }`}
                        >
                            {option.icon}
                            <span className="text-[9px] font-semibold leading-tight text-center">{option.label}</span>
                        </Link>
                    );
                })}
                <button
                    id="mobile-btn-cerrar-sesion"
                    data-testid="mobile-logout-button"
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl text-red-400 hover:text-red-300 transition-all duration-200 min-w-[52px]"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-[9px] font-semibold">Salir</span>
                </button>
            </div>
        </nav>

        {/* Estilos para scrollbar personalizado */}
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
        `}</style>
    </>
    );
}

export default Sidebar;