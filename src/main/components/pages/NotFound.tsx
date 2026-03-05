import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center  bg-white">
            <div className="text-center px-6">
                <div className="mb-8">
                    <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-blue-800">
                        404
                    </h1>
                    <div className="mt-4">
                        <svg className="mx-auto w-32 h-32 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                
                <h2 className="text-3xl font-bold text-black mb-4">
                    Página no encontrada
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Lo sentimos, la página que estás buscando no existe o ha sido movida.
                </p>

                
            </div>
        </div>
    );
};

export default NotFound;
