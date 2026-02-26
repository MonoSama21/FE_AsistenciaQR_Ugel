import React, { useEffect, useState } from "react";
import Sidebar from "../sections/Sidebar";
import axios from "axios";

const Configuracion = () => {


    return (
        <div> 

        
            <Sidebar />

            {/* AVISO DE DESARROLLO */}
            <div className="w-full flex justify-center items-center mt-50">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-xl shadow-lg text-lg font-semibold animate-pulse">
                    ⚠️ Este módulo está en desarrollo. Próximamente podrás cambiar tu información de usuario aquí.
                </div>
            </div>
        </div>
           
    );
}

export default Configuracion;