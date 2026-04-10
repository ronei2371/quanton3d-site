import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Lock, Loader2 } from 'lucide-react'

// ✅ Adicionando o /api no final para bater com o novo padrão do Bot
const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com/api'

export function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => { checkExistingToken() }, [])

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
    if (!password) { setError('Informe a senha administrativa'); return }
    setIsLoggingIn(true)
    try {
      // ✅ Agora chamando /api/auth/login corretamente
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
      } else {
        setError(data.error || 'Senha incorreta')
      }
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('quanton3d_jwt_token')
    setIsAuthenticated(false)
  }

  // ✅ TELA DE CARREGAMENTO (Print 3 pode estar travado aqui se o fetch falhar)
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center border">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Autenticando na Quanton3D...</p>
        </div>
      </div>
    )
  }

  // ✅ TELA DE LOGIN (Print 2)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Acesso Restrito</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Painel Administrativo Quanton3D</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha mestra"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 text-lg text-center"
              disabled={isLoggingIn}
              autoFocus
            />
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100 font-bold">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg" disabled={isLoggingIn}>
              {isLoggingIn ? 'Verificando...' : 'Acessar Painel'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // ✅ RETORNO SEGURO — Evita o erro de "not a function"
  return typeof children === 'function' ? children({ onLogout: handleLogout }) : children
}