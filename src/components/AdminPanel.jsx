// src/components/AdminPanel.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, Button, Input } from './ui' // ajuste conforme sua lib de componentes
// se você não usa esses componentes, substitua por tags HTML simples

/* AdminPanel.jsx - Correções:
   - adiciona useMemo importado
   - export function AdminPanel({ onClose }) { ... } (export nomeado)
   - buildAdminUrl limpa /api duplicado
   - login "inteligente": esconde input de usuário se VITE_ADMIN_USERNAME presente
   - InternalGalleryTab: DELETE chama API corretamente e remove foto do estado imediatamente
*/

export function AdminPanel({ onClose }) {
  const envBase = import.meta.env?.VITE_API_URL || ''
  const defaultAdminUsername = import.meta.env?.VITE_ADMIN_USERNAME || ''
  const [customApiBase, setCustomApiBase] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || '')
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(adminToken))
  const [photos, setPhotos] = useState([])
  const [activeTab, setActiveTab] = useState('metrics')
  const [messages, setMessages] = useState([])
  const [formulations, setFormulations] = useState([])

  // buildAdminUrl: limpa duplicação /api/api e aceita base customizada
  const buildAdminUrl = useCallback((path = '') => {
    // prefer customApiBase (campo de debug) -> envBase -> fallback empty
    let base = (customApiBase || envBase || '').trim()
    // remove trailing / e normalize
    base = base.replace(/\/+$/, '')
    // se já acabou com /api, remova para não duplicar
    base = base.replace(/\/api$/i, '')
    // agora montar URL final garantindo /api sozinho
    const apiPrefix = base ? `${base}/api` : '/api'
    // limpar path leading slashes
    const cleanPath = path.replace(/^\/+/, '')
    return `${apiPrefix}/${cleanPath}`
  }, [customApiBase, envBase])

  // wrapper fetch com auth
  const apiFetch = useCallback(async (path, opts = {}) => {
    const url = buildAdminUrl(path)
    const headers = new Headers(opts.headers || {})
    if (adminToken) headers.set('Authorization', `Bearer ${adminToken}`)
    headers.set('Accept', 'application/json')
    if (opts.body && !(opts.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }
    const res = await fetch(url, { ...opts, headers })
    // se 401 -> logout automático
    if (res.status === 401) {
      setIsAuthenticated(false)
      setAdminToken('')
      localStorage.removeItem('admin_token')
      throw new Error('Unauthorized')
    }
    const text = await res.text()
    try { return JSON.parse(text) } catch { return text }
  }, [adminToken, buildAdminUrl])

  // login: usa /auth/login para obter JWT
  const handleLogin = async () => {
    setLoading(true)
    try {
      const body = { password }
      // se usuario for exigido e não estiver pré-configurado
      if (!defaultAdminUsername && !import.meta.env?.VITE_ADMIN_USERNAME) {
        body.username = username
      } else {
        // se já existe VITE_ADMIN_USERNAME, backend normalmente só precisa da senha
        body.username = defaultAdminUsername || username
      }
      const resp = await fetch(buildAdminUrl('auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!resp.ok) {
        const t = await resp.text()
        throw new Error(t || `Login failed: ${resp.status}`)
      }
      const data = await resp.json()
      const token = data?.token || data?.accessToken || data?.jwt
      if (!token) throw new Error('Token não recebido')
      localStorage.setItem('admin_token', token)
      setAdminToken(token)
      setIsAuthenticated(true)
    } catch (err) {
      console.error('Login erro:', err)
      alert('Falha no login: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  // Logoff simples
  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setAdminToken('')
    setIsAuthenticated(false)
  }

  // Carregamento de métricas / messages / formulations
  const loadMetrics = useCallback(async () => {
    try {
      // Exemplo: /admin/metrics ou /contacts?range=...
      const data = await apiFetch('contacts') // ajuste conforme endpoint real
      // trate como precisar; aqui só um exemplo curto
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('loadMetrics erro', err)
    }
  }, [apiFetch])

  const loadMessages = useCallback(async () => {
    try {
      const data = await apiFetch('messages?limit=200')
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('loadMessages erro', err)
    }
  }, [apiFetch])

  const loadFormulations = useCallback(async () => {
    try {
      const data = await apiFetch('formulations?limit=200')
      setFormulations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('loadFormulations erro', err)
    }
  }, [apiFetch])

  const loadGallery = useCallback(async () => {
    try {
      const data = await apiFetch('gallery?limit=200')
      setPhotos(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('loadGallery erro', err)
    }
  }, [apiFetch])

  // botão atualizar: atualiza conforme aba ativa
  const handleRefresh = useCallback(() => {
    if (activeTab === 'metrics') loadMetrics()
    if (activeTab === 'messages') loadMessages()
    if (activeTab === 'formulations') loadFormulations()
    if (activeTab === 'gallery') loadGallery()
  }, [activeTab, loadMetrics, loadMessages, loadFormulations, loadGallery])

  // quando autentica, carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated) {
      handleRefresh()
    }
  }, [isAuthenticated, handleRefresh])

  // InternalGalleryTab: aprovar/deletar
  function InternalGalleryTab() {
    const [processingId, setProcessingId] = useState(null)

    // handle delete (hard delete)
    const handleDelete = async (id) => {
      if (!confirm('Confirmar exclusão permanente desta foto?')) return
      setProcessingId(id)
      try {
        // rota DELETE /gallery/:id
        await apiFetch(`gallery/${id}`, { method: 'DELETE' })
        // remover imediatamente do estado sem recarregar tudo
        setPhotos(prev => prev.filter(p => (p?._id || p?.id) !== id))
      } catch (err) {
        console.error('Erro ao deletar foto', err)
        alert('Erro ao deletar: ' + (err.message || err))
      } finally {
        setProcessingId(null)
      }
    }

    // handle approve (exemplo: PUT /gallery/:id/approve)
    const handleApprove = async (id) => {
      setProcessingId(id)
      try {
        await apiFetch(`gallery/${id}/approve`, { method: 'PUT' })
        // atualizar item localmente (marcar status)
        setPhotos(prev => prev.map(p => {
          if ((p?._id || p?.id) === id) return { ...p, approved: true }
          return p
        }))
      } catch (err) {
        console.error('Erro ao aprovar foto', err)
        alert('Erro ao aprovar: ' + (err.message || err))
      } finally {
        setProcessingId(null)
      }
    }

    return (
      <div>
        <div className="flex gap-2 mb-4">
          <Button onClick={loadGallery}>Recarregar Galeria</Button>
          <Button onClick={() => { setPhotos([]); loadGallery() }}>Forçar reload</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {photos?.length ? photos.map(photo => (
            <Card key={photo._id || photo.id} className="p-2">
              <img src={photo.url || photo.imageUrl} alt={photo.title || 'foto'} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              <div className="mt-2 text-sm">
                <strong>{photo.clientName || photo.name || '—'}</strong>
                <div className="flex gap-2 mt-2">
                  <Button disabled={processingId === (photo._id || photo.id)} onClick={() => handleApprove(photo._id || photo.id)}>
                    Aprovar
                  </Button>
                  <Button variant="danger" disabled={processingId === (photo._id || photo.id)} onClick={() => handleDelete(photo._id || photo.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          )) : <p>Nenhuma foto encontrada</p>}
        </div>
      </div>
    )
  }

  // render do painel
  if (!isAuthenticated) {
    const hasAutoUser = Boolean(defaultAdminUsername)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full space-y-4">
          <h2 className="text-2xl font-bold text-center">Painel Administrativo</h2>
          <div className="space-y-3">
            {!hasAutoUser && (
              <Input placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} />
            )}
            <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleLogin()} />
            <Button onClick={handleLogin} disabled={loading || !password}>{loading ? 'Entrando...' : 'Entrar'}</Button>

            <div className="mt-2 text-xs text-gray-500">
              Backend URL (debug): <Input value={customApiBase || envBase} onChange={e => setCustomApiBase(e.target.value)} className="mt-1" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // painel autenticado
  return (
    <div className="p-4 max-w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh}>Atualizar</Button>
          <Button onClick={handleLogout} variant="ghost">Sair</Button>
        </div>
      </div>

      <div className="mb-4">
        <nav className="flex gap-2">
          <button onClick={() => setActiveTab('metrics')} className={activeTab === 'metrics' ? 'font-bold' : ''}>Métricas</button>
          <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'font-bold' : ''}>Mensagens</button>
          <button onClick={() => setActiveTab('formulations')} className={activeTab === 'formulations' ? 'font-bold' : ''}>Formulações</button>
          <button onClick={() => setActiveTab('gallery')} className={activeTab === 'gallery' ? 'font-bold' : ''}>Galeria</button>
        </nav>
      </div>

      <div>
        {activeTab === 'metrics' && (
          <div>
            <h2>Métricas / Contatos</h2>
            <pre style={{ maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(messages?.slice(0, 200), null, 2)}</pre>
          </div>
        )}
        {activeTab === 'messages' && (
          <div>
            <h2>Mensagens</h2>
            <pre style={{ maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(messages?.slice(0, 200), null, 2)}</pre>
          </div>
        )}
        {activeTab === 'formulations' && (
          <div>
            <h2>Formulações</h2>
            <pre style={{ maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(formulations?.slice(0, 200), null, 2)}</pre>
          </div>
        )}
        {activeTab === 'gallery' && (
          <div>
            <h2>Galeria</h2>
            <InternalGalleryTab />
          </div>
        )}
      </div>
    </div>
  )
}
