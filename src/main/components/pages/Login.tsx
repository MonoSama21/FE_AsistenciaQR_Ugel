import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + "/usuarios/login", {
        email,
        password
      });

      // Guardar token y datos del usuario en localStorage
      const token = response.data.token || response.data.access_token;
      const usuario = response.data.usuariologeado;
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', usuario?.email || email);
      localStorage.setItem('userName', usuario?.nombre || '');
      localStorage.setItem('userRol', usuario?.rol || '');
      localStorage.setItem('userId', usuario?.id?.toString() || '');
      
      // Notificar al componente padre
      onLoginSuccess(token);
      
      // Redirigir a dashboard/home
      navigate('/dashboard/home');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      console.error('Error de login:', err);
    } finally {
      setLoading(false);
    }
  };

   

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/dvrsdqsl1/image/upload/v1772813163/fondo_c5fpdp.jpg')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left',
      }}
    >
      {/* Panel izquierdo desktop - información institucional */}
      <div className="hidden md:flex md:flex-1 items-center justify-center bg-blue-950/70 backdrop-blur-sm">
        <div className="text-center px-12">
          <img src="https://res.cloudinary.com/dvrsdqsl1/image/upload/v1772813164/logoGP_c0bsos.png" alt="Logo UGEL" className="w-36 h-36 object-contain mx-auto mb-8 drop-shadow-2xl" />
          <h1 className="text-white font-extrabold text-4xl leading-tight mb-4 drop-shadow-lg">
            SIAQR UGEL<br />CHINCHA
          </h1>
          <p className="text-blue-200 text-lg font-medium mb-8">
            Sistema de Asistencia con<br />Código QR
          </p>
          <div className="flex items-center justify-center gap-3 bg-white/10 rounded-2xl px-6 py-4 border border-white/20">
            <svg className="w-6 h-6 text-blue-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-blue-100 text-sm">Acceso seguro y controlado</span>
          </div>
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div className="flex-1 flex items-center justify-center py-10 md:py-0 bg-white/10 md:bg-white backdrop-blur-sm md:backdrop-blur-none md:shadow-2xl">
        <div className="w-full max-w-[95vw] md:max-w-[440px] p-6 md:p-12">

          {/* Logo solo en mobile */}
          <img src="https://res.cloudinary.com/dvrsdqsl1/image/upload/v1772813164/logoGP_c0bsos.png" alt="Logo" className="w-24 h-24 object-contain mx-auto mb-6 md:hidden drop-shadow-lg" />

          {/* Header del formulario */}
          <div className="mb-8 text-center md:text-left">
            <div className="hidden md:flex items-center gap-3 mb-2">
              <img src="https://res.cloudinary.com/dvrsdqsl1/image/upload/v1772813164/logoGP_c0bsos.png" alt="Logo" className="w-10 h-10 object-contain" />
              <span className="text-blue-800 font-bold text-sm uppercase tracking-widest">UGEL Chincha</span>
            </div>
            <h2 className="text-3xl font-extrabold text-blue-900 mb-2">Bienvenido</h2>
            <p className="text-gray-500 text-sm">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1.5 text-blue-900 font-semibold text-sm">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.876 1.797l-7.5 5.625a2.25 2.25 0 01-2.748 0l-7.5-5.625A2.25 2.25 0 012.25 6.993V6.75" />
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-1.5 text-blue-900 font-semibold text-sm">Contraseña</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m12 0A2.25 2.25 0 0121 12.75v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5h13.5z" />
                  </svg>
                </span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-800/30 hover:shadow-xl hover:shadow-blue-800/40 text-sm tracking-wide mt-2"
              id='btn-login'
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : 'Iniciar Sesión'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center" id="error-message">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
