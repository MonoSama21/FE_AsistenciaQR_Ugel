import React, { useEffect, useState } from "react";
import Sidebar from "../sections/Sidebar";
import Header from "../sections/Header";
import axios from "axios";


const Asistencia = () => {
    const URL_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken') || '';

    
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            <main className="md:ml-64 pt-16">
                <h1>Hola soy la asitencia</h1>
            </main>
            
        </div>
    );
}

export default Asistencia;

