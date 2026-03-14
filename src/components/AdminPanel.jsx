import { useCallback, useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { X, User, Phone, MessageSquare, BarChart3, BookOpen, Plus, Beaker, Edit3, Mail, Camera, Loader2, Eye, Trash2, Upload, AlertCircle, Handshake, ShoppingBag, AlertTriangle, RefreshCw, Check, Instagram, Youtube, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge.jsx'
import { toast } from 'sonner'
import { PartnersManager } from './PartnersManager.jsx'
import { MetricsTab } from './admin/MetricsTab.jsx'
import { SuggestionsTab } from './admin/SuggestionsTab.jsx'
import { OrdersTab } from './admin/OrdersTab.jsx'
import { GalleryTab } from './admin/GalleryTab.jsx'
import { DocumentsTab } from './admin/DocumentsTab.jsx'
import { ContactsTab } from './admin/ContactsTab.jsx'

const STORAGE_KEYS = {
  token: 'quanton3d_admin_token',
  apiBase: 'quanton3d_admin_api_base'
}

const normalizeBaseUrl = (value) => {
  if (!value) return ''
  try {
    const trimmed = value.trim().replace(/\/+$/, '')
    return trimmed
  } catch {
    return ''
  }
}

const deriveDefaultApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com'
  return normalizeBaseUrl(envUrl)
}

// --- GALERIA INTERNA BLINDADA ---
function InternalGalleryTab({ isAdmin, isVisible, adminToken, onPendingCountChange, apiBaseUrl, onUnauthorized }) {
  const baseUrl = apiBaseUrl || deriveDefaultApiBase()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const loadPhotos = useCallback(async () => {
    if (!isVisible) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${baseUrl}/api/visual-knowledge`, {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      })
      if (response.status === 401) return onUnauthorized?.()
      const data = await response.json()
      const safeList = Array.isArray(data.documents) ? data.documents : []
      setPhotos(safeList)
    } catch (err) {
      setError('Erro ao carregar galeria.')
    } finally {
      setLoading(false)
    }
  }, [isVisible, adminToken, baseUrl, onUnauthorized])

  useEffect(() => { loadPhotos() }, [loadPhotos])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold flex gap-2"><Camera className="h-5 w-5"/> Galeria de Fotos</h3>
        <Button onClick={loadPhotos} size="sm" disabled={loading}><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
      </div>
      {loading ? <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div> : 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.map(p => (
            <Card key={p._id} className="p-3">
              <img src={p.imageUrl} className="w-full h-40 object-cover rounded mb-2" alt="Impressão"/>
              <Badge variant="outline">{p.defectType || 'Diagnóstico'}</Badge>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

export function AdminPanel({ onClose }) {
  const defaultApiBase = deriveDefaultApiBase()
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || '')
  const [apiBaseUrl, setApiBaseUrl] = useState(() => normalizeBaseUrl(localStorage.getItem(STORAGE_KEYS.apiBase)) || defaultApiBase)
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(adminToken))
  const [activeTab, setActiveTab] = useState('metrics')
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([])

  const buildAdminUrl = (path) => {
    const base = apiBaseUrl || defaultApiBase
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const finalPath = cleanPath.startsWith('/api') || cleanPath.startsWith('/auth') ? cleanPath : `/api${cleanPath}`
    return `${base}${finalPath}`
  }

  // NOVA MÉTRICA: Processa quem veio de onde (Instagram, YouTube, etc)
  const marketingStats = useMemo(() => {
    const stats = { Instagram: 0, YouTube: 0, Google: 0, Outros: 0 }
    contacts.forEach(c => {
      const origin = c.origin || ''
      if (origin.includes('Instagram')) stats.Instagram++
      else if (origin.includes('YouTube')) stats.YouTube++
      else if (origin.includes('Google')) stats.Google++
      else stats.Outros++
    })
    return stats
  }, [contacts])

  const loadAllData = useCallback(async () => {
    if (!adminToken) return
    setLoading(true)
    try {
      const res = await fetch(buildAdminUrl('/contacts'), {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      const data = await res.json()
      if (data.contacts) setContacts(data.contacts)
    } catch (err) {
      console.error("Erro ao sincronizar dados.")
    } finally {
      setLoading(false)
    }
  }, [adminToken, apiBaseUrl])

  useEffect(() => { if (isAuthenticated) loadAllData() }, [isAuthenticated, loadAllData])

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.token)
    setAdminToken('')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) return <div className="p-20 text-center">Aguardando login administrativo...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Painel Quanton3D</h1>
          <div className="flex gap-2">
            <Button onClick={loadAllData} variant="outline" disabled={loading}><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
            <Button onClick={handleLogout} variant="destructive">Sair</Button>
            <Button onClick={onClose} variant="ghost"><X/></Button>
          </div>
        </div>

        {/* ABAS DE NAVEGAÇÃO */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button onClick={() => setActiveTab('metrics')} variant={activeTab === 'metrics' ? 'default' : 'outline'}><BarChart3 className="mr-2 h-4 w-4"/> Métricas</Button>
          <Button onClick={() => setActiveTab('contacts')} variant={activeTab === 'contacts' ? 'default' : 'outline'}><Phone className="mr-2 h-4 w-4"/> Contatos</Button>
          <Button onClick={() => setActiveTab('gallery')} variant={activeTab === 'gallery' ? 'default' : 'outline'}><Camera className="mr-2 h-4 w-4"/> Galeria</Button>
          <Button onClick={() => setActiveTab('params')} variant={activeTab === 'params' ? 'default' : 'outline'}><Beaker className="mr-2 h-4 w-4"/> Parâmetros</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200">
          
          {/* ABA DE MÉTRICAS COM O NOVO PAINEL DE MARKETING */}
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              <MetricsTab apiToken={adminToken} buildAdminUrl={buildAdminUrl} />
              
              <div className="pt-8 border-t">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600">
                  <Share2 className="h-6 w-6"/> Desempenho de Redes Sociais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6 border-t-4 border-t-pink-500">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 font-medium">Instagram</span>
                      <Instagram className="text-pink-500 h-5 w-5"/>
                    </div>
                    <p className="text-4xl font-black">{marketingStats.Instagram}</p>
                    <p className="text-xs text-gray-400 mt-2">Novos seguidores vindos do formulário</p>
                  </Card>

                  <Card className="p-6 border-t-4 border-t-red-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 font-medium">YouTube</span>
                      <Youtube className="text-red-600 h-5 w-5"/>
                    </div>
                    <p className="text-4xl font-black">{marketingStats.YouTube}</p>
                    <p className="text-xs text-gray-400 mt-2">Clientes que acompanham seu canal</p>
                  </Card>

                  <Card className="p-6 border-t-4 border-t-blue-500">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 font-medium">Google</span>
                      <Mail className="text-blue-500 h-5 w-5"/>
                    </div>
                    <p className="text-4xl font-black">{marketingStats.Google}</p>
                    <p className="text-xs text-gray-400 mt-2">Encontraram via pesquisa online</p>
                  </Card>

                  <Card className="p-6 border-t-4 border-t-gray-400">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 font-medium">Outros</span>
                      <User className="text-gray-400 h-5 w-5"/>
                    </div>
                    <p className="text-4xl font-black">{marketingStats.Outros}</p>
                    <p className="text-xs text-gray-400 mt-2">Indicações e vendas diretas</p>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && <ContactsTab isAdmin={true} adminToken={adminToken} buildAdminUrl={buildAdminUrl} />}
          {activeTab === 'gallery' && <InternalGalleryTab isAdmin={true} adminToken={adminToken} apiBaseUrl={apiBaseUrl} isVisible={true} />}
          
          {activeTab === 'params' && (
            <div className="p-10 text-center">
              <p className="text-gray-500">Acesse a aba de Parâmetros para gerenciar resinas e tempos de exposição.</p>
              <p className="text-xs text-red-500 mt-2 italic">Dica: Os erros "mmmmm" foram corrigidos no carregamento interno.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
