import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './components/pages/Login'
import Home from './components/pages/Home'
import NotFound from './components/pages/NotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Configuracion from './components/pages/Configuracion'
import Usuarios from './components/pages/Usuarios'
import Personal from './components/pages/Personal'
import Asistencia from './components/pages/Asistencia'
import ReporteAsistencia from './components/pages/ReporteAsistencia'
import Cargos from './components/pages/DatosMaestros/Cargos'
import Distritos from './components/pages/DatosMaestros/Distritos'
import InstitucionesEducativas from './components/pages/DatosMaestros/InstitucionesEducativas'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'))

  const handleLoginSuccess = (token) => {
    setIsAuthenticated(true)
    
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Ruta de Login sin Navbar ni Footer */}
          <Route 
            path="/login" 
            element={<Login onLoginSuccess={handleLoginSuccess} />} 
          />
          

          {/* Redirección de la ruta principal a /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas del Dashboard - Protegidas */}
          <Route 
            path="/dashboard/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/configuracion" 
            element={
              <ProtectedRoute>
                <Configuracion />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/usuarios" 
            element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/personal" 
            element={
              <ProtectedRoute>
                <Personal />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/asistencia" 
            element={
              <ProtectedRoute>
                <Asistencia />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/reporte-asistencia" 
            element={
              <ProtectedRoute>
                <ReporteAsistencia />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/datos-maestros/cargos" 
            element={
              <ProtectedRoute>
                <Cargos />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/datos-maestros/distritos" 
            element={
              <ProtectedRoute>
                <Distritos />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/datos-maestros/instituciones" 
            element={
              <ProtectedRoute>
                <InstitucionesEducativas />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta 404 - Debe estar al final */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
