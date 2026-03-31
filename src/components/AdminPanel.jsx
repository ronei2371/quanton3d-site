// src/components/AdminPanel.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, Button, Input } from './ui' // ajuste se seus componentes tiverem outro caminho
// ... outros imports que seu projeto usar

// garantir export com nome correto esperado pelo App.jsx
export function AdminPanel({ onClose }) {
  const defaultAdminUsername = process.env.VITE_ADMIN_USERNAME || ''
  const autoAdminUsername = '' // se tiver alguma lógica para recuperar automaticamente, coloque aqui
  const [username, setUsername] = useState(defaultAdminUsername || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [customApiBaseInput, setCustomApiBaseInput] = useState('')
  const [adminSecret, setAdminSecret] = useState('')
  const [showAdvancedLogin, setShowAdvancedLogin] = useState(false)

  // base da API — preferir VITE_API_URL se definido
  const envApiBase = process.env.VITE_API_URL || ''
  const resolvedBaseRaw = customApiBaseInput || envApiBase || window.__API_BASE__ || ''
  // buildAdminUrl: remove repetição de /api
  const baseApi = useMemo(() => {
    if (!resolvedBaseRaw) return ''
    return resolvedBaseRaw.replace(/\/api\/?$/, '') // garante não ter /api no final
  }, [resolvedBaseRaw])

  function buildAdminUrl(path) {
    // path pode vir com /api/contacts ou /contacts
    let clean = path.replace(/^\/+/, '') // remove leading slash
    // sempre montar com uma única /api no início
    return `${baseApi}/api/${clean}`
  }

  async function handleLogin() {
    try {
      setLoading(true)
      const userToSend = username || defaultAdminUsername || ''
      const res = await fetch(`${baseApi}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userToSend, password })
      })
      if (!res.ok) {
        const txt = await res.text()
        setLoading(false)
        alert('Erro no login: ' + (txt || res.status))
        return
      }
      const json = await res.json()
      setIsAuthenticated(true)
      setAdminToken(json.token || json.accessToken || '')
      setLoading(false)
      console.log('Login ok')
    } catch (err) {
      setLoading(false)
      console.error('login error', err)
      alert('Erro de conexão no login')
    }
  }

  // logout simples
  function handleLogout() {
    setIsAuthenticated(false)
    setAdminToken('')
    setPassword('')
  }

  // ----- INTERNAL GALLERY TAB (simplificado) -----
  function InternalGalleryTab({ initialPhotos = [] }) {
    const [photos, setPhotos] = useState(initialPhotos)
    const [loadingPhotos, setLoadingPhotos] = useState(false)

    useEffect(() => {
      // se quiser buscar inicialmente, faça fetch aqui
      if (!initialPhotos || initialPhotos.length === 0) {
        fetchPhotos()
      }
    }, [])

    async function fetchPhotos() {
      try {
        setLoadingPhotos(true)
        const res = await fetch(buildAdminUrl('/gallery'), {
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
        })
        if (!res.ok) throw new Error('Erro ao buscar galeria')
        const data = await res.json()
        setPhotos(data || [])
        setLoadingPhotos(false)
      } catch (err) {
        console.error(err)
        setLoadingPhotos(false)
      }
    }

    // actionType: 'delete' | 'approve'
    async function handleAction(actionType, id) {
      try {
        if (!id) return
        const method = actionType === 'delete' ? 'DELETE' : 'PUT'
        const url = actionType === 'delete' ? buildAdminUrl(`/gallery/${id}`) : buildAdminUrl(`/gallery/${id}/approve`)
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
          },
          body: actionType === 'delete' ? null : JSON.stringify({ approved: true })
        })
        if (!res.ok) {
          const txt = await res.text()
          console.error('Falha na ação', txt)
          alert('Erro ao executar ação: ' + res.status)
          return
        }
        // sucesso: atualizar estado para remover a foto imediatamente
        if (actionType === 'delete') {
          setPhotos(prev => prev.filter(p => String(p._id || p.id) !== String(id)))
        } else {
          // approve: atualizar foto aprovada localmente (se precisar)
          setPhotos(prev => prev.map(p => (String(p._id || p.id) === String(id) ? { ...p, approved: true } : p)))
        }
      } catch (err) {
        console.error(err)
        alert('Erro ao executar ação na galeria')
      }
    }

    return (
      <div>
        <div className="flex gap-2 mb-4">
          <Button onClick={fetchPhotos}>Recarregar Galeria</Button>
        </div>
        {loadingPhotos ? <div>Carregando...</div> : (
          <div className="grid grid-cols-4 gap-3">
            {photos.map(photo => (
              <div key={photo._id || photo.id} className="border p-2">
                <img src={photo.url} alt={photo.title || 'foto'} className="w-full h-40 object-cover" />
                <div className="mt-2 flex gap-2">
                  <Button onClick={() => handleAction('approve', photo._id || photo.id)}>Aprovar</Button>
                  <Button onClick={() => {
                    if (confirm('Confirmar exclusão?')) handleAction('delete', photo._id || photo.id)
                  }} className="bg-red-600">Deletar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ----- RENDER LOGIN / PAINEL -----
  if (!isAuthenticated) {
    const hasAutoUser = Boolean(defaultAdminUsername || autoAdminUsername)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full space-y-4">
          <h2 className="text-2xl font-bold text-center">Painel Administrativo</h2>
          <div className="space-y-3">
            {/* Se já temos o usuário no sistema, mostramos só a senha */}
            {!hasAutoUser && (
              <Input type="text" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
            )}
            <Input type="password" placeholder="Digite sua Senha" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
            <Button onClick={handleLogin} disabled={loading || !password} className="w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <button type="button" className="text-xs text-gray-500 w-full text-center" onClick={() => setShowAdvancedLogin(!showAdvancedLogin)}>
              Configurações de Conexão
            </button>

            {showAdvancedLogin && (
              <div className="p-2 border rounded text-xs space-y-2">
                <Input placeholder="URL Backend" value={customApiBaseInput} onChange={(e) => setCustomApiBaseInput(e.target.value)} />
                <Input placeholder="Secret Key" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} />
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // painel autenticado — aqui renderize abas: parametros, mensagens, formulas, galeria etc.
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <div>
          <Button onClick={handleLogout}>Sair</Button>
        </div>
      </div>

      {/* exemplo: internamente renderizar a InternalGalleryTab */}
      <div>
        <InternalGalleryTab />
      </div>
    </div>
  )
}

export default AdminPanel
