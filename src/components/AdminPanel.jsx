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
  } catch { return '' }
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
    } catch (err) { setError('Erro ao carregar galeria.') } finally { setLoading(false) }
  }, [isVisible, adminToken, baseUrl, onUnauthorized])

  useEffect(() => { loadPhotos() }, [loadPhotos])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold flex gap-2"><Camera className="h-5 w-5"/> Galeria</h3>
        <Button onClick={loadPhotos} size="sm" disabled={loading}><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
      </div>
      {loading ? <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div> : 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.map(p => (
            <Card key={p._id} className="p-3">
              <img src={p.imageUrl} className="w-full h-40 object-cover rounded mb-2" alt="Impressão"/>
              <Badge variant="outline">{p.defectType || 'Ok'}</Badge>
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

  // Estados para Gestão de Parâmetros (O que estava faltando!)
  const [paramsResins, setParamsResins] = useState([])
  const [paramsPrinters, setParamsPrinters] = useState([])
  const [paramsProfiles, setParamsProfiles] = useState([])
  const [editingProfile, setEditingProfile] = useState(null)
  const [newResinName, setNewResinName] = useState('')
  const [newPrinterBrand, setNewPrinterBrand] = useState('')
  const [newPrinterModel, setNewPrinterModel] = useState('')

  const buildAdminUrl = (path) => {
    const base = apiBaseUrl || defaultApiBase
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const finalPath = cleanPath.startsWith('/api') || cleanPath.startsWith('/auth') ? cleanPath : `/api${cleanPath}`
    return `${base}${finalPath}`
  }

  // MÉTRICA DE MARKETING (Instagram/YouTube)
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

  // CORREÇÃO: Função que limpa o "mmmmm"
  const openEditProfile = (profile = null) => {
    if (profile) {
      setEditingProfile(profile)
      setProfileFormData({
        resinId: profile.resinId || '',
        printerId: profile.printerId || '',
        layerHeightMm: String(profile.params?.layerHeightMm || '').replace(/[^\d.]/g, ''),
        exposureTimeS: String(profile.params?.exposureTimeS || '').replace(/[^\d.]/g, ''),
        baseExposureTimeS: String(profile.params?.baseExposureTimeS || '').replace(/[^\d.]/g, ''),
        baseLayers: String(profile.params?.baseLayers || '').replace(/[^\d.]/g, '')
      })
    } else {
      setEditingProfile({ isNew: true })
    }
  }

  const loadAllData = useCallback(async () => {
    if (!adminToken) return
    setLoading(true)
    try {
      const [resContacts, resResins, resPrinters, resProfiles] = await Promise.all([
        fetch(buildAdminUrl('/contacts'), { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch(buildAdminUrl('/params/resins'), { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch(buildAdminUrl('/params/printers'), { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch(buildAdminUrl('/params/profiles'), { headers: { Authorization: `Bearer ${adminToken}` } })
      ])
      const [dContacts, dResins, dPrinters, dProfiles] = await Promise.all([
        resContacts.json(), resResins.json(), resPrinters.json(), resProfiles.json()
      ])
      if (dContacts.contacts) setContacts(dContacts.contacts)
      if (dResins.resins) setParamsResins(dResins.resins)
      if (dPrinters.printers) setParamsPrinters(dPrinters.printers)
      if (dProfiles.profiles) setParamsProfiles(dProfiles.profiles)
    } catch (err) { toast.error("Erro de conexão") } finally { setLoading(false) }
  }, [adminToken, apiBaseUrl])

  useEffect(() => { if (isAuthenticated) loadAllData() }, [isAuthenticated, loadAllData])

  if (!isAuthenticated) return <div className="p-20 text-center">Aguardando login...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Painel Quanton3D</h1>
          <Button onClick={loadAllData} variant="outline"><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button onClick={() => setActiveTab('metrics')} variant={activeTab === 'metrics' ? 'default' : 'outline'}><BarChart3 className="mr-2 h-4 w-4"/> Métricas</Button>
          <Button onClick={() => setActiveTab('params')} variant={activeTab === 'params' ? 'default' : 'outline'}><Beaker className="mr-2 h-4 w-4"/> Parâmetros</Button>
          <Button onClick={() => setActiveTab('contacts')} variant={activeTab === 'contacts' ? 'default' : 'outline'}><Phone className="mr-2 h-4 w-4"/> Contatos</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200">
          
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              <MetricsTab apiToken={adminToken} buildAdminUrl={buildAdminUrl} />
              <div className="pt-8 border-t">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600"><Share2/> Marketing Digital</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-t-4 border-pink-500"><p className="text-xs">Instagram</p><p className="text-3xl font-bold">{marketingStats.Instagram}</p></Card>
                  <Card className="p-4 border-t-4 border-red-600"><p className="text-xs">YouTube</p><p className="text-3xl font-bold">{marketingStats.YouTube}</p></Card>
                  <Card className="p-4 border-t-4 border-blue-500"><p className="text-xs">Google</p><p className="text-3xl font-bold">{marketingStats.Google}</p></Card>
                  <Card className="p-4 border-t-4 border-gray-400"><p className="text-xs">Outros</p><p className="text-3xl font-bold">{marketingStats.Outros}</p></Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'params' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-bold mb-2">Resinas</h3>
                  <div className="flex gap-2 mb-2"><Input value={newResinName} onChange={e=>setNewResinName(e.target.value)} placeholder="Nova Resina"/><Button size="sm"><Plus/></Button></div>
                  {paramsResins.map(r => <div key={r.id} className="flex justify-between p-1 border-b text-sm">{r.name} <Trash2 className="h-4 w-4 text-red-500 cursor-pointer"/></div>)}
                </Card>
                <Card className="p-4">
                  <h3 className="font-bold mb-2">Impressoras</h3>
                  <div className="flex gap-2 mb-2"><Input placeholder="Marca" value={newPrinterBrand} onChange={e=>setNewPrinterBrand(e.target.value)}/><Button size="sm"><Plus/></Button></div>
                  {paramsPrinters.map(p => <div key={p.id} className="flex justify-between p-1 border-b text-sm">{p.brand} {p.model} <Trash2 className="h-4 w-4 text-red-500 cursor-pointer"/></div>)}
                </Card>
              </div>
              <Card className="p-4">
                <h3 className="font-bold mb-4">Perfis de Impressão (Ajustados)</h3>
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b"><th>Resina</th><th>Impressora</th><th>Camada</th><th>Exp.</th><th>Ações</th></tr></thead>
                  <tbody>
                    {paramsProfiles.map(p => (
                      <tr key={p.id} className="border-b">
                        <td>{p.resinName}</td><td>{p.brand} {p.model}</td><td>{p.params?.layerHeightMm}</td><td>{p.params?.exposureTimeS}s</td>
                        <td><Edit3 onClick={()=>openEditProfile(p)} className="h-4 w-4 cursor-pointer inline mr-2"/><Trash2 className="h-4 w-4 text-red-500 cursor-pointer inline"/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === 'contacts' && <ContactsTab isAdmin={true} adminToken={adminToken} buildAdminUrl={buildAdminUrl} />}
        </div>
      </div>
    </div>
  )
}
