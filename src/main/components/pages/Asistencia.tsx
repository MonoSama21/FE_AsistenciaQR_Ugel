import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../sections/Sidebar";
import Header from "../sections/Header";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";

interface QRData {
    id: number;
    dni: string;
    nombres: string;
    apellidos: string;
    cargoId: number;
}

interface CameraDevice {
    id: string;
    label: string;
}

const Asistencia = () => {
    const URL_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken') || '';

    // Estados
    const [horaActual, setHoraActual] = useState<string>('');
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [qrDetectado, setQrDetectado] = useState<boolean>(false);
    const [procesandoImagen, setProcesandoImagen] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info' | '', texto: string }>({ tipo: '', texto: '' });
    const [loading, setLoading] = useState<boolean>(false);
    const [modalConfirmacion, setModalConfirmacion] = useState<{
        visible: boolean;
        tipo: 'ENTRADA' | 'SALIDA' | '';
        datos: QRData | null;
        hora: string;
    }>({ visible: false, tipo: '', datos: null, hora: '' });

    // Referencias para actualizaciones síncronas inmediatas
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerInitializedRef = useRef<boolean>(false);
    const procesandoQRRef = useRef<boolean>(false); // Evitar múltiples escaneos (síncrono)
    const fileInputRef = useRef<HTMLInputElement | null>(null); // Para el input de archivo

    // Actualizar reloj cada segundo
    useEffect(() => {
        const actualizarHora = () => {
            const ahora = new Date();
            const horas = String(ahora.getHours()).padStart(2, '0');
            const minutos = String(ahora.getMinutes()).padStart(2, '0');
            const segundos = String(ahora.getSeconds()).padStart(2, '0');
            setHoraActual(`${horas}:${minutos}:${segundos}`);
        };

        actualizarHora();
        const intervalo = setInterval(actualizarHora, 1000);

        return () => clearInterval(intervalo);
    }, []);

    // Obtener cámaras disponibles
    useEffect(() => {
        const obtenerCamaras = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0) {
                    const camerasFormateadas = devices.map((device) => ({
                        id: device.id,
                        label: device.label || `Cámara ${device.id}`
                    }));
                    setCameras(camerasFormateadas);
                    setSelectedCamera(camerasFormateadas[0].id);
                } else {
                    setMensaje({ tipo: 'error', texto: 'No se encontraron cámaras disponibles' });
                }
            } catch (error) {
                console.error('Error al obtener cámaras:', error);
                setMensaje({ tipo: 'error', texto: 'Error al acceder a las cámaras' });
            }
        };

        obtenerCamaras();
    }, []);

    // Validar formato del QR
    const validarFormatoQR = (data: string): QRData | null => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.id && parsed.dni && parsed.nombres && parsed.apellidos && parsed.cargoId) {
                return parsed as QRData;
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    // Reproducir mensaje con síntesis de voz
    const reproducirVoz = (tipo: string, nombre: string, hora: string): Promise<void> => {
        return new Promise((resolve) => {
            try {
                // Verificar si el navegador soporta síntesis de voz
                if ('speechSynthesis' in window) {
                    // Cancelar cualquier mensaje anterior
                    window.speechSynthesis.cancel();

                    const mensaje = `${tipo} de ${nombre} a las ${hora}`;
                    const utterance = new SpeechSynthesisUtterance(mensaje);
                    
                    // Configurar voz en español
                    utterance.lang = 'es-ES';
                    utterance.rate = 0.9; // Velocidad normal
                    utterance.pitch = 1; // Tono normal
                    utterance.volume = 1; // Volumen máximo

                    // Resolver la promesa cuando termine el audio
                    utterance.onend = () => {
                        console.log('🔊 Audio finalizado completamente');
                        resolve();
                    };

                    // En caso de error, también resolver
                    utterance.onerror = (error) => {
                        console.error('Error en síntesis de voz:', error);
                        resolve();
                    };

                    console.log('🔊 Reproduciendo audio:', mensaje);
                    window.speechSynthesis.speak(utterance);
                } else {
                    // Si no hay soporte de voz, resolver inmediatamente
                    console.log('⚠️ Síntesis de voz no soportada');
                    resolve();
                }
            } catch (error) {
                console.error('Error al reproducir voz:', error);
                resolve();
            }
        });
    };

    // Registrar asistencia
    const registrarAsistencia = async (qrData: QRData) => {
        setLoading(true);
        setMensaje({ tipo: '', texto: '' });
        // Limpiar modal anterior si existiera
        setModalConfirmacion({ visible: false, tipo: '', datos: null, hora: '' });

        try {
            const response = await axios.post(
                `${URL_API}/asistencia/registrar`,
                { qrData: JSON.stringify(qrData) },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { message, tipo } = response.data;
            
            // Log para debugging
            console.log('📡 Respuesta del backend:', response.data);
            console.log('Tipo recibido:', tipo);
            
            // Normalizar el tipo (convertir a mayúsculas y limpiar espacios)
            const tipoNormalizado = tipo?.toString().trim().toUpperCase();
            console.log('Tipo normalizado:', tipoNormalizado);
            
            // Validar que sea ENTRADA o SALIDA
            const tipoFinal = (tipoNormalizado === 'ENTRADA') ? 'ENTRADA' : 'SALIDA';
            
            // Obtener hora actual
            const ahora = new Date();
            const horaRegistro = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(ahora.getSeconds()).padStart(2, '0')}`;

            // Pequeño delay para asegurar que el estado anterior se limpió
            setTimeout(async () => {
                // Mostrar modal de confirmación
                setModalConfirmacion({
                    visible: true,
                    tipo: tipoFinal,
                    datos: qrData,
                    hora: horaRegistro
                });

                // Reproducir mensaje de voz y ESPERAR a que termine (solo primer nombre)
                const primerNombre = qrData.nombres.split(' ')[0];
                await reproducirVoz(tipoFinal, primerNombre, horaRegistro);
                
                console.log('✅ Audio completado, esperando 1.5 segundos adicionales...');
                
                // Esperar 1.5 segundos adicionales después del audio para que el usuario vea el modal (total ~3 segundos)
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Cerrar modal y permitir nuevos escaneos
                console.log('🔄 Cerrando modal, listo para el siguiente escaneo...');
                setModalConfirmacion({ visible: false, tipo: '', datos: null, hora: '' });
                procesandoQRRef.current = false; // Resetear referencia - permite nuevos escaneos
                console.log('▶️ Sistema listo para el siguiente registro');
            }, 100);

        } catch (error: any) {
            console.error('Error al registrar asistencia:', error);
            
            let mensajeError = 'Error al registrar asistencia';
            
            if (error.response?.data?.message) {
                mensajeError = error.response.data.message;
            } else if (error.response?.status === 404) {
                mensajeError = 'El empleado no está registrado en el sistema';
            } else if (error.response?.status === 400) {
                mensajeError = 'El código QR no es válido o el empleado está inactivo';
            }

            setMensaje({ tipo: 'error', texto: mensajeError });

            // Permitir nuevos escaneos inmediatamente en caso de error
            procesandoQRRef.current = false;
            console.log('▶️ Sistema listo para nuevos escaneos después de error');

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => {
                setMensaje({ tipo: '', texto: '' });
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    // Manejar resultado del escaneo
    const onScanSuccess = async (decodedText: string) => {
        // Procesar el QR detectado usando la función compartida
        procesarQRDetectado(decodedText);
    };

    // Iniciar escaneo
    const iniciarEscaneo = async () => {
        if (!selectedCamera) {
            setMensaje({ tipo: 'error', texto: 'Por favor selecciona una cámara' });
            return;
        }

        try {
            // Resetear estado de detección
            setQrDetectado(false);
            procesandoQRRef.current = false; // Resetear referencia

            if (!html5QrCodeRef.current && !scannerInitializedRef.current) {
                html5QrCodeRef.current = new Html5Qrcode("qr-reader");
                scannerInitializedRef.current = true;
            }

            const qrCodeScanner = html5QrCodeRef.current;

            if (qrCodeScanner) {
                await qrCodeScanner.start(
                    selectedCamera,
                    {
                        fps: 30, // Aumentado para mayor velocidad de detección
                        // Sin qrbox para detectar en toda el área de la cámara
                        aspectRatio: 1.777778 // 16:9 para mejor calidad de video
                    },
                    onScanSuccess,
                    undefined
                );

                setIsScanning(true);
                console.log('🎥 Scanner iniciado y listo');
                setMensaje({ tipo: 'info', texto: 'Escaneo activo. El QR se detectará automáticamente al aparecer en cámara.' });
            }
        } catch (error) {
            console.error('Error al iniciar escaneo:', error);
            setMensaje({ tipo: 'error', texto: 'Error al iniciar la cámara' });
            scannerInitializedRef.current = false;
            html5QrCodeRef.current = null;
        }
    };

    // Detener escaneo
    const detenerEscaneo = async () => {
        try {
            if (html5QrCodeRef.current) {
                try {
                    // Intentar detener el scanner con timeout de seguridad
                    await Promise.race([
                        html5QrCodeRef.current.stop(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                    ]);
                    console.log('⏹️ Scanner detenido correctamente');
                } catch (stopError) {
                    console.warn('Error al detener scanner (continuando limpieza):', stopError);
                }
                
                // Limpiar referencias y estado SIEMPRE, incluso si stop() falló
                html5QrCodeRef.current = null;
                scannerInitializedRef.current = false;
            }
            
            // Resetear todos los estados (fuera del bloque del scanner para asegurar ejecución)
            setIsScanning(false);
            setQrDetectado(false);
            procesandoQRRef.current = false;
            setMensaje({ tipo: '', texto: '' });
            console.log('✅ Estado de escaneo reseteado completamente');
        } catch (error) {
            console.error('Error crítico al detener escaneo:', error);
            // Forzar reset de estados incluso en error crítico
            setIsScanning(false);
            setQrDetectado(false);
            procesandoQRRef.current = false;
            html5QrCodeRef.current = null;
            scannerInitializedRef.current = false;
        }
    };

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current && isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, [isScanning]);

    // Función compartida para procesar QR (desde cámara o imagen)
    const procesarQRDetectado = (decodedText: string) => {
        // Si ya está procesando un QR, ignorar
        if (procesandoQRRef.current) {
            console.log('❌ Ya se está procesando un QR, ignorando');
            return;
        }

        console.log('✅ QR detectado:', decodedText);

        // Marcar que está procesando
        procesandoQRRef.current = true;

        // Validar formato del QR
        const qrData = validarFormatoQR(decodedText);

        if (!qrData) {
            setMensaje({ tipo: 'error', texto: 'Código QR no válido. Formato incorrecto.' });
            setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
            procesandoQRRef.current = false;
            setProcesandoImagen(false); // Resetear también estado de imagen
            return;
        }

        // Limpiar mensaje de "Procesando imagen..."
        setMensaje({ tipo: '', texto: '' });
        setProcesandoImagen(false);

        // Activar indicador visual
        setQrDetectado(true);

        // Registrar asistencia
        registrarAsistencia(qrData);

        // Resetear el indicador después de 2 segundos
        setTimeout(() => {
            setQrDetectado(false);
        }, 2000);
    };

    // Manejar subida de imagen con QR
    // Lee un QR desde un File usando canvas + jsQR (más confiable que Html5Qrcode.scanFile)
    const leerQRDesdeImagen = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('No se pudo crear contexto canvas'));
                        return;
                    }
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'attemptBoth',
                    });
                    if (code) {
                        resolve(code.data);
                    } else {
                        reject(new Error('No se detectó ningún QR en la imagen'));
                    }
                };
                img.onerror = () => reject(new Error('Error al cargar la imagen'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        
        if (!file) return;

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            setMensaje({ tipo: 'error', texto: 'Por favor selecciona un archivo de imagen válido' });
            setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
            return;
        }

        setProcesandoImagen(true);
        setMensaje({ tipo: 'info', texto: 'Procesando imagen...' });

        try {
            const decodedText = await leerQRDesdeImagen(file);
            console.log('📷 QR leído desde imagen:', decodedText);
            procesarQRDetectado(decodedText);
        } catch (error) {
            console.error('Error al leer QR de la imagen:', error);
            setMensaje({ tipo: 'error', texto: 'No se pudo detectar un código QR en la imagen. Asegúrate de que la imagen sea clara y el QR esté visible.' });
            setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
            setProcesandoImagen(false);
        } finally {
            // Limpiar el input para permitir subir la misma imagen nuevamente
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Abrir selector de archivos
    const abrirSelectorImagen = () => {
        fileInputRef.current?.click();
    };

    
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            <main className="md:ml-64 pt-16 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Título */}
                    <div className="mb-6 mt-6">
                        <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight text-center">
                            REGISTRO DE ASISTENCIA
                        </h1>
                    </div>

                    {/* Contenedor Principal */}
                    <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                        {/* Hora Actual */}
                        <div className="mb-8 text-center">
                            <p className="text-gray-600 text-sm mb-2">HORA ACTUAL: <span className="font-bold text-lg text-blue-800">{horaActual}</span></p>
                            <p className="text-gray-500 text-sm">Muestra tu código QR frente a la cámara para detección automática</p>
                        </div>

                        {/* Selector de Cámara */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Seleccionar Cámara
                            </label>
                            <select
                                value={selectedCamera}
                                onChange={(e) => setSelectedCamera(e.target.value)}
                                disabled={isScanning}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                {cameras.map((camera) => (
                                    <option key={camera.id} value={camera.id}>
                                        {camera.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Área de Escaneo */}
                        <div className="mb-6">
                            <div 
                                id="qr-reader" 
                                className={`w-full rounded-xl overflow-hidden transition-all duration-300 ${
                                    qrDetectado 
                                        ? 'border-4 border-green-500 shadow-lg shadow-green-500/50' 
                                        : 'border-2 border-gray-200'
                                }`}
                                style={{ minHeight: isScanning ? '400px' : '0px' }}
                            ></div>
                            {qrDetectado && (
                                <div className="mt-2 text-center">
                                    <p className="text-green-600 font-bold text-sm flex items-center justify-center gap-2 animate-pulse">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        ¡QR DETECTADO CORRECTAMENTE!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Botones de Control */}
                        <div className="flex gap-4 mb-6">
                            {!isScanning ? (
                                <button
                                    onClick={iniciarEscaneo}
                                    disabled={!selectedCamera || loading}
                                    className="flex-1 bg-blue-800 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    INICIAR ESCANEO QR
                                </button>
                            ) : (
                                <button
                                    onClick={detenerEscaneo}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    DETENER ESCANEO
                                </button>
                            )}
                        </div>

                        {/* Input file oculto */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {/* Botón de Subir Imagen */}
                        <div className="mb-6">
                            <button
                                onClick={abrirSelectorImagen}
                                disabled={loading || procesandoImagen}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {procesandoImagen ? 'PROCESANDO IMAGEN...' : 'SUBIR IMAGEN CON QR'}
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Sube una imagen que contenga un código QR para registrar asistencia
                            </p>
                        </div>

                        {/* Mensajes */}
                        {mensaje.texto && (
                            <div className={`p-4 rounded-xl border ${
                                mensaje.tipo === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                                mensaje.tipo === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                mensaje.tipo === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                                'bg-gray-50 border-gray-200 text-gray-800'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {mensaje.tipo === 'success' && (
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {mensaje.tipo === 'error' && (
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {mensaje.tipo === 'info' && (
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <p className="text-sm font-medium flex-1">{mensaje.texto}</p>
                                </div>
                            </div>
                        )}

                        {/* Loading Spinner */}
                        {loading && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-blue-800">
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                <span className="text-sm font-semibold">Procesando...</span>
                            </div>
                        )}
                    </div>

                    {/* Instrucciones */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h3 className="text-sm font-bold text-blue-900 mb-2">📋 Instrucciones:</h3>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li><strong>Opción 1 - Escaneo en vivo:</strong></li>
                            <li>• Selecciona la cámara de tu dispositivo</li>
                            <li>• Haz clic en "INICIAR ESCANEO QR" para activar la cámara</li>
                            <li>• Muestra tu código QR frente a la cámara</li>
                            <li>• El QR se detectará automáticamente sin necesidad de alinearlo</li>
                            <li className="mt-2"><strong>Opción 2 - Subir imagen:</strong></li>
                            <li>• Haz clic en "SUBIR IMAGEN CON QR"</li>
                            <li>• Selecciona una imagen que contenga tu código QR</li>
                            <li>• El sistema procesará automáticamente la imagen</li>
                            <li className="mt-2"><strong>Importante:</strong> El sistema determinará automáticamente si es entrada o salida</li>
                        </ul>
                    </div>
                </div>

                {/* Modal de Confirmación ENTRADA/SALIDA */}
                {modalConfirmacion.visible && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
                        style={{
                            animation: 'fadeIn 0.2s ease-out'
                        }}
                    >
                        <div 
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-scaleIn"
                            style={{
                                animation: 'scaleIn 0.3s ease-out'
                            }}
                        >
                            {/* Icono y Tipo */}
                            <div className="text-center mb-6">
                                {modalConfirmacion.tipo === 'ENTRADA' ? (
                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
                                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-4 animate-bounce">
                                        <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </div>
                                )}
                                
                                <h2 className={`text-4xl font-black mb-2 ${
                                    modalConfirmacion.tipo === 'ENTRADA' ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                    {modalConfirmacion.tipo}
                                </h2>
                                <p className="text-gray-500 text-sm font-semibold">REGISTRADA EXITOSAMENTE</p>
                            </div>

                            {/* Información del Personal */}
                            <div className="bg-gray-50 rounded-2xl p-6 mb-4">
                                <div className="text-center mb-3">
                                    <p className="text-2xl font-bold text-gray-800">
                                        {modalConfirmacion.datos?.nombres} {modalConfirmacion.datos?.apellidos}
                                    </p>
                                </div>
                                
                                <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
                                    <div className="text-gray-600">
                                        <p className="font-semibold">DNI</p>
                                        <p className="text-lg font-bold text-gray-800">{modalConfirmacion.datos?.dni}</p>
                                    </div>
                                    <div className="text-gray-600 text-right">
                                        <p className="font-semibold">HORA</p>
                                        <p className="text-lg font-bold text-blue-800">{modalConfirmacion.hora}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mensaje de cierre automático */}
                            <div className="text-center">
                                <div className="mb-3 flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm font-bold text-blue-600">Escucha el mensaje de confirmación</p>
                                </div>
                                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    Se cerrará automáticamente al finalizar el audio
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
            
        </div>
    );
}

export default Asistencia;

