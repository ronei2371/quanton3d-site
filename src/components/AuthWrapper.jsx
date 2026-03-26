import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Lock, Loader2, Settings2 } from 'lucide-react'

const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'
const DEFAULT_ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
const DEFAULT_ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET_OVERRIDE || import.meta.env.VITE_ADMIN_SECRET || ''

export function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState(() => localStorage.getItem('quanton3d_admin_username') || DEFAULT_ADMIN_USERNAME)
  const [password, setPassword] = useState('')
  const [adminSecret, setAdminSecret] = useState(DEFAULT_ADMIN_SECRET)
  const [showAdvanced, setShowAdvanced] = useState(false)
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
      setIsAuthenticated(true)
    } catch (_err) {
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
      const trimmedSecret = adminSecret.trim()
      const trimmedUsername = username.trim() || DEFAULT_ADMIN_USERNAME
      const payload = trimmedSecret ? { password } : { username: trimmedUsername, password }
      const headers = { 'Content-Type': 'application/json' }
      if (trimmedSecret) headers['x-admin-secret'] = trimmedSecret

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => ({}))
      if (data.success && data.token) {
        localStorage.setItem('quanton3d_jwt_token', data.token)
        localStorage.setItem('quanton3d_admin_username', trimmedUsername)
        try { window.dispatchEvent(new Event('quanton3d:admin-login')) } catch (_err) {}
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setError(data.error || 'Senha incorreta')
      }
    } catch (err) {
      console.error('Erro no login:', err)
      setError('Erro ao conectar com o servidor')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('quanton3d_jwt_token')
    try { window.dispatchEvent(new Event('quanton3d:admin-logout')) } catch (_err) {}
    setIsAuthenticated(false)
    setPassword('')
    setError('')
  }

  const currentToken = localStorage.getItem('quanton3d_jwt_token') || ''

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Lock className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Digite a senha uma única vez para acessar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Senha do painel"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              disabled={isLoggingIn}
              autoComplete="current-password"
              autoFocus
            />

            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              {showAdvanced ? 'Ocultar opções avançadas' : 'Mostrar opções avançadas'}
            </button>

            {showAdvanced && (
              <div className="space-y-3 rounded-lg border p-3">
                <Input
                  type="text"
                  placeholder="Usuário administrativo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  disabled={isLoggingIn}
                  autoComplete="username"
                />
                <Input
                  type="text"
                  placeholder="Secret (opcional)"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full"
                  disabled={isLoggingIn}
                  autoComplete="off"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoggingIn || !password}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return children({ onLogout: handleLogout, adminToken: currentToken })
}
