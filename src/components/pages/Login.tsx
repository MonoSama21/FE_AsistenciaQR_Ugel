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
      const response = await axios.post(import.meta.env.VITE_API_URL + "/novios/login", {
        email,
        password
      });

      // Guardar token en localStorage
      const token = response.data.token || response.data.access_token;
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', email);
      
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
      className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-red-300 from-red-200 via-red-50 to-white"
      style={{
        backgroundColor: '#ffe0da',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='96' viewBox='0 0 60 96'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23f99393' fill-opacity='0.39'%3E%3Cpath d='M36 10a6 6 0 0 1 12 0v12a6 6 0 0 1-6 6 6 6 0 0 0-6 6 6 6 0 0 1-12 0 6 6 0 0 0-6-6 6 6 0 0 1-6-6V10a6 6 0 1 1 12 0 6 6 0 0 0 12 0zm24 78a6 6 0 0 1-6-6 6 6 0 0 0-6-6 6 6 0 0 1-6-6V58a6 6 0 1 1 12 0 6 6 0 0 0 6 6v24zM0 88V64a6 6 0 0 0 6-6 6 6 0 0 1 12 0v12a6 6 0 0 1-6 6 6 6 0 0 0-6 6 6 6 0 0 1-6 6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="flex-1 flex items-center justify-center bg-transparent md:py-0 py-8">
        <img
          src="../src/assets/img/foto.png"
          alt="Animación pareja"
          className="max-w-[60%] md:max-w-[80%] h-auto animate-float mx-auto"
        />
      </div>
      <div className="flex-1 flex items-center justify-center bg-white md:rounded-l-[500px] md:rounded-t-none rounded-t-3xl shadow-lg md:shadow-lg shadow-xl md:mx-0 mx-4 md:my-0 my-4">
        <div className="w-full max-w-[95vw] md:max-w-[500px] p-4 md:p-12 rounded-2xl md:rounded-3xl shadow-2xl bg-white text-base md:text-xl">
                      <h2 className="text-center mb-6 text-red-400 font-bold text-2xl">BIENVENIDO</h2>

          <h1 className="text-center mb-6 text-black-500 text-base md:text-xl">Ingresa tus credenciales para registrar bellos recuerdos</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label htmlFor="email" className="block mb-1 text-red-500 font-medium">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {/* Heroicon: Envelope */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.876 1.797l-7.5 5.625a2.25 2.25 0 01-2.748 0l-7.5-5.625A2.25 2.25 0 012.25 6.993V6.75" />
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-red-400 rounded-lg outline-none text-base mb-1 focus:border-2 focus:border-red-500 transition"
                  placeholder="Correo Electrónico"
                  required
                />
              </div>
            </div>
            <div className="mb-5">
              <label htmlFor="password" className="block mb-1 text-red-500 font-medium">Contraseña</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {/* Heroicon: Lock Closed */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m12 0A2.25 2.25 0 0121 12.75v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5h13.5z" />
                  </svg>
                </span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-red-400 rounded-lg outline-none text-base mb-1 focus:border-2 focus:border-red-500 transition"
                  placeholder="Contraseña"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-base md:text-xl"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-500 px-4 py-2 rounded mb-4 mt-5 text-center">
              {error}
            </div>
          )}
          </form>
        </div>
      </div>
      {/* Animación personalizada para la imagen */}
      <style>{`
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
