import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Lock, Loader2, X, ShieldCheck } from 'lucide-react'

const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com/api'

export function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    checkExistingToken()
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

  // 1. Loader inicial (Verificando se já está logado)
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  // 2. SE NÃO ESTIVER LOGADO E O MODAL ESTIVER ATIVO (#admin)
  // Mostramos APENAS o login (Site some do fundo)
  if (!isAuthenticated && showModal) {
    return (
      <div className="fixed inset-0 z-[10000] bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Botão para desistir e voltar pro site */}
            <button 
              onClick={() => { window.location.hash = ''; }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <div className="bg-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Lock className="h-10 w-10 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Área Restrita</h2>
              <p className="text-slate-400 mt-2">Identifique-se para gerenciar a Quanton3D</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha Administrativa"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white h-14 text-center text-xl focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-center text-sm font-bold">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-900/20" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                {isLoggingIn ? 'Autenticando...' : 'Acessar Agora'}
              </Button>
            </form>
            
            <p className="text-center text-slate-600 text-xs mt-8 uppercase tracking-widest font-medium">
              Segurança Criptografada JWT
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 3. RETORNO NORMAL (Site visível)
  // Se estiver logado, mostra o site + painel. Se não, mostra só o site.
  return typeof children === 'function' ? children({ 
    onLogout: () => {
      localStorage.removeItem('quanton3d_jwt_token');
      setIsAuthenticated(false);
    }, 
    isAuthenticated 
  }) : children
}