import React from "react";
import Sidebar from "../sections/Sidebar";
import Header from "../sections/Header";

const Home = () => {
    const userName = localStorage.getItem("userName") || "Usuario";
    const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            {/* Contenido principal */}
            <main className="md:ml-64 pt-16">
                <div className="p-6 md:p-10">

                    {/* Tarjeta principal */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Encabezado de bienvenida */}
                        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-10 text-white text-center">
                            <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide drop-shadow mb-3" id="welcome-title">
                                BIENVENIDO {displayName.toUpperCase()} — SIAQR UGEL CHINCHA
                            </h1>
                            <p className="text-blue-200 text-base md:text-lg font-medium" id="system-description">
                                Controle las entradas y salidas de los trabajadores
                            </p>
                        </div>

                        {/* Foto de la UGEL */}
                        <div className="p-6 md:p-8">
                            <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 object-cover" style={{ height: '550px' }}>
                                <img
                                    src="https://res.cloudinary.com/dvrsdqsl1/image/upload/v1772813163/fondo_c5fpdp.jpg"
                                    alt="Foto de la UGEL Chincha"
                                    className="w-full h-full object-cover object-[center_90%]"
                                    
                                />
                                {/* Overlay con texto si no carga la imagen */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 peer-error:opacity-100" id="fondo-ugel-home">
                                    <svg className="w-16 h-16 text-blue-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-blue-400 font-semibold text-lg">FOTO DE LA UGEL</span>
                                </div>
                            </div>
                        </div>

            
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;



