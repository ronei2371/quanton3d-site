import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Lock, Loader2, X, ShieldCheck, HardDrive } from 'lucide-react'

const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com/api'

export function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  useEffect(() => {
    checkExistingToken()
    
    // ✅ Verifica se o Batman quer entrar na Bat-caverna (#admin)
    const checkHash = () => {
      const isTryingAdmin = window.location.hash === '#admin'
      setIsAdminMode(isTryingAdmin)
    }

    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
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
    if (!password) { setError('A senha é obrigatória'); return }
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
        window.location.hash = '' // ✅ Limpa o rádio para mostrar o site
      } else {
        setError(data.error || 'Senha inválida')
      }
    } catch {
      setError('Erro de conexão com o Bot')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // 1. Tela de Carregamento (O Bat-computador ligando)
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-blue-500">
        <Loader2 className="h-16 w-16 animate-spin mb-4" />
        <p className="font-mono tracking-widest animate-pulse">VERIFICANDO CREDENCIAIS...</p>
      </div>
    )
  }

  // 2. MODO ADMIN ATIVO E NÃO LOGADO: Mostra APENAS o login (O Site não existe aqui)
  if (isAdminMode && !isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 z-[99999]">
        <div className="w-full max-w-md">
          {/* O Card de Login */}
          <div className="bg-slate-900 border-2 border-blue-900/50 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Efeito Visual de Fundo */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
            
            <button 
              onClick={() => { window.location.hash = ''; }}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>

            <div className="text-center mb-10">
              <div className="bg-blue-600/20 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 rotate-3">
                <Lock className="h-12 w-12 text-blue-500 -rotate-3" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Área Restrita</h2>
              <p className="text-slate-400 font-medium">Acesso exclusivo Quanton3D</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black border-slate-700 text-white h-16 text-center text-3xl tracking-[0.5em] focus:border-blue-500 rounded-xl"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-500 p-4 rounded-xl text-center text-sm font-bold animate-shake">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xl rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="animate-spin mr-3" /> : <ShieldCheck className="mr-3" />}
                {isLoggingIn ? 'PROCESSANDO...' : 'ENTRAR NO SISTEMA'}
              </Button>
            </form>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-600 text-[10px] uppercase tracking-[0.2em]">
              <HardDrive size={12} />
              <span>Servidor Localizado em MG</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 3. MODO NORMAL (O Site limpo que o cliente vê)
  // Ou o Painel Administrativo caso já esteja logado
  return typeof children === 'function' ? children({ 
    onLogout: () => {
      localStorage.removeItem('quanton3d_jwt_token');
      setIsAuthenticated(false);
    }, 
    isAuthenticated 
  }) : children
}