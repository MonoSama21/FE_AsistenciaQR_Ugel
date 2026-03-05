import React from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail") || "";
    const userName = localStorage.getItem("userName") || "";
    const userRol = localStorage.getItem("userRol") || "";
    const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

    return (
        <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white border-b border-gray-100 shadow-sm z-30 flex items-center justify-between px-4 md:px-8" id="header-dashboard">
            {/* Lado izquierdo - título de página (opcional) */}
            <div className="hidden md:flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-700 rounded-full"></div>
                <span className="text-gray-500 text-sm font-medium">Sistema de Control de Asistencia - SIAQR UGEL</span>
            </div>

            {/* Mobile - logo/nombre del sistema */}
            <div className="flex md:hidden items-center gap-2">
                <img src="../public/logoGP.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="text-blue-900 font-bold text-sm">SIAQR UGEL</span>
            </div>

            {/* Lado derecho - usuario y configuración */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto">

                {/* Botón configuración */}
                <button
                    onClick={() => navigate("/dashboard/configuracion")}
                    title="Configuración"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="hidden md:inline">Configuración</span>
                </button>

                {/* Divider */}
                <div className="hidden md:block w-px h-6 bg-gray-200"></div>

                {/* Usuario */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-white text-sm font-bold">
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-blue-900 text-sm font-semibold leading-tight">{userName}</p>
                        <p className="text-blue-400 text-[10px] leading-tight truncate max-w-[150px]">{userRol}</p>
                        <p className="text-blue-400 text-[10px] leading-tight truncate max-w-[150px]">{userEmail}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
