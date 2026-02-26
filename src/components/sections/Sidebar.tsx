import React, { use, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// Si no tienes estos tipos, agrégalos así:
type Configuracion = {
  logo_url?: string;
  restaurante_nombre?: string;
};

type SidebarOption = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

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
            to: "/dashboard/configuracion",
            label: "Configuración",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
    ];
    
    

    return (
    <>
        {/* NAVBAR DESKTOP - Horizontal */}
        <nav className="hidden md:flex w-full h-20 bg-red-400  shadow-2xl fixed top-0 left-0 right-0 text-white z-40 border-b border-red-500 items-center px-8">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-4 mr-8">
                <img 
                    src="../../src/assets/img/logo.jpeg"
                    alt="Logo" 
                    className="w-12 h-12 object-contain rounded-xl border-2 border-red-500 shadow-lg bg-white p-1" 
                />
                <div>
                    <p className="text-lg text-white font-medium">App - Recuerdos Maravillosos</p>
                </div>
            </div>
            {/* Opciones de navegación */}
            <ul className="flex-1 flex items-center space-x-2">
                {optionsSidebar.map((option, index) => (
                    <li key={index} className="relative">
                        <Link
                            to={option.to!}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 group ${
                                location.pathname === option.to
                                    ? 'bg-red-500 from-red-600 to-purple-600 text-white shadow-lg shadow-red-500/50'
                                    : 'text-slate-200 hover:bg-red-700/50 hover:text-white'
                            }`}
                        >
                            <span className={`p-2 rounded-lg transition-all ${
                                location.pathname === option.to 
                                    ? 'bg-white/20' 
                                    : 'bg-red-500 from-red-500 to-red-600 group-hover:scale-110'
                            }`}>
                                {option.icon}
                            </span>
                            <span className="font-semibold">{option.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            {/* Botón de regresar a Home */}
            <button
                onClick={() => navigate('/dashboard/home')}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-red-500 border border-red-400 rounded-xl transition-all duration-200 font-bold shadow hover:bg-red-100 ml-4 mr-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Ir a Home</span>
            </button>
            <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-700 from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-105 ml-0"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
            </button>
        </nav>

        

        {/* Estilos para scrollbar personalizado */}
        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(30, 41, 59, 0.3);
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(59, 130, 246, 0.5);
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(59, 130, 246, 0.7);
            }
        `}</style>
    </>
    );
}

export default Sidebar;