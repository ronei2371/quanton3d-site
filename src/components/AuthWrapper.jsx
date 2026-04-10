import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Lock, Loader2, X } from 'lucide-react'

// ✅ Alinhado com o novo padrão do Bot (/api/auth)
const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com/api'

export function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  // ✅ Controle do Modal (janela flutuante)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    checkExistingToken()

    // ✅ Só abre o login se a URL tiver #admin
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setShowModal(true)
      } else {
        setShowModal(false)
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const checkExistingToken = async () => {
    try {
      const token = localStorage.getItem('quanton3d_jwt_token')
      if (!token) { setIsLoading(false); return }
      
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      
      const data = await response.json()
      if (data.success && data.valid) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('quanton3d_jwt_token')
      }
    } catch {
      localStorage.removeItem('quanton3d_jwt_token')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setError('')
    if (!password) { setError('Digite a senha'); return }
    setIsLoggingIn(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const data = await response.json()
      if (data.success && data.token) {
        localStorage.setItem('quanton3d_jwt_token', data.token)
        setIsAuthenticated(true)
        setShowModal(false)
        window.location.hash = '' 
      } else {
        setError(data.error || 'Senha incorreta')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('quanton3d_jwt_token')
    setIsAuthenticated(false)
    window.location.hash = ''
  }

  // Renderiza o site no fundo SEMPRE
  const content = typeof children === 'function' 
    ? children({ onLogout: handleLogout, isAuthenticated }) 
    : children

  return (
    <>
      {/* O SITE SEMPRE FICA AQUI NO FUNDO */}
      {content}

      {/* JANELA DE LOGIN (Só aparece se showModal for true E não estiver logado) */}
      {!isAuthenticated && showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Fundo escurecido que fecha ao clicar */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => { setShowModal(false); window.location.hash = ''; }}
          />
          
          {/* Caixa de Login Branca */}
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => { setShowModal(false); window.location.hash = ''; }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>

            <div className="text-center mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Área Administrativa</h2>
              <p className="text-gray-500 text-sm">Quanton3D - Acesso Restrito</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Senha de administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 text-center text-lg"
                autoFocus
              />
              {error && <p className="text-red-600 text-xs text-center font-bold">{error}</p>}
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-white" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Entrar no Painel'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}