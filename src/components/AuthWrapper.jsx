import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Lock, Loader2 } from 'lucide-react'

const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'

export function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    checkExistingToken()
  }, [])

  const checkExistingToken = async () => {
    try {
      const token = localStorage.getItem('quanton3d_jwt_token')
      if (!token) {
        setIsLoading(false)
        return
      }
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
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
    } catch (err) {
      localStorage.removeItem('quanton3d_jwt_token')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!password) {
      setError('Informe a senha administrativa')
      return
    }
    setIsLoggingIn(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await response.json()
      if (data.success && data.token) {
        localStorage.setItem('quanton3d_jwt_token', data.token)
        try {
          window.dispatchEvent(new Event('quanton3d:admin-login'))
        } catch (dispatchError) {
          console.debug('Falha ao disparar evento de login:', dispatchError)
        }
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setError(data.error || 'Senha incorreta')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('quanton3d_jwt_token')
    try {
      window.dispatchEvent(new Event('quanton3d:admin-logout'))
    } catch (dispatchError) {
      console.debug('Falha ao disparar evento de logout:', dispatchError)
    }
    setIsAuthenticated(false)
    setPassword('')
    setError('')
  }

  // TELA DE CARREGAMENTO
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Verificando autenticação...
          </p>
        </div>
      </div>
    )
  }

  // TELA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Lock className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Digite sua senha para acessar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                type="password"
                placeholder="Senha administrativa"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                disabled={isLoggingIn}
                autoComplete="current-password"
                autoFocus
              />

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-950/50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn || !password}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : 'Entrar'}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
              Sistema protegido por autenticação JWT
            </p>
          </div>
        </div>
      </div>
    )
  }

  return children({ onLogout: handleLogout })
}
