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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await response.json()
      if (data.success && data.token) {
        localStorage.setItem('quanton3d_jwt_token', data.token)
        try { window.dispatchEvent(new Event('quanton3d:admin-login')) } catch {}
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
    try { window.dispatchEvent(new Event('quanton3d:admin-logout')) } catch {}
    setIsAuthenticated(false)
    setPassword('')
    setError('')
  }

  if (isLoading) {
    return (
      

        

          
          
Verificando autenticação...


        

      

    )
  }

  if (!isAuthenticated) {
    return (
      

        

          

            

              
            

            
Painel Administrativo

            
Digite sua senha para acessar


          

          

            
••••••••••
 setPassword(e.target.value)}
              className="w-full"
              disabled={isLoggingIn}
              autoComplete="current-password"
              autoFocus
            />
            {error && (
              

                
{error}


              

            )}
            
              {isLoggingIn ? (
                <>Entrando...
              ) : 'Entrar'}
            
          

          

            Sistema protegido por autenticação JWT
          


        

      

    )
  }

  return children({ onLogout: handleLogout })
}