import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Lock, Loader2, Settings2 } from 'lucide-react'

const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'
const DEFAULT_ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
const DEFAULT_ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET_OVERRIDE || import.meta.env.VITE_ADMIN_SECRET || ''

export function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState(DEFAULT_ADMIN_USERNAME)
  const [adminSecret, setAdminSecret] = useState(DEFAULT_ADMIN_SECRET)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('quanton3d_jwt_token')
    if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!password.trim()) {
      setError('Informe a senha administrativa.')
      return
    }

    setIsLoggingIn(true)
    try {
      const trimmedSecret = adminSecret.trim()
      const finalUsername = (username || DEFAULT_ADMIN_USERNAME).trim() || DEFAULT_ADMIN_USERNAME
      const headers = { 'Content-Type': 'application/json' }
      const payload = trimmedSecret
        ? { password: password.trim() }
        : { username: finalUsername, password: password.trim() }

      if (trimmedSecret) {
        headers['x-admin-secret'] = trimmedSecret
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.token) {
        throw new Error(data?.error || 'Credenciais inválidas')
      }

      localStorage.setItem('quanton3d_jwt_token', data.token)
      try { window.dispatchEvent(new Event('quanton3d:admin-login')) } catch (_err) {}
      setPassword('')
      setIsAuthenticated(true)
    } catch (err) {
      console.error('Erro no login admin:', err)
      setError(err.message || 'Erro ao conectar com o servidor')
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

  const adminToken = localStorage.getItem('quanton3d_jwt_token') || ''

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="rounded-xl bg-white p-8 shadow-xl">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Painel Administrativo</h2>
            <p className="mt-2 text-sm text-gray-600">Digite a senha uma única vez para acessar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Senha do painel"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              disabled={isLoggingIn}
            />

            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Settings2 className="h-4 w-4" />
              {showAdvanced ? 'Ocultar opções avançadas' : 'Mostrar opções avançadas'}
            </button>

            {showAdvanced && (
              <div className="space-y-3 rounded-xl border p-3">
                <Input
                  type="text"
                  placeholder="Usuário administrativo (padrão: admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={isLoggingIn}
                />
                <Input
                  type="text"
                  placeholder="Secret (opcional)"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  autoComplete="off"
                  disabled={isLoggingIn}
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoggingIn || !password.trim()}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return children({ onLogout: handleLogout, adminToken })
}

export default AuthWrapper
