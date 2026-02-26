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
          
          {/* Ruta 404 - Debe estar al final */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
