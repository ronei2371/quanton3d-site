import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Lock, Loader2, X } from 'lucide-react'

const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com/api'

export function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  // ✅ NOVO: Estado para saber se o usuário QUER ver o admin agora
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  useEffect(() => {
    // Verifica se já tem token
    checkExistingToken()

    // ✅ Detecção automática: Se a URL tiver #admin, abre o login
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setShowAdminLogin(true)
      }
    }
    
    handleHashChange() // Checa ao carregar
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
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
      
      if (!response.ok) throw new Error()
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
    if (!password) { setError('Informe a senha'); return }
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
        setPassword('')
        setShowAdminLogin(false) // Fecha o modal após logar
      } else {
        setError(data.error || 'Senha incorreta')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const closeLogin = () => {
    setShowAdminLogin(false)
    window.location.hash = '' // Limpa o #admin da URL
  }

  // 1. Se estiver carregando o token inicial, mostra um loader discreto
  if (isLoading) return null 

  // 2. Se o usuário NÃO está logado E NÃO clicou em Admin, mostra o site normal
  if (!isAuthenticated && !showAdminLogin) {
    return typeof children === 'function' ? children({ onLogout: () => setIsAuthenticated(false) }) : children
  }

  // 3. TELA DE LOGIN (Só aparece se showAdminLogin for true e não estiver logado)
  if (!isAuthenticated && showAdminLogin) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 relative">
          
          {/* Botão para fechar o login e voltar para o site */}
          <button 
            onClick={closeLogin}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>

          <div className="text-center mb-8">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Área do Administrador</h2>
            <p className="text-gray-500 text-sm mt-1">Identifique-se para gerenciar o site</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 text-center text-lg"
              autoFocus
            />
            {error && <p className="text-red-600 text-xs text-center font-bold">{error}</p>}
            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold" disabled={isLoggingIn}>
              {isLoggingIn ? 'Verificando...' : 'Entrar no Painel'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // 4. Se estiver logado, mostra o conteúdo protegido
  return typeof children === 'function' ? children({ onLogout: () => {
    localStorage.removeItem('quanton3d_jwt_token')
    setIsAuthenticated(false)
  } }) : children
}