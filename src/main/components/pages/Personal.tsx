import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../sections/Sidebar";
import Header from "../sections/Header";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Cargo {
    id: number;
    cargo: string;
    descripcion: string;
    estado: boolean;
    createdat: string;
    updatedat: string;
}

interface Distrito {
    id: number;
    alias: string;
    distrito: string;
    estado: boolean;
    createdat: string;
    updatedat: string;
}

interface InstitucionEducativa {
    id: number;
    codigoModular: string;
    nombreIE: string;
    nivelModalidad: string;
    distritoId?: number;
    distrito?: Distrito;
}

interface DistritoSimple {
    id: number;
    distrito: string;
    alias: string;
}

interface Personal {
    id?: number;
    dni?: string;
    nombres?: string;
    apellidos?: string;
    cargoId?: number;
    distritoId?: number;
    nivelModalidad?: string;
    institucionEducativaId?: number;
    codigoQR?: string;
    estado?: boolean;
    cargo?: Cargo;
    distrito?: DistritoSimple;
    institucionEducativa?: InstitucionEducativa;
    foto?: string;
}

const Personal = () => {
    const URL_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken') || '';

    const [personal, setPersonal] = useState<Personal[]>([]);
    const [loading, setLoading] = useState(true);
    const [buscar, setBuscar] = useState('');
    const [pagina, setPagina] = useState(1);
    const [limite, setLimite] = useState(10);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);

    // Modal nuevo personal
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ 
        dni: '', 
        nombres: '', 
        apellidos: '', 
        cargoId: '', 
        distritoId: '',
        nivelModalidad: '',
        institucionEducativaId: ''
    });
    const [loadingCrear, setLoadingCrear] = useState(false);
    const [errorCrear, setErrorCrear] = useState<string | null>(null);
    const [successCrear, setSuccessCrear] = useState<string | null>(null);
    
    // Cargos disponibles
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [loadingCargos, setLoadingCargos] = useState(false);
    const [buscarCargo, setBuscarCargo] = useState('');
    const [mostrarDropdownCargo, setMostrarDropdownCargo] = useState(false);
    const [cargoSeleccionado, setCargoSeleccionado] = useState<Cargo | null>(null);

    // Distritos disponibles
    const [distritos, setDistritos] = useState<Distrito[]>([]);
    const [loadingDistritos, setLoadingDistritos] = useState(false);
    const [buscarDistrito, setBuscarDistrito] = useState('');
    const [mostrarDropdownDistrito, setMostrarDropdownDistrito] = useState(false);
    const [distritoSeleccionado, setDistritoSeleccionado] = useState<Distrito | null>(null);

    // Instituciones educativas disponibles
    const [instituciones, setInstituciones] = useState<InstitucionEducativa[]>([]);
    const [loadingInstituciones, setLoadingInstituciones] = useState(false);
    const [buscarInstitucion, setBuscarInstitucion] = useState('');
    const [mostrarDropdownInstitucion, setMostrarDropdownInstitucion] = useState(false);
    const [institucionSeleccionada, setInstitucionSeleccionada] = useState<InstitucionEducativa | null>(null);

    // Distrito precargado desde institución
    const [distritoPrecargado, setDistritoPrecargado] = useState<Distrito | null>(null);

    const nivelModalidadOpciones = ['INICIAL-JARDIN', 'PRIMARIA', 'SECUNDARIA', 'EBA-CEPTPRO'];

    // Modal subir foto
    const [modalFoto, setModalFoto] = useState(false);
    const [personalSeleccionado, setPersonalSeleccionado] = useState<Personal | null>(null);
    const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);
    const [loadingFoto, setLoadingFoto] = useState(false);
    const [errorFoto, setErrorFoto] = useState<string | null>(null);
    const [successFoto, setSuccessFoto] = useState<string | null>(null);

    // Modal carné
    const [modalCarne, setModalCarne] = useState(false);
    const [personalCarne, setPersonalCarne] = useState<Personal | null>(null);
    const [loadingCarne, setLoadingCarne] = useState(false);
    const [errorCarne, setErrorCarne] = useState<string | null>(null);
    const [descargandoPDF, setDescargandoPDF] = useState(false);
    const [generandoMasivo, setGenerandoMasivo] = useState(false);
    const [progresoMasivo, setProgresoMasivo] = useState({ actual: 0, total: 0 });

    // Modal ver detalles
    const [modalVer, setModalVer] = useState(false);
    const [personalDetalles, setPersonalDetalles] = useState<Personal | null>(null);
    const [loadingDetalles, setLoadingDetalles] = useState(false);
    const [errorDetalles, setErrorDetalles] = useState<string | null>(null);
    const carneRef = useRef<HTMLDivElement>(null);

    // Selección múltiple para descarga masiva
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [seleccionarTodos, setSeleccionarTodos] = useState(false);

    useEffect(() => {
        obtenerPersonal(pagina, limite);
    }, [pagina, limite]);

    // Cerrar dropdowns al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.dropdown-cargo-container')) {
                setMostrarDropdownCargo(false);
            }
            if (!target.closest('.dropdown-distrito-container')) {
                setMostrarDropdownDistrito(false);
            }
            if (!target.closest('.dropdown-institucion-container')) {
                setMostrarDropdownInstitucion(false);
            }
        };
        
        if (mostrarDropdownCargo || mostrarDropdownDistrito || mostrarDropdownInstitucion) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [mostrarDropdownCargo, mostrarDropdownDistrito, mostrarDropdownInstitucion]);

    const obtenerPersonal = async (pag: number, lim: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL_API}/personal?pagina=${pag}&limite=${lim}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.personal || [];
            const totalRegs = response.data?.total || 0;
            const totalPags = totalRegs > 0 ? Math.ceil(totalRegs / lim) : 1;
            setPersonal(Array.isArray(data) ? data : []);
            setTotalPaginas(totalPags);
            setTotalRegistros(totalRegs);
        } catch (error) {
            console.error('Error al obtener personal:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLimiteChange = (nuevoLimite: number) => {
        setLimite(nuevoLimite);
        setPagina(1);
    };

    const obtenerCargos = async () => {
        setLoadingCargos(true);
        try {
            const response = await axios.get(`${URL_API}/cargos?estado=true`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.cargos || response.data || [];
            setCargos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener cargos:', error);
        } finally {
            setLoadingCargos(false);
        }
    };

    const obtenerDistritos = async () => {
        setLoadingDistritos(true);
        try {
            const response = await axios.get(`${URL_API}/distritos?estado=true`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.distritos || response.data || [];
            setDistritos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener distritos:', error);
        } finally {
            setLoadingDistritos(false);
        }
    };

    const obtenerInstitucionesEducativas = async (nivelModalidad: string) => {
        if (!nivelModalidad) {
            setInstituciones([]);
            return;
        }
        setLoadingInstituciones(true);
        try {
            const response = await axios.get(`${URL_API}/institucioneseducativas?nivelModalidad=${nivelModalidad}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.instituciones || response.data || [];
            setInstituciones(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener instituciones educativas:', error);
            setInstituciones([]);
        } finally {
            setLoadingInstituciones(false);
        }
    };

    const abrirModal = () => {
        setForm({ dni: '', nombres: '', apellidos: '', cargoId: '', distritoId: '', nivelModalidad: '', institucionEducativaId: '' });
        setErrorCrear(null);
        setSuccessCrear(null);
        setBuscarCargo('');
        setCargoSeleccionado(null);
        setBuscarDistrito('');
        setDistritoSeleccionado(null);
        setBuscarInstitucion('');
        setInstitucionSeleccionada(null);
        setInstituciones([]);
        setDistritoPrecargado(null);
        setModalOpen(true);
        obtenerCargos();
        obtenerDistritos();
    };

    const seleccionarCargo = (cargo: Cargo) => {
        setCargoSeleccionado(cargo);
        setForm({ ...form, cargoId: cargo.id.toString() });
        setBuscarCargo(cargo.cargo);
        setMostrarDropdownCargo(false);
    };

    const seleccionarDistrito = (distrito: Distrito) => {
        setDistritoSeleccionado(distrito);
        setForm({ ...form, distritoId: distrito.id.toString() });
        setBuscarDistrito(distrito.alias);
        setMostrarDropdownDistrito(false);
    };

    const seleccionarNivelModalidad = (nivel: string) => {
        setForm({ ...form, nivelModalidad: nivel, institucionEducativaId: '', distritoId: '' });
        setInstitucionSeleccionada(null);
        setDistritoPrecargado(null);
        setBuscarInstitucion('');
        setBuscarDistrito('');
        setDistritoSeleccionado(null);
        setMostrarDropdownInstitucion(false);
        obtenerInstitucionesEducativas(nivel);
    };

    const seleccionarInstitucion = (institucion: InstitucionEducativa) => {
        setInstitucionSeleccionada(institucion);
        setForm({ ...form, institucionEducativaId: institucion.id.toString(), distritoId: '' });
        setBuscarInstitucion(institucion.nombreIE);
        setMostrarDropdownInstitucion(false);
        
        // Precargar el distrito de la institución usando distritoId
        if (institucion.distrito) {
            // Si viene el objeto distrito completo en la respuesta
            setDistritoPrecargado(institucion.distrito);
            setForm(prev => ({ ...prev, distritoId: institucion.distrito!.id.toString() }));
            setDistritoSeleccionado(institucion.distrito);
            setBuscarDistrito(institucion.distrito.alias);
        } else if (institucion.distritoId) {
            // Si no viene, buscar en la lista local usando distritoId
            const distritoEncontrado = distritos.find(d => d.id === institucion.distritoId);
            if (distritoEncontrado) {
                setDistritoPrecargado(distritoEncontrado);
                setForm(prev => ({ ...prev, distritoId: distritoEncontrado.id.toString() }));
                setDistritoSeleccionado(distritoEncontrado);
                setBuscarDistrito(distritoEncontrado.alias);
            }
        }
    };

    const cargosFiltrados = cargos.filter(c =>
        c.cargo.toLowerCase().includes(buscarCargo.toLowerCase())
    );

    const distritosFiltrados = distritos.filter(d =>
        d.alias.toLowerCase().includes(buscarDistrito.toLowerCase())
    );

    const crearPersonal = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingCrear(true);
        setErrorCrear(null);
        setSuccessCrear(null);
        try {
            const personalData: any = {
                dni: form.dni,
                nombres: form.nombres,
                apellidos: form.apellidos,
                cargoId: parseInt(form.cargoId)
            };

            // Agregar campos opcionales si están completados
            if (form.distritoId) {
                personalData.distritoId = parseInt(form.distritoId);
            }
            if (form.nivelModalidad) {
                personalData.nivelModalidad = form.nivelModalidad;
            }
            if (form.institucionEducativaId) {
                personalData.institucionEducativaId = parseInt(form.institucionEducativaId);
            }

            await axios.post(`${URL_API}/personal`, personalData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            setSuccessCrear('Personal registrado correctamente.');
            setTimeout(() => {
                setModalOpen(false);
                obtenerPersonal(pagina, limite);
            }, 1200);
        } catch (error: any) {
            setErrorCrear(error.response?.data?.message || 'Error al registrar personal.');
        } finally {
            setLoadingCrear(false);
        }
    };

    const abrirModalFoto = (p: Personal) => {
        setPersonalSeleccionado(p);
        setArchivoFoto(null);
        setPreviewFoto(null);
        setErrorFoto(null);
        setSuccessFoto(null);
        setModalFoto(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setErrorFoto('Por favor seleccione una imagen válida');
                return;
            }
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrorFoto('La imagen no debe superar los 5MB');
                return;
            }
            setArchivoFoto(file);
            setErrorFoto(null);
            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewFoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const subirFoto = async () => {
        if (!archivoFoto || !personalSeleccionado?.id) {
            setErrorFoto('Por favor seleccione una foto');
            return;
        }

        setLoadingFoto(true);
        setErrorFoto(null);
        setSuccessFoto(null);

        try {
            const formData = new FormData();
            formData.append('foto', archivoFoto);

            await axios.post(`${URL_API}/personal/${personalSeleccionado.id}/foto`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccessFoto('Foto subida correctamente');
            setTimeout(() => {
                setModalFoto(false);
                obtenerPersonal(pagina, limite);
            }, 1200);
        } catch (error: any) {
            setErrorFoto(error.response?.data?.message || 'Error al subir la foto');
        } finally {
            setLoadingFoto(false);
        }
    };

    const abrirModalDetalles = async (p: Personal) => {
        if (!p.id) return;

        setModalVer(true);
        setLoadingDetalles(true);
        setErrorDetalles(null);
        setPersonalDetalles(null);

        try {
            const response = await axios.get(`${URL_API}/personal/${p.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.personal || response.data;
            setPersonalDetalles(data);
        } catch (error: any) {
            console.error('Error al obtener detalles del personal:', error);
            setErrorDetalles(error.response?.data?.message || 'Error al cargar los detalles del personal.');
        } finally {
            setLoadingDetalles(false);
        }
    };

    const abrirModalCarne = async (p: Personal) => {
        if (!p.id) return;
        
        setModalCarne(true);
        setLoadingCarne(true);
        setErrorCarne(null);
        setPersonalCarne(null);

        try {
            const response = await axios.get(`${URL_API}/personal/${p.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.personal || response.data;
            setPersonalCarne(data);
        } catch (error: any) {
            setErrorCarne(error.response?.data?.message || 'Error al cargar datos del personal');
        } finally {
            setLoadingCarne(false);
        }
    };

    // Función auxiliar para convertir imagen a data URL
    const convertirImagenADataURL = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    try {
                        const dataURL = canvas.toDataURL('image/png');
                        resolve(dataURL);
                    } catch (error) {
                        // Si falla CORS, devolvemos la URL original
                        resolve(url);
                    }
                } else {
                    resolve(url);
                }
            };
            img.onerror = () => resolve(url);
            img.src = url;
        });
    };

    // Construye el DOM de un carné individual para html2canvas
    const construirDomCarne = async (p: Personal): Promise<HTMLDivElement> => {
        const logoDataURL = await convertirImagenADataURL('/logoGP.png');
        const fotoDataURL = p.foto ? await convertirImagenADataURL(p.foto) : '';
        const qrDataURL   = p.codigoQR ? await convertirImagenADataURL(p.codigoQR) : '';

        const el = document.createElement('div');
        el.style.cssText = 'width:300px;height:475px;background:#ffffff;position:relative;overflow:hidden;font-family:Arial,sans-serif;';

        el.innerHTML = `
            <div style="height:80px;background:linear-gradient(to right,#1e3a8a,#1d4ed8);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:8px;position:relative;overflow:hidden;">
                <div style="position:absolute;left:-32px;top:0;width:128px;height:128px;background:rgba(59,130,246,0.3);transform:rotate(45deg);"></div>
                <div style="position:absolute;right:-32px;bottom:0;width:128px;height:128px;background:rgba(96,165,250,0.2);transform:rotate(-45deg);"></div>
                <h3 style="color:#ffffff;font-weight:800;font-size:12px;letter-spacing:0.1em;z-index:10;margin:0 0 8px 0;text-align:center;font-family:Arial,sans-serif;">IDENTIFICACIÓN 2026</h3>
                <div style="z-index:10;width:80px;height:80px;border-radius:50%;background:#ffffff;border:4px solid #ffffff;box-shadow:0 10px 15px rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;overflow:hidden;">
                    ${logoDataURL ? `<img src="${logoDataURL}" style="width:64px;height:64px;object-fit:contain;">` : '<div style="width:64px;height:64px;background:#e5e7eb;"></div>'}
                </div>
            </div>
            <div style="display:flex;justify-content:center;margin:8px 0 12px 0;">
                ${fotoDataURL
                    ? `<img src="${fotoDataURL}" style="width:100px;height:100px;object-fit:cover;border-radius:50%;border:4px solid #e5e7eb;box-shadow:0 4px 6px rgba(0,0,0,0.1);">`
                    : `<div style="width:100px;height:100px;border-radius:50%;background:#e5e7eb;border:4px solid #d1d5db;display:flex;align-items:center;justify-content:center;">
                           <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                       </div>`
                }
            </div>
            <div style="padding:0 24px;margin-bottom:6px;">
                <h2 style="text-align:center;color:#1e3a8a;font-weight:900;font-size:17px;line-height:1.25;text-transform:uppercase;margin:0;font-family:Arial,sans-serif;">${p.nombres || ''}</h2>
                <h2 style="text-align:center;color:#1e3a8a;font-weight:900;font-size:17px;line-height:1.25;text-transform:uppercase;margin:0;font-family:Arial,sans-serif;">${p.apellidos || ''}</h2>
            </div>
            <div style="padding:0 24px;margin-bottom:8px;">
                <p style="text-align:center;color:#1d4ed8;font-weight:700;font-size:13px;text-transform:uppercase;margin:0;font-family:Arial,sans-serif;">${p.cargo?.cargo || 'Sin cargo'}</p>
            </div>
            <div style="padding:0 24px;margin-bottom:12px;">
                <p style="text-align:center;color:#374151;font-weight:600;font-size:12px;margin:0;font-family:Arial,sans-serif;">DNI: <span style="font-weight:700;">${p.dni || ''}</span></p>
            </div>
            <div style="display:flex;justify-content:center;margin-bottom:50px;">
                ${qrDataURL
                    ? `<div style="background:#ffffff;padding:4px;"><img src="${qrDataURL}" style="width:130px;height:130px;object-fit:contain;"></div>`
                    : `<div style="width:130px;height:130px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;"><span style="font-size:12px;color:#9ca3af;">Sin QR</span></div>`
                }
            </div>
            <div style="position:absolute;bottom:30px;left:10px;z-index:20;">
                <span style="color:#374151;font-weight:700;font-size:10px;font-family:Arial,sans-serif;">DISTRITO: ${p.distrito?.alias || ''}</span>
            </div>
            <div style="position:absolute;bottom:0;left:0;right:0;height:25px;background:linear-gradient(to right,#1e3a8a,#1d4ed8);"></div>
        `;
        return el;
    };

    const generarCarnetMasivo = async () => {
        if (seleccionados.length === 0) {
            alert('Debe seleccionar al menos un registro para generar carnés.');
            return;
        }

        setGenerandoMasivo(true);
        setProgresoMasivo({ actual: 0, total: 0 });
        try {
            // Obtener todos los registros del backend para tener todos los seleccionados
            const response = await axios.get(`${URL_API}/personal?pagina=1&limite=9999`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const todosPersonal: Personal[] = (response.data?.personal || []).filter((p: Personal) => p.id && seleccionados.includes(p.id));

            if (todosPersonal.length === 0) {
                alert('No hay registros seleccionados para generar carnés.');
                return;
            }

            setProgresoMasivo({ actual: 0, total: todosPersonal.length });

            // A4 portrait: 210 x 297 mm
            // Layout: 3 columnas × 3 filas = 9 carnés por página
            const pdfDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const margin  = 8;    // mm
            const gap     = 6;    // mm entre carnés
            const cardW   = (210 - 2 * margin - 2 * gap) / 3;   // ≈ 62 mm
            const cardH   = (297 - 2 * margin - 2 * gap) / 3;   // ≈ 91 mm
            const positions = [
                // Fila 1
                { x: margin,                  y: margin },
                { x: margin + cardW + gap,    y: margin },
                { x: margin + 2 * cardW + 2 * gap, y: margin },
                // Fila 2
                { x: margin,                  y: margin + cardH + gap },
                { x: margin + cardW + gap,    y: margin + cardH + gap },
                { x: margin + 2 * cardW + 2 * gap, y: margin + cardH + gap },
                // Fila 3
                { x: margin,                  y: margin + 2 * cardH + 2 * gap },
                { x: margin + cardW + gap,    y: margin + 2 * cardH + 2 * gap },
                { x: margin + 2 * cardW + 2 * gap, y: margin + 2 * cardH + 2 * gap },
            ];

            let isFirstPage = true;

            for (let i = 0; i < todosPersonal.length; i += 9) {
                if (!isFirstPage) pdfDoc.addPage();
                isFirstPage = false;

                const batch = todosPersonal.slice(i, i + 9);

                for (let j = 0; j < batch.length; j++) {
                    const p   = batch[j];
                    const pos = positions[j];

                    // Renderizar carné en DOM oculto
                    const carneEl = await construirDomCarne(p);
                    carneEl.style.position = 'fixed';
                    carneEl.style.left     = '-9999px';
                    carneEl.style.top      = '-9999px';
                    document.body.appendChild(carneEl);

                    try {
                        await new Promise(r => setTimeout(r, 150));
                        const canvas = await html2canvas(carneEl, {
                            scale: 3,
                            allowTaint: false,
                            useCORS: true,
                            logging: false,
                            backgroundColor: '#ffffff',
                            imageTimeout: 0,
                            windowWidth: 300,
                            windowHeight: 475,
                        });
                        const imgData = canvas.toDataURL('image/jpeg', 0.95);
                        pdfDoc.addImage(imgData, 'JPEG', pos.x, pos.y, cardW, cardH);
                    } finally {
                        document.body.removeChild(carneEl);
                    }

                    setProgresoMasivo({ actual: i + j + 1, total: todosPersonal.length });
                }
            }

            const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-');
            pdfDoc.save(`Carnets_Personal_${fecha}.pdf`);
            // Limpiar selección después de descargar
            setSeleccionados([]);
            setSeleccionarTodos(false);
        } catch (error: any) {
            console.error('Error al generar carnés masivos:', error);
            alert('Error al generar los carnés. Revisa la consola para más detalles.');
        } finally {
            setGenerandoMasivo(false);
            setProgresoMasivo({ actual: 0, total: 0 });
        }
    };

    const descargarPDF = async () => {
        if (!carneRef.current || !personalCarne) return;

        setDescargandoPDF(true);
        setErrorCarne(null);
        
        try {
            console.log('Iniciando generación de PDF...');
            
            // Convertir todas las imágenes a data URLs para evitar CORS
            const logoDataURL = await convertirImagenADataURL('/logoGP.png');
            let fotoDataURL = '';
            if (personalCarne.foto) {
                fotoDataURL = await convertirImagenADataURL(personalCarne.foto);
            }
            let qrDataURL = '';
            if (personalCarne.codigoQR) {
                qrDataURL = personalCarne.codigoQR; // Ya debería ser data URL
            }

            console.log('Imágenes convertidas, reemplazando fuentes...');
            
            // Reemplazar las fuentes de las imágenes con data URLs
            const carneElement = carneRef.current;
            const imagenesOriginales: { elemento: HTMLImageElement; srcOriginal: string }[] = [];
            
            carneElement.querySelectorAll('img').forEach((img) => {
                imagenesOriginales.push({ elemento: img, srcOriginal: img.src });
                
                if (img.alt === 'Logo') {
                    img.src = logoDataURL;
                } else if (img.alt === 'Foto' && fotoDataURL) {
                    img.src = fotoDataURL;
                } else if (img.alt === 'QR' && qrDataURL) {
                    img.src = qrDataURL;
                }
            });

            // Esperar a que las imágenes se actualicen
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('Generando canvas...');
            const canvas = await html2canvas(carneRef.current, {
                scale: 6, // Máxima calidad para texto y QR nítidos
                allowTaint: false,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                imageTimeout: 0,
                windowWidth: 300,
                windowHeight: 475
            });

            // Restaurar las fuentes originales
            imagenesOriginales.forEach(({ elemento, srcOriginal }) => {
                elemento.src = srcOriginal;
            });

            console.log('Canvas generado, creando imagen...');
            const imgData = canvas.toDataURL('image/png', 1.0); // Máxima calidad
            
            console.log('Creando PDF...');
            // Tamaño de carné estándar: 85.6mm x 135mm (proporción similar a 300x475px)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [85.6, 135.4]
            });

            // Ajustar imagen al tamaño del PDF
            pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 135.4, undefined, 'FAST');
            
            console.log('Guardando PDF...');
            pdf.save(`Carnet_${personalCarne.dni}_${personalCarne.nombres?.replace(/\s+/g, '_')}.pdf`);
            
            console.log('PDF descargado exitosamente');
        } catch (error: any) {
            console.error('Error detallado al generar PDF:', error);
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            setErrorCarne(`Error: ${error.message || 'No se pudo generar el PDF'}`);
        } finally {
            setDescargandoPDF(false);
        }
    };

    const filtrados = personal.filter(p =>
        p.nombres?.toLowerCase().includes(buscar.toLowerCase()) ||
        p.apellidos?.toLowerCase().includes(buscar.toLowerCase()) ||
        p.cargo?.cargo?.toLowerCase().includes(buscar.toLowerCase()) ||
        p.dni?.includes(buscar)
    );

    // Manejo de selección
    const handleSeleccionarTodos = async () => {
        if (seleccionarTodos) {
            // Deseleccionar todos
            setSeleccionados([]);
            setSeleccionarTodos(false);
        } else {
            // Seleccionar TODOS los registros de todas las páginas
            try {
                const response = await axios.get(`${URL_API}/personal?pagina=1&limite=9999`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const todosIds = (response.data?.personal || []).filter((p: Personal) => p.id).map((p: Personal) => p.id!);
                setSeleccionados(todosIds);
                setSeleccionarTodos(true);
            } catch (error) {
                console.error('Error al obtener todos los IDs:', error);
                alert('Error al seleccionar todos los registros');
            }
        }
    };

    const handleSeleccionarIndividual = (id: number) => {
        if (seleccionados.includes(id)) {
            setSeleccionados(seleccionados.filter(selId => selId !== id));
        } else {
            setSeleccionados([...seleccionados, id]);
        }
    };

    // Actualizar estado del checkbox de seleccionar todos basado en página actual
    useEffect(() => {
        const idsVisibles = filtrados.filter(p => p.id).map(p => p.id!);
        const todosVisiblesSeleccionados = idsVisibles.length > 0 && idsVisibles.every(id => seleccionados.includes(id));
        // Si todos los visibles están seleccionados pero no tenemos todos los registros globales, mostrar como parcialmente seleccionado
        // Para simplificar, mostramos checked si todos los visibles están seleccionados
        setSeleccionarTodos(todosVisiblesSeleccionados);
    }, [seleccionados, filtrados]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            <main className="md:ml-64 pt-16">
                <div className="p-6">

                    {/* Encabezado */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 id="titulo-listado-personal" data-testid="page-title" className="text-2xl font-extrabold text-blue-900 tracking-tight">LISTADO DE PERSONAL</h1>
                            <p className="text-gray-400 text-xs mt-0.5">Gestión de personal de la institución</p>
                            {seleccionados.length > 0 && (
                                <div className="mt-2 inline-flex items-center gap-2">
                                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {seleccionados.length} registro{seleccionados.length !== 1 ? 's' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
                                    </div>
                                    <button
                                        id="btn-limpiar-seleccion"
                                        data-testid="btn-clear-selection"
                                        onClick={() => { setSeleccionados([]); setSeleccionarTodos(false); }}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-red-600 transition-colors"
                                        title="Limpiar selección"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Limpiar
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                id="btn-carne-masivo"
                                data-testid="btn-bulk-carne"
                                onClick={generarCarnetMasivo}
                                disabled={generandoMasivo || seleccionados.length === 0}
                                className="flex items-center gap-2 border border-blue-800 text-blue-800 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                                {generandoMasivo ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        {progresoMasivo.total > 0
                                            ? `${progresoMasivo.actual}/${progresoMasivo.total}`
                                            : 'Cargando...'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Carné Masivo {seleccionados.length > 0 && `(${seleccionados.length})`}
                                    </>
                                )}
                            </button>
                            <button id="btn-nuevo-personal" data-testid="btn-new-personal" onClick={abrirModal} className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-800/20 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo Registro
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta tabla */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Barra superior */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>Mostrar</span>
                                <select id="select-limite" data-testid="select-limit" value={limite} onChange={e => handleLimiteChange(Number(e.target.value))}
                                    className="border border-gray-200 bg-gray-50 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer">
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                                <span>registros</span>
                                {totalRegistros > 0 && (
                                    <span className="ml-2 text-gray-400">— <span className="font-bold text-gray-600">{totalRegistros}</span> en total</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Buscar:</span>
                                <input id="input-buscar-personal" data-testid="search-input" type="text" value={buscar} onChange={e => setBuscar(e.target.value)}
                                    className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all w-48"
                                    placeholder="Buscar..." />
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="overflow-x-auto">
                            <table id="tabla-personal" data-testid="personal-table" className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                        <th id="col-seleccion" className="px-5 py-3 text-center font-semibold w-12">
                                            <input
                                                id="checkbox-seleccionar-todos"
                                                data-testid="checkbox-select-all"
                                                type="checkbox"
                                                checked={seleccionarTodos}
                                                onChange={handleSeleccionarTodos}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                title="Seleccionar todos los registros (todas las páginas)"
                                            />
                                        </th>
                                        <th id="col-numero" className="px-5 py-3 text-left font-semibold w-10">#</th>
                                        <th id="col-dni" className="px-5 py-3 text-left font-semibold">DNI</th>
                                        <th id="col-personal" className="px-5 py-3 text-left font-semibold">Personal</th>
                                        <th id="col-cargo" className="px-5 py-3 text-left font-semibold">Cargo</th>
                                        <th id="col-foto" className="px-5 py-3 text-left font-semibold">Foto</th>
                                        <th id="col-qr" className="px-5 py-3 text-left font-semibold">QR</th>
                                        <th id="col-accion" className="px-5 py-3 text-left font-semibold">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Cargando personal...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filtrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                No se encontraron registros.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtrados.map((p, index) => (
                                            <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                                                <td className="px-5 py-3 text-center">
                                                    <input
                                                        id={`checkbox-personal-${p.id}`}
                                                        data-testid={`checkbox-personal-${p.id}`}
                                                        type="checkbox"
                                                        checked={p.id ? seleccionados.includes(p.id) : false}
                                                        onChange={() => p.id && handleSeleccionarIndividual(p.id)}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-5 py-3 text-gray-500 font-medium">
                                                    {(pagina - 1) * limite + index + 1}
                                                </td>
                                                <td className="px-5 py-3 font-mono font-semibold text-gray-800">{p.dni}</td>
                                                <td className="px-5 py-3 text-gray-800 font-medium">{p.nombres} {p.apellidos}</td>
                                                <td className="px-5 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                        {p.cargo?.cargo || 'Sin cargo'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {p.foto ? (
                                                        <img src={p.foto} alt={`Foto ${p.nombres}`} className="w-10 h-10 object-cover rounded-full border border-gray-200" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    {p.codigoQR ? (
                                                        <img src={p.codigoQR} alt={`QR ${p.dni}`} className="w-10 h-10 object-contain rounded border border-gray-200" />
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">Sin QR</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <button onClick={() => abrirModalDetalles(p)} className="px-3 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-xs transition-colors border border-green-200">
                                                            Ver
                                                        </button>
                                                        <button onClick={() => abrirModalCarne(p)} className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors border border-indigo-200">
                                                            Carné
                                                        </button>
                                                        <button onClick={() => abrirModalFoto(p)} className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200">
                                                            Foto
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 text-sm text-gray-500">
                            <span>
                                Mostrando <span className="font-bold text-gray-700">{(pagina - 1) * limite + 1}</span>–<span className="font-bold text-gray-700">{Math.min(pagina * limite, totalRegistros || pagina * limite)}</span>
                                {totalRegistros > 0 && <> de <span className="font-bold text-gray-700">{totalRegistros}</span> registros</>}
                            </span>
                            <div className="flex items-center gap-1">
                                <button id="btn-primera-pagina" data-testid="btn-first-page" onClick={() => setPagina(1)} disabled={pagina === 1}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">«</button>
                                <button id="btn-pagina-anterior" data-testid="btn-prev-page" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">Anterior</button>
                                <span id="pagina-actual" data-testid="current-page" className="px-3 py-1.5 rounded-lg bg-blue-800 text-white font-bold text-xs">{pagina}</span>
                                <button id="btn-pagina-siguiente" data-testid="btn-next-page" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">Siguiente</button>
                                <button id="btn-ultima-pagina" data-testid="btn-last-page" onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-600 transition-colors text-xs">»</button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Modal Nuevo Personal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-visible">
                        {/* Header */}
                        <div className="bg-linear-to-r from-blue-900 to-blue-600 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-extrabold text-base">Registro de Personal</h2>
                                    <p className="text-blue-200 text-xs">Complete los datos del nuevo personal</p>
                                </div>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={crearPersonal} className="p-6 flex flex-col gap-4 overflow-visible">
                            <div className="grid grid-cols-2 gap-3 overflow-visible">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">DNI</label>
                                    <input id="input-dni" data-testid="input-dni" type="text" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="12345678" maxLength={8} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombres</label>
                                    <input id="input-nombres" data-testid="input-nombres" type="text" value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="Nombres" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Apellidos</label>
                                    <input id="input-apellidos" data-testid="input-apellidos" type="text" value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                        placeholder="Apellidos" required />
                                </div>
                                <div className="col-span-2 relative">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cargo</label>
                                    <div className="relative dropdown-cargo-container">
                                        <input 
                                            id="input-buscar-cargo"
                                            data-testid="input-buscar-cargo"
                                            type="text" 
                                            value={buscarCargo} 
                                            onChange={e => {
                                                setBuscarCargo(e.target.value);
                                                setMostrarDropdownCargo(true);
                                                if (e.target.value === '') {
                                                    setCargoSeleccionado(null);
                                                    setForm({ ...form, cargoId: '' });
                                                }
                                            }}
                                            onFocus={() => setMostrarDropdownCargo(true)}
                                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                            placeholder="Buscar cargo..."
                                            required
                                        />
                                        <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        
                                        {/* Dropdown de cargos */}
                                        {mostrarDropdownCargo && (
                                            <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {loadingCargos ? (
                                                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                                                        <svg className="w-4 h-4 animate-spin inline-block mr-2" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                        Cargando cargos...
                                                    </div>
                                                ) : cargosFiltrados.length === 0 ? (
                                                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                                                        No se encontraron cargos
                                                    </div>
                                                ) : (
                                                    cargosFiltrados.map(cargo => (
                                                        <div
                                                            key={cargo.id}
                                                            onClick={() => seleccionarCargo(cargo)}
                                                            className={`px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                                                                cargoSeleccionado?.id === cargo.id ? 'bg-blue-100' : ''
                                                            }`}
                                                        >
                                                            <div className="text-sm font-semibold text-gray-800">{cargo.cargo}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Divisor y Encabezado de Campos Opcionales */}
                                <div className="col-span-2 pt-2 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Información Adicional</span>
                                            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Opcional</span>
                                        </div>
                                        <div className="flex-1 h-px bg-gradient-to-l from-blue-200 to-transparent"></div>
                                    </div>
                                </div>

                                {/* Nivel Modalidad (Opcional) */}
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Nivel de Modalidad <span className="text-gray-400 text-xs">(Opcional)</span>
                                    </label>
                                    <select 
                                        value={form.nivelModalidad} 
                                        onChange={e => seleccionarNivelModalidad(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                    >
                                        <option value="">-- Seleccionar Nivel --</option>
                                        {nivelModalidadOpciones.map(nivel => (
                                            <option key={nivel} value={nivel}>{nivel}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Institución Educativa (Opcional) */}
                                <div className="col-span-2 relative">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Institución Educativa <span className="text-gray-400 text-xs">(Opcional)</span>
                                    </label>
                                    <div className="relative dropdown-institucion-container">
                                        <input 
                                            id="input-buscar-institucion"
                                            type="text" 
                                            value={buscarInstitucion} 
                                            onChange={e => {
                                                if (form.nivelModalidad) {
                                                    setBuscarInstitucion(e.target.value);
                                                    setMostrarDropdownInstitucion(true);
                                                    if (e.target.value === '') {
                                                        setInstitucionSeleccionada(null);
                                                        setForm({ ...form, institucionEducativaId: '', distritoId: '' });
                                                        setDistritoPrecargado(null);
                                                        setBuscarDistrito('');
                                                        setDistritoSeleccionado(null);
                                                    }
                                                }
                                            }}
                                            onFocus={() => form.nivelModalidad && setMostrarDropdownInstitucion(true)}
                                            disabled={!form.nivelModalidad}
                                            className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all ${!form.nivelModalidad ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' : 'bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white'}`}
                                            placeholder="Selecciona un nivel primero..."
                                        />
                                        <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        
                                        {/* Dropdown de instituciones */}
                                        {mostrarDropdownInstitucion && form.nivelModalidad && (
                                            <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {loadingInstituciones ? (
                                                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                                                        <svg className="w-4 h-4 animate-spin inline-block mr-2" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                        Cargando instituciones...
                                                    </div>
                                                ) : instituciones.length === 0 ? (
                                                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                                                        No se encontraron instituciones para este nivel
                                                    </div>
                                                ) : (
                                                    instituciones.filter(i => 
                                                        i.nombreIE.toLowerCase().includes(buscarInstitucion.toLowerCase()) ||
                                                        i.codigoModular.includes(buscarInstitucion)
                                                    ).map(institucion => (
                                                        <div
                                                            key={institucion.id}
                                                            onClick={() => seleccionarInstitucion(institucion)}
                                                            className={`px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                                                                institucionSeleccionada?.id === institucion.id ? 'bg-blue-100' : ''
                                                            }`}
                                                        >
                                                            <div className="text-sm font-semibold text-gray-800">{institucion.nombreIE}</div>
                                                            <div className="text-xs text-gray-500">{institucion.codigoModular}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Distrito (Precargado desde Institución) */}
                                <div className="col-span-2 relative">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Distrito {!distritoPrecargado && <span className="text-gray-400 text-xs">(Se precarga automáticamente)</span>}
                                    </label>
                                    <div className="relative dropdown-distrito-container">
                                        <input 
                                            id="input-buscar-distrito"
                                            data-testid="input-buscar-distrito"
                                            type="text" 
                                            value={buscarDistrito} 
                                            onChange={e => {
                                                if (!distritoPrecargado) {
                                                    setBuscarDistrito(e.target.value);
                                                    setMostrarDropdownDistrito(true);
                                                    if (e.target.value === '') {
                                                        setDistritoSeleccionado(null);
                                                        setForm({ ...form, distritoId: '' });
                                                    }
                                                }
                                            }}
                                            onFocus={() => !distritoPrecargado && setMostrarDropdownDistrito(true)}
                                            disabled={!!distritoPrecargado || !institucionSeleccionada}
                                            className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all ${distritoPrecargado || !institucionSeleccionada ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' : 'bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white'}`}
                                            placeholder="Buscar distrito..."
                                        />
                                        <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        
                                        {/* Dropdown de distritos */}
                                        {mostrarDropdownDistrito && (
                                            <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {loadingDistritos ? (
                                                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                                                        <svg className="w-4 h-4 animate-spin inline-block mr-2" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                        Cargando distritos...
                                                    </div>
                                                ) : distritosFiltrados.length === 0 ? (
                                                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                                                        No se encontraron distritos
                                                    </div>
                                                ) : (
                                                    distritosFiltrados.map(distrito => (
                                                        <div
                                                            key={distrito.id}
                                                            onClick={() => seleccionarDistrito(distrito)}
                                                            className={`px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                                                                distritoSeleccionado?.id === distrito.id ? 'bg-blue-100' : ''
                                                            }`}
                                                        >
                                                            <div className="text-sm font-semibold text-gray-800">{distrito.alias}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {successCrear && <div id="msg-success-crear" data-testid="msg-success-crear" className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs">{successCrear}</div>}
                            {errorCrear && <div id="msg-error-crear" data-testid="msg-error-crear" className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs">{errorCrear}</div>}

                            <div className="flex gap-3 pt-1">
                                <button id="btn-cerrar-modal-personal" data-testid="btn-cancel-personal" type="button" onClick={() => setModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                                    Cerrar
                                </button>
                                <button id="btn-registrar-personal" data-testid="btn-submit-personal" type="submit" disabled={loadingCrear}
                                    className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 text-sm">
                                    {loadingCrear ? 'Registrando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ver Detalles */}
            {modalVer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setModalVer(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-900 to-blue-600 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-extrabold text-base">Detalles de Personal</h2>
                                    <p className="text-blue-200 text-xs">Información completa del empleado</p>
                                </div>
                            </div>
                            <button onClick={() => setModalVer(false)} className="text-white/70 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 flex flex-col gap-4">
                            {loadingDetalles ? (
                                <div className="flex flex-col items-center gap-3 py-12">
                                    <svg className="w-12 h-12 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <p className="text-gray-500 text-sm">Cargando información...</p>
                                </div>
                            ) : errorDetalles ? (
                                <div id="msg-error-detalles" data-testid="msg-error-detalles" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {errorDetalles}
                                </div>
                            ) : personalDetalles ? (
                                <>
                                    {/* Foto */}
                                    <div className="flex justify-center">
                                        {personalDetalles.foto ? (
                                            <img
                                                src={personalDetalles.foto}
                                                alt="Foto"
                                                className="w-24 h-24 object-cover rounded-full border-4 border-blue-200"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Detalles */}
                                    <div className="space-y-3">
                                        <div className="border-b border-gray-200 pb-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Nombre Completo</p>
                                            <p className="text-sm font-bold text-gray-800">{personalDetalles.nombres} {personalDetalles.apellidos}</p>
                                        </div>

                                        <div className="border-b border-gray-200 pb-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">DNI</p>
                                            <p className="text-sm font-semibold text-gray-800 font-mono">{personalDetalles.dni}</p>
                                        </div>

                                        <div className="border-b border-gray-200 pb-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Cargo</p>
                                            <p className="text-sm font-semibold text-gray-800">{personalDetalles.cargo?.cargo || 'Sin cargo'}</p>
                                            {personalDetalles.cargo?.descripcion && (
                                                <p className="text-xs text-gray-600 mt-1 italic">{personalDetalles.cargo.descripcion}</p>
                                            )}
                                        </div>

                                        <div className="border-b border-gray-200 pb-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Distrito</p>
                                            <p className="text-sm font-semibold text-gray-800">{personalDetalles.distrito?.distrito || 'Sin distrito'}</p>
                                            {personalDetalles.distrito?.alias && (
                                                <p className="text-xs text-gray-600 mt-1">Alias: <span className="font-semibold">{personalDetalles.distrito.alias}</span></p>
                                            )}
                                        </div>

                                        <div className="border-b border-gray-200 pb-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Estado</p>
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                personalDetalles.estado 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {personalDetalles.estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>

                                        {personalDetalles.nivelModalidad && (
                                            <div className="border-b border-gray-200 pb-2">
                                                <p className="text-xs font-semibold text-gray-500 uppercase">Nivel de Modalidad</p>
                                                <p className="text-sm font-semibold text-gray-800">{personalDetalles.nivelModalidad}</p>
                                            </div>
                                        )}

                                        {personalDetalles.institucionEducativa && (
                                            <div className="border-b border-gray-200 pb-2">
                                                <p className="text-xs font-semibold text-gray-500 uppercase">Institución Educativa</p>
                                                <p className="text-sm font-semibold text-gray-800">{personalDetalles.institucionEducativa.nombreIE}</p>
                                                <p className="text-xs text-gray-600 mt-1">Código Modular: <span className="font-mono font-semibold">{personalDetalles.institucionEducativa.codigoModular}</span></p>
                                            </div>
                                        )}

                                        {personalDetalles.codigoQR && (
                                            <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                <p className="text-xs font-semibold text-gray-600">Código QR</p>
                                                <img
                                                    src={personalDetalles.codigoQR}
                                                    alt="QR"
                                                    className="w-32 h-32 object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                            <button
                                id="btn-cerrar-detalles"
                                data-testid="btn-close-detalles"
                                onClick={() => setModalVer(false)}
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Subir Foto */}
            {modalFoto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setModalFoto(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-900 to-blue-600 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-extrabold text-base">Subir Foto de Personal</h2>
                                    <p className="text-blue-200 text-xs">{personalSeleccionado?.nombres} {personalSeleccionado?.apellidos}</p>
                                </div>
                            </div>
                            <button onClick={() => setModalFoto(false)} className="text-white/70 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 flex flex-col gap-4">
                            {/* Preview de la foto actual */}
                            {personalSeleccionado?.foto && (
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-xs font-semibold text-gray-600">Foto actual:</p>
                                    <img src={personalSeleccionado.foto} alt="Foto actual" className="w-24 h-24 object-cover rounded-full border-2 border-gray-200" />
                                </div>
                            )}

                            {/* Input de archivo */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">Seleccionar nueva foto</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-input-foto"
                                        data-testid="file-input-foto"
                                    />
                                    <label
                                        htmlFor="file-input-foto"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                                    >
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-sm text-gray-600 font-medium">
                                            {archivoFoto ? archivoFoto.name : 'Haz clic para seleccionar'}
                                        </span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Formatos: JPG, PNG. Tamaño máximo: 5MB</p>
                            </div>

                            {/* Preview de la nueva foto */}
                            {previewFoto && (
                                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-semibold text-gray-600">Vista previa:</p>
                                    <img src={previewFoto} alt="Preview" className="w-32 h-32 object-cover rounded-full border-2 border-blue-500" />
                                </div>
                            )}

                            {successFoto && <div id="msg-success-foto" data-testid="msg-success-foto" className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs">{successFoto}</div>}
                            {errorFoto && <div id="msg-error-foto" data-testid="msg-error-foto" className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs">{errorFoto}</div>}

                            <div className="flex gap-3 pt-1">
                                <button
                                    id="btn-cancelar-foto"
                                    data-testid="btn-cancel-foto"
                                    type="button"
                                    onClick={() => setModalFoto(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    id="btn-subir-foto"
                                    data-testid="btn-upload-foto"
                                    onClick={subirFoto}
                                    disabled={loadingFoto || !archivoFoto}
                                    className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {loadingFoto ? 'Subiendo...' : 'Subir Foto'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Carné */}
            {modalCarne && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-900 to-blue-600 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-extrabold text-base">Previsualización de Carné</h2>
                                    <p className="text-blue-200 text-xs">Visualice y descargue el carné en PDF</p>
                                </div>
                            </div>
                            <button onClick={() => setModalCarne(false)} className="text-white/70 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-8 flex flex-col items-center gap-6">
                            {loadingCarne ? (
                                <div className="flex flex-col items-center gap-3 py-12">
                                    <svg className="w-12 h-12 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <p className="text-gray-500 text-sm">Cargando informaci\u00f3n del carn\u00e9...</p>
                                </div>
                            ) : errorCarne ? (
                                <div id="msg-error-carne" data-testid="msg-error-carne" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {errorCarne}
                                </div>
                            ) : personalCarne ? (
                                <>
                                    {/* Diseño del Carné */}
                                    <div 
                                        ref={carneRef}
                                        className="relative overflow-hidden"
                                        style={{ 
                                            width: '300px', 
                                            height: '475px',
                                            backgroundColor: '#ffffff',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                        }}
                                    >
                                        {/* Header azul con corte diagonal */}
                                        <div 
                                            className="relative overflow-hidden"
                                            style={{ 
                                                height: '80px',
                                                background: 'linear-gradient(to right, #1e3a8a, #1d4ed8)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                paddingTop: '8px'
                                            }}
                                        >
                                            <div className="absolute" style={{ left: '-32px', top: 0, width: '128px', height: '128px', backgroundColor: 'rgba(59, 130, 246, 0.3)', transform: 'rotate(45deg)' }}></div>
                                            <div className="absolute" style={{ right: '-32px', bottom: 0, width: '128px', height: '128px', backgroundColor: 'rgba(96, 165, 250, 0.2)', transform: 'rotate(-45deg)' }}></div>
                                            <h3 style={{ color: '#ffffff', fontWeight: '800', fontSize: '12px', letterSpacing: '0.1em', zIndex: 10, marginBottom: '8px', textAlign: 'center', textRendering: 'geometricPrecision' }}>
                                                IDENTIFICACIÓN 2026
                                            </h3>
                                            
                                            {/* Logo circular dentro del header */}
                                            <div 
                                                className="relative overflow-hidden"
                                                style={{ zIndex: 10, width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ffffff', border: '4px solid #ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <img 
                                                    src="/logoGP.png" 
                                                    alt="Logo" 
                                                    style={{ width: '64px', height: '64px', objectFit: 'contain', imageRendering: 'crisp-edges' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Foto del personal */}
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', marginTop: '8px' }}>
                                            {personalCarne.foto ? (
                                                <img 
                                                    src={personalCarne.foto} 
                                                    alt="Foto" 
                                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', imageRendering: 'crisp-edges' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e5e7eb', border: '4px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg style={{ width: '56px', height: '56px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Nombre */}
                                        <div style={{ paddingLeft: '24px', paddingRight: '24px', marginBottom: '6px' }}>
                                            <h2 style={{ textAlign: 'center', color: '#1e3a8a', fontWeight: '900', fontSize: '17px', lineHeight: '1.25', textTransform: 'uppercase', textRendering: 'geometricPrecision' }}>
                                                {personalCarne.nombres}
                                            </h2>
                                            <h2 style={{ textAlign: 'center', color: '#1e3a8a', fontWeight: '900', fontSize: '17px', lineHeight: '1.25', textTransform: 'uppercase', textRendering: 'geometricPrecision' }}>
                                                {personalCarne.apellidos}
                                            </h2>
                                        </div>

                                        {/* Cargo */}
                                        <div style={{ paddingLeft: '24px', paddingRight: '24px', marginBottom: '8px' }}>
                                            <p style={{ textAlign: 'center', color: '#1d4ed8', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', textRendering: 'geometricPrecision' }}>
                                                {personalCarne.cargo?.cargo || 'Sin cargo'}
                                            </p>
                                        </div>

                                
                                        {/* DNI */}
                                        <div style={{ paddingLeft: '24px', paddingRight: '24px', marginBottom: '12px' }}>
                                            <p style={{ textAlign: 'center', color: '#374151', fontWeight: '600', fontSize: '12px', textRendering: 'geometricPrecision' }}>
                                                DNI: <span style={{ fontWeight: '700' }}>{personalCarne.dni}</span>
                                            </p>
                                        </div>

                                  

                                        {/* Código QR */}
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
                                            {personalCarne.codigoQR ? (
                                                <div style={{ backgroundColor: '#ffffff', padding: '4px' }}>
                                                    <img 
                                                        src={personalCarne.codigoQR} 
                                                        alt="QR" 
                                                        style={{ width: '130px', height: '130px', objectFit: 'contain', imageRendering: 'crisp-edges' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ width: '130px', height: '130px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>Sin QR</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* ALIAS */}

                                        <div style={{ position: 'absolute', bottom: '30px', left: '10px', zIndex: 20 }}>
                                            <span style={{ color: '#374151', fontWeight: '700', fontSize: '10px', fontFamily: 'Arial,sans-serif' }}>
                                                DISTRITO: {personalCarne.distrito?.alias || ''}
                                            </span>
                                        </div>

                                        {/* Footer decorativo */}
                                        <div 
                                            className="absolute"
                                            style={{ bottom: 0, left: 0, right: 0, height: '25px', overflow: 'hidden', background: 'linear-gradient(to right, #1e3a8a, #1d4ed8)' }}
                                        >
                                        </div>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 w-full max-w-md">
                                        <button
                                            id="btn-cerrar-modal-carne"
                                            data-testid="btn-close-carne"
                                            onClick={() => setModalCarne(false)}
                                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                                        >
                                            Cerrar
                                        </button>
                                        <button
                                            id="btn-descargar-pdf"
                                            data-testid="btn-download-pdf"
                                            onClick={descargarPDF}
                                            disabled={descargandoPDF}
                                            className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                        >
                                            {descargandoPDF ? (
                                                <>
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Generando...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Descargar PDF
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Personal;

