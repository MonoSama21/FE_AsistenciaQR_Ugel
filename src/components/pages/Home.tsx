import Cropper from 'react-easy-crop';
import { useCallback } from 'react';
import getCroppedImg from './utils/cropImage';
import React, { useRef } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import Sidebar from "../sections/Sidebar";

interface RegistroCita {
    id: number;
    comentario: string;
    fechaRealizada: string;
    cita: {
        id: number;
        titulo: string;
        descripcion: string;
    } | null;
    fotos: { id: number; url: string }[];
}


interface Cita {
    id: number;
    titulo: string;
    descripcion: string;
    fotos?: string[];
    comentario?: string;
}

const Home = () => {
    const [errorRegistro, setErrorRegistro] = useState("");
    const [guardando, setGuardando] = useState(false);
    const URL_API = import.meta.env.VITE_API_URL;

    const [citas, setCitas] = useState<Cita[]>([]);
    const [pagina, setPagina] = useState(0);
    const [animacion, setAnimacion] = useState<string>("");
    const pageRef = useRef<HTMLDivElement>(null);
    const [modalCita, setModalCita] = useState<Cita | null>(null);
    const [modalEditar, setModalEditar] = useState<{ registroId: number, cita: Cita, comentario: string, fotos: (string | null)[] } | null>(null);
    const [fotos, setFotos] = useState<(File | null)[]>([null, null]);
    const [cropImgs, setCropImgs] = useState<(string | null)[]>([null, null]);
    const [crop, setCrop] = useState<{ x: number; y: number }[]>([{ x: 0, y: 0 }, { x: 0, y: 0 }]);
    const [zoom, setZoom] = useState<number[]>([1, 1]);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any[]>([null, null]);
    const [showCropper, setShowCropper] = useState<number | null>(null);
    const [comentario, setComentario] = useState("");
    const [registros, setRegistros] = useState<RegistroCita[]>([]);
    const [mensajeExito, setMensajeExito] = useState<string>("");

    useEffect(() => {
        obtenerCitas(pagina + 1);
        obtenerRegistros();
        if (animacion) {
            // Quitar la animación después de que termine
            const timeout = setTimeout(() => setAnimacion(""), 600);
            return () => clearTimeout(timeout);
        }
    }, [pagina]);
    // Obtener registros de citas
    // Cargar todos los registros de todas las páginas
    const obtenerRegistros = async () => {
        try {
            const response = await axios.get(
                URL_API + `/registros-citas`,
                {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('authToken')
                    }
                }
            );
            const data = response.data;
            setRegistros(data.registros || []);
        } catch (error) {
            setRegistros([]);
        }
    };

    const obtenerCitas = async (page: number) => {
        try {
            const response = await axios.get(URL_API + `/citas?page=${page}&limit=2`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('authToken')
                }
            });
            setCitas(response.data.data.map((c: any) => ({ ...c, fotos: c.fotos || [], comentario: c.comentario || "" })));
        } catch (error) {
            setCitas([]);
        }
    };

    const citasPorPagina = 2;
    // Ya no se usa totalPaginas ni citasPagina, porque el endpoint devuelve solo los dos registros de la página
    // const totalPaginas = Math.ceil(citas.length / citasPorPagina);
    // const citasPagina = citas.slice(pagina * citasPorPagina, pagina * citasPorPagina + citasPorPagina);
    // Forzar re-render de citas cuando registros cambian
    const [citasVersion, setCitasVersion] = useState(0);
    useEffect(() => {
        setCitasVersion(v => v + 1);
    }, [registros]);

    // Enlaza registros a citas
    const citasPagina = citas.map(cita => {
        const registro = registros.find(r => r.cita && r.cita.id === cita.id);
        if (registro) {
            // Soporta ambos formatos: fotos como array de objetos o strings
            const fotos = Array.isArray(registro.fotos)
                ? registro.fotos.map(f => typeof f === 'string' ? f : f.url)
                : [];
            return {
                ...cita,
                comentario: registro.comentario,
                fotos
            };
        }
        return cita;
    });

    // Modal handlers
    const abrirModal = (cita: Cita) => {
        setModalCita(cita);
        setFotos([null, null]);
        setCropImgs([null, null]); // Limpiar imágenes al abrir modal
        setComentario("Lugar: \nFecha: \nComentario:"); // Placeholder comentario con saltos de línea
    };

    // Modal para editar cita registrada
    const abrirModalEditar = (registro: any, cita: Cita) => {
        setModalEditar({
            registroId: registro.id,
            cita,
            comentario: registro.comentario,
            fotos: registro.fotos.map((f: any) => typeof f === 'string' ? f : f.url)
        });
        setFotos([null, null]);
        setCropImgs(registro.fotos.map((f: any) => typeof f === 'string' ? f : f.url));
        setComentario("");
    };
    const cerrarModal = () => {
        setModalCita(null);
        setFotos([null, null]);
        setComentario("");
    };
    const handleFotoChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFotos(f => f.map((foto, i) => (i === idx ? file : foto)));
            setCropImgs(imgs => imgs.map((img, i) => (i === idx ? URL.createObjectURL(file) : img)));
            setShowCropper(idx);
        }
    };

    const onCropComplete = useCallback((idx: number, croppedArea: any, croppedAreaPixelsVal: any) => {
        setCroppedAreaPixels(prev => prev.map((area, i) => (i === idx ? croppedAreaPixelsVal : area)));
    }, []);

    const handleCropSave = async (idx: number) => {
        if (!cropImgs[idx] || !croppedAreaPixels[idx]) return;
        const croppedImage = await getCroppedImg(cropImgs[idx]!, croppedAreaPixels[idx]);
        // Convertir base64 a File
        const arr = croppedImage.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        for (let i = 0; i < n; ++i) u8arr[i] = bstr.charCodeAt(i);
        const file = new File([u8arr], fotos[idx]?.name || `foto${idx + 1}.jpg`, { type: mime });
        setFotos(f => f.map((foto, i) => (i === idx ? file : foto)));
        setCropImgs(imgs => imgs.map((img, i) => (i === idx ? croppedImage : img)));
        setShowCropper(null);
    };
    const handleRegistrar = async () => {
        if (!modalCita) return;
        if (!fotos[0] || !fotos[1]) {
            setErrorRegistro("Es necesario que agregue las dos fotos.");
            setTimeout(() => setErrorRegistro(""), 2500);
            return;
        }
        setGuardando(true);
        setErrorRegistro("");
        try {
            const formData = new FormData();
            console.log('Registrando citaid:', modalCita.id, 'Título:', modalCita.titulo);
            formData.append('citaid', String(modalCita.id));
            formData.append('comentario', comentario);
            fotos.forEach((foto, idx) => {
                if (foto) {
                    formData.append('fotos', foto);
                    console.log('Foto', idx, foto);
                } else {
                    console.log('Foto', idx, 'no presente');
                }
            });
            // Mostrar el contenido del FormData
            for (let pair of formData.entries()) {
                console.log(pair[0]+ ':', pair[1]);
            }
            await axios.post(
                URL_API + "/registros-citas",
                formData,
                {
                    headers: {
                        // 'Content-Type' se omite para que axios ponga el boundary correcto
                        "Authorization": "Bearer " + localStorage.getItem('authToken')
                    }
                }
            );
            await obtenerRegistros();
            cerrarModal();
            setMensajeExito("¡Cita registrada exitosamente!");
            setTimeout(() => setMensajeExito(""), 2500);
        } catch (error) {
            alert("Error al registrar la cita. Intenta de nuevo.");
        } finally {
            setGuardando(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-100 py-8">
            <Sidebar />
            <div
                ref={pageRef}
                className={`mt-20 relative w-full max-w-7xl  bg-white rounded-[60px] shadow-2xl flex overflow-hidden border-8 border-pink-200 transition-transform duration-700 ease-in-out ${
                    animacion === "adelante"
                        ? "animate-page-flip-next"
                        : animacion === "atras"
                        ? "animate-page-flip-prev"
                        : ""
                }`}
                style={{ boxShadow: '0 16px 64px 0 rgba(255, 192, 203, 0.25)' }}
            >
                {/* Espiral cuaderno */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-center z-10 pl-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-pink-300 my-2 shadow-inner border border-pink-400"></div>
                    ))}
                </div>
                {/* Página izquierda estilo cuaderno */}
                <div className="flex-1 flex flex-col items-start justify-start px-16 py-16 border-r border-pink-200 relative bg-white">
                    {citasPagina[0] ? (
                        <>
                            <div className="w-full flex flex-row items-center justify-between mb-2">
                                <span className="bg-pink-200 text-pink-700 px-3 py-1 rounded-full font-bold text-sm shadow">Cita</span>
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-wide text-center w-full" style={{fontFamily:'cursive'}}>{citasPagina[0].titulo}</h2>
 
                            <div className="flex flex-row items-center justify-center w-full gap-12 mt-6 mb-8">
                                {/* Polaroid 1 */}
                                <div className="relative w-48 h-56 flex flex-col items-center justify-end">
                                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-end">
                                        <div className="w-56 h-56 bg-[#c69c6d] rounded-[24px_24px_48px_48px/24px_24px_72px_72px] border-8 border-[#a67c52] flex items-center justify-center overflow-hidden relative">
                                            {citasPagina[0].fotos && citasPagina[0].fotos[0] ? (
                                                <img src={citasPagina[0].fotos[0]} alt="Foto cita" className="object-cover w-full h-full" />
                                            ) : (
                                                <span className="text-xs text-white text-center">REGISTRA TU FOTO</span>
                                            )}
                                            <span className="absolute bottom-2 right-2">
                                                <svg width="32" height="32" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#e57373"/></svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Polaroid 2 */}
                                <div className="relative w-48 h-56 flex flex-col items-center justify-end">
                                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-end">
                                        <div className="w-56 h-56 bg-black rounded-[24px_24px_48px_48px/24px_24px_72px_72px] border-8 border-gray-700 flex items-center justify-center overflow-hidden relative">
                                            {citasPagina[0].fotos && citasPagina[0].fotos[1] ? (
                                                <img src={citasPagina[0].fotos[1]} alt="Foto cita" className="object-cover w-full h-full" />
                                            ) : (
                                                <span className="text-xs text-white text-center">REGISTRA TU FOTO</span>
                                            )}
                                            <span className="absolute bottom-2 right-2">
                                                <svg width="32" height="32" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#e57373"/></svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full text-left text-2xl text-gray-700 mb-2">¿Cómo nos sentimos?</div>

                            <div className="mb-8 w-full flex justify-center">
                                {citasPagina[0].comentario ? (
                                    <div className="bg-pink-200 text-pink-700 px-4 py-2 rounded-xl max-w-xs w-full" style={{ whiteSpace: 'pre-line', textAlign: 'justify' }}>{citasPagina[0].comentario}</div>
                                ) : (
                                    <div className="bg-black text-white px-4 py-2 rounded-xl text-center max-w-xs w-full">Sin comentario</div>
                                )}
                            </div>
                            <div className="flex gap-4">
                                {(() => {
                                    const registro = registros.find(r => r.cita && r.cita.id === citasPagina[0].id);
                                    if (registro) {
                                        return (
                                            <button onClick={() => abrirModalEditar(registro, citasPagina[0])} className="bg-yellow-500 hover:bg-yellow-600 text-white px-10 py-4 rounded-2xl shadow font-bold text-2xl">Actualizar cita</button>
                                        );
                                    } else {
                                        return (
                                            <button
                                                onClick={() => abrirModal(citasPagina[0])}
                                                className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-4 rounded-2xl shadow font-bold text-2xl"
                                            >
                                                Registrar cita
                                            </button>
                                        );
                                    }
                                })()}
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-400">Sin cita</span>
                    )}
                </div>
                {/* Página derecha estilo cuaderno */}
                <div className="flex-1 flex flex-col items-start justify-start px-16 py-16 relative bg-white">
                    {citasPagina[1] ? (
                        <>
                            <div className="w-full flex flex-row items-center justify-between mb-2">
                                <span className="bg-pink-200 text-pink-700 px-3 py-1 rounded-full font-bold text-sm shadow">Cita</span>
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-wide text-center w-full" style={{fontFamily:'cursive'}}>{citasPagina[1].titulo}</h2>

                            <div className="flex flex-row items-center justify-center w-full gap-12 mt-6 mb-8">
                                {/* Polaroid 1 */}
                                <div className="relative w-48 h-56 flex flex-col items-center justify-end">
                                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-end">
                                        <div className="w-56 h-56 bg-[#c69c6d] rounded-[24px_24px_48px_48px/24px_24px_72px_72px] border-8 border-[#a67c52] flex items-center justify-center overflow-hidden relative">
                                            {citasPagina[1].fotos && citasPagina[1].fotos[0] ? (
                                                <img src={citasPagina[1].fotos[0]} alt="Foto cita" className="object-cover w-full h-full" />
                                            ) : (
                                                <span className="text-xs text-white text-center">REGISTRA TU FOTO</span>
                                            )}
                                            <span className="absolute bottom-2 right-2">
                                                <svg width="32" height="32" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#e57373"/></svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Polaroid 2 */}
                                <div className="relative w-48 h-56 flex flex-col items-center justify-end">
                                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-end">
                                        <div className="w-56 h-56 bg-black rounded-[24px_24px_48px_48px/24px_24px_72px_72px] border-8 border-gray-700 flex items-center justify-center overflow-hidden relative">
                                            {citasPagina[1].fotos && citasPagina[1].fotos[1] ? (
                                                <img src={citasPagina[1].fotos[1]} alt="Foto cita" className="object-cover w-full h-full" />
                                            ) : (
                                                <span className="text-xs text-white text-center">REGISTRA TU FOTO</span>
                                            )}
                                            <span className="absolute bottom-2 right-2">
                                                <svg width="32" height="32" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#e57373"/></svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full text-left text-2xl text-gray-700 mb-2">¿Cómo nos sentimos?</div>
 
                            <div className="mb-8 w-full flex justify-center">
                                {citasPagina[1].comentario ? (
                                    <div className="bg-pink-200 text-pink-700 px-4 py-2 rounded-xl max-w-xs w-full" style={{ whiteSpace: 'pre-line', textAlign: 'justify' }}>{citasPagina[1].comentario}</div>
                                ) : (
                                    <div className="bg-black text-white px-4 py-2 rounded-xl text-center max-w-xs w-full">Sin comentario</div>
                                )}
                            </div>
                            <div className="flex gap-4">
                                {(() => {
                                    const registro = registros.find(r => r.cita && r.cita.id === citasPagina[1].id);
                                    if (registro) {
                                        return (
                                            <button onClick={() => abrirModalEditar(registro, citasPagina[1])} className="bg-yellow-500 hover:bg-yellow-600 text-white px-10 py-4 rounded-2xl shadow font-bold text-2xl">Actualizar cita</button>
                                        );
                                    } else {
                                        return (
                                            <button
                                                onClick={() => abrirModal(citasPagina[1])}
                                                className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-4 rounded-2xl shadow font-bold text-2xl"
                                            >
                                                Registrar cita
                                            </button>
                                        );
                                    }
                                })()}
                            </div>
                                    {/* Modal para editar cita */}
                                    {modalEditar && (
                                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                            <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
                                                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setModalEditar(null)}>&times;</button>
                                                <h2 className="text-xl font-bold text-yellow-600 mb-4 text-center">Actualizar cita: {modalEditar.cita.titulo}</h2>
                                                <div className="flex space-x-4 mb-4">
                                                    {[0, 1].map(idx => (
                                                        <div key={idx} className="w-24 h-24 bg-pink-100 border-2 border-pink-300 rounded-xl flex flex-col items-center justify-center overflow-hidden relative">
                                                            {/* Solo mostrar imagen si el usuario seleccionó una foto */}
                                                            {cropImgs[idx]
                                                                ? <>
                                                                    <img src={cropImgs[idx]!} alt="Foto subida" className="object-cover w-full h-full" />
                                                                    <button type="button" className="absolute top-1 right-1 bg-pink-500 text-white rounded px-2 py-1 text-xs" onClick={() => setShowCropper(idx)}>Ajustar</button>
                                                                </>
                                                                : null
                                                            }
                                                            <input type="file" accept="image/*" className="absolute opacity-0 w-full h-full cursor-pointer" onChange={e => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    setFotos(f => f.map((foto, i) => (i === idx ? e.target.files![0] : foto)));
                                                                    setCropImgs(imgs => imgs.map((img, i) => (i === idx ? URL.createObjectURL(e.target.files![0]) : img)));
                                                                    setShowCropper(idx);
                                                                }
                                                            }} />
                                                                                                       {/* Modal de cropper también en edición */}
                                                                                                            {showCropper !== null && cropImgs[showCropper] && (
                                                                                                                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                                                                                                                    <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg relative flex flex-col items-center">
                                                                                                                        <h2 className="text-lg font-bold mb-4">Ajustar foto</h2>
                                                                                                                        <div className="relative w-80 h-80 bg-gray-200">
                                                                                                                            <Cropper
                                                                                                                                image={cropImgs[showCropper]!}
                                                                                                                                crop={crop[showCropper]}
                                                                                                                                zoom={zoom[showCropper]}
                                                                                                                                aspect={1}
                                                                                                                                onCropChange={c => setCrop(prev => prev.map((v, i) => i === showCropper ? c : v))}
                                                                                                                                onZoomChange={z => setZoom(prev => prev.map((v, i) => i === showCropper ? z : v))}
                                                                                                                                onCropComplete={(croppedArea, croppedAreaPixelsVal) => onCropComplete(showCropper, croppedArea, croppedAreaPixelsVal)}
                                                                                                                            />
                                                                                                                        </div>
                                                                                                                        <div className="flex gap-4 mt-4">
                                                                                                                            <label className="flex items-center gap-2">
                                                                                                                                Zoom
                                                                                                                                <input type="range" min={1} max={3} step={0.01} value={zoom[showCropper]} onChange={e => setZoom(prev => prev.map((v, i) => i === showCropper ? Number(e.target.value) : v))} />
                                                                                                                            </label>
                                                                                                                        </div>
                                                                                                                        <div className="flex gap-4 mt-6">
                                                                                                                            <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={() => handleCropSave(showCropper!)}>Guardar ajuste</button>
                                                                                                                            <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowCropper(null)}>Cancelar</button>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            )}    
                                                            {/* No mostrar texto ni imagen por default */}
                                                        </div>
                                                    ))}
                                                </div>
                                                <textarea
                                                    className="w-full border border-yellow-300 rounded-xl p-2 mb-4 resize-none"
                                                    rows={3}
                                                    placeholder="Comentario de la cita..."
                                                    value={comentario || modalEditar.comentario}
                                                    onChange={e => setComentario(e.target.value)}
                                                />
                                                <button onClick={async () => {
                                                    // PATCH para actualizar registro
                                                    try {
                                                        const formData = new FormData();
                                                        if (comentario) formData.append('comentario', comentario);
                                                        // Solo enviar las fotos nuevas seleccionadas
                                                        fotos.forEach((foto, idx) => {
                                                            if (foto) formData.append('fotos', foto);
                                                        });
                                                        await axios.patch(
                                                            `${URL_API}/registros-citas/${modalEditar.registroId}`,
                                                            formData,
                                                            {
                                                                headers: {
                                                                    // 'Content-Type' se omite para que axios ponga el boundary correcto
                                                                    "Authorization": "Bearer " + localStorage.getItem('authToken')
                                                                }
                                                            }
                                                        );
                                                        await obtenerRegistros();
                                                        setModalEditar(null);
                                                        setMensajeExito("¡Cita actualizada exitosamente!");
                                                        setTimeout(() => setMensajeExito(""), 2500);
                                                    } catch (error) {
                                                        alert("Error al actualizar la cita. Intenta de nuevo.");
                                                    }
                                                }} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl shadow font-bold">Guardar cambios</button>
                                            </div>
                                        </div>
                                    )}
                        </>
                    ) : (
                        <span className="text-gray-400">Sin cita</span>
                    )}
                </div>
                {/* Navegación */}
                <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-pink-200 hover:bg-pink-300 text-pink-600 rounded-full w-10 h-10 flex items-center justify-center shadow-md z-20"
                    onClick={() => {
                        setAnimacion("atras");
                        setTimeout(() => setPagina((prev) => Math.max(prev - 1, 0)), 100);
                    }}
                    disabled={pagina === 0}
                >
                    &#8592;
                </button>
                <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-200 hover:bg-pink-300 text-pink-600 rounded-full w-10 h-10 flex items-center justify-center shadow-md z-20"
                    onClick={() => {
                        setAnimacion("adelante");
                        setTimeout(() => setPagina((prev) => prev + 1), 100);
                    }}
                    disabled={citas.length < 2}
                >
                    &#8594;
                </button>
                {/* Indicador de página */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-pink-400 text-sm">
                    Página {pagina + 1}
                </div>
            </div>


            {/* Modal para registrar cita */}
            {modalCita && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={cerrarModal}>&times;</button>
                        <h2 className="text-xl font-bold text-pink-600 mb-4 text-center">Registrar cita: {modalCita.titulo}</h2>
                        <div className="flex space-x-4 mb-4">
                            {[0, 1].map(idx => (
                                <div key={idx} className="w-24 h-24 bg-pink-100 border-2 border-pink-300 rounded-xl flex flex-col items-center justify-center overflow-hidden relative">
                                    {cropImgs[idx] ? (
                                        <>
                                            <img src={cropImgs[idx]!} alt="Foto subida" className="object-cover w-full h-full" />
                                            <button type="button" className="absolute top-1 right-1 bg-pink-500 text-white rounded px-2 py-1 text-xs" onClick={() => setShowCropper(idx)}>Ajustar</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs text-pink-400 text-center mb-1">REGISTRA TU FOTO</span>
                                            <input type="file" accept="image/*" className="absolute opacity-0 w-full h-full cursor-pointer" onChange={e => handleFotoChange(idx, e)} />
                                            <span className="text-xs text-gray-400 absolute bottom-2 left-1/2 -translate-x-1/2">Subir</span>
                                        </>
                                    )}
                                            {/* Modal de cropper */}
                                            {showCropper !== null && (
                                                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                                                    <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg relative flex flex-col items-center">
                                                        <h2 className="text-lg font-bold mb-4">Ajustar foto</h2>
                                                        <div className="relative w-80 h-80 bg-gray-200">
                                                            <Cropper
                                                                image={cropImgs[showCropper]!}
                                                                crop={crop[showCropper]}
                                                                zoom={zoom[showCropper]}
                                                                aspect={1}
                                                                onCropChange={c => setCrop(prev => prev.map((v, i) => i === showCropper ? c : v))}
                                                                onZoomChange={z => setZoom(prev => prev.map((v, i) => i === showCropper ? z : v))}
                                                                onCropComplete={(croppedArea, croppedAreaPixelsVal) => onCropComplete(showCropper, croppedArea, croppedAreaPixelsVal)}
                                                            />
                                                        </div>
                                                        <div className="flex gap-4 mt-4">
                                                            <label className="flex items-center gap-2">
                                                                Zoom
                                                                <input type="range" min={1} max={3} step={0.01} value={zoom[showCropper]} onChange={e => setZoom(prev => prev.map((v, i) => i === showCropper ? Number(e.target.value) : v))} />
                                                            </label>
                                                        </div>
                                                        <div className="flex gap-4 mt-6">
                                                            <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={() => handleCropSave(showCropper!)}>Guardar ajuste</button>
                                                            <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowCropper(null)}>Cancelar</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                </div>
                            ))}
                        </div>
                        <textarea
                            className="w-full border border-pink-300 rounded-xl p-2 mb-4 resize-none"
                            rows={3}
                            placeholder="Comentario de la cita..."
                            value={comentario}
                            onChange={e => setComentario(e.target.value)}
                        />
                        {errorRegistro && (
                            <div className="w-full text-center text-red-500 font-bold mb-2">{errorRegistro}</div>
                        )}
                        <button
                            onClick={handleRegistrar}
                            className={`w-full px-6 py-2 rounded-xl shadow font-bold ${guardando ? 'bg-pink-300 text-white cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 text-white'}`}
                            disabled={guardando}
                        >
                            {guardando ? 'Guardando registro...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Mensaje de éxito visual */}
            {mensajeExito && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-lg z-50 text-xl font-bold animate-bounce">
                    {mensajeExito}
                </div>
            )}
       

            {/* Animaciones de página */}
            <style>{`
                @keyframes page-flip-next {
                    0% { transform: rotateY(0deg) scale(1); }
                    40% { transform: rotateY(-40deg) scale(0.98); }
                    100% { transform: rotateY(0deg) scale(1); }
                }
                @keyframes page-flip-prev {
                    0% { transform: rotateY(0deg) scale(1); }
                    40% { transform: rotateY(40deg) scale(0.98); }
                    100% { transform: rotateY(0deg) scale(1); }
                }
                .animate-page-flip-next {
                    animation: page-flip-next 0.7s cubic-bezier(.4,2,.6,1) both;
                }
                .animate-page-flip-prev {
                    animation: page-flip-prev 0.7s cubic-bezier(.4,2,.6,1) both;
                }
            `}</style>

        </div>
    );
};

export default Home;


