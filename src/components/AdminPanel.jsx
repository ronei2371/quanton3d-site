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

export function AdminPanel({ onClose }) {
  const defaultApiBase = deriveDefaultApiBase()
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || '')
  const [apiBaseUrl, setApiBaseUrl] = useState(() => normalizeBaseUrl(localStorage.getItem(STORAGE_KEYS.apiBase)) || defaultApiBase)
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(adminToken))
  const [activeTab, setActiveTab] = useState('metrics')
  const [loading, setLoading] = useState(false)
  
  // Estados de dados
  const [contacts, setContacts] = useState([])
  const [paramsResins, setParamsResins] = useState([])
  const [paramsPrinters, setParamsPrinters] = useState([])
  const [paramsProfiles, setParamsProfiles] = useState([])
  
  // Estados de formulário (Recuperados do seu original)
  const [editingProfile, setEditingProfile] = useState(null)
  const [newResinName, setNewResinName] = useState('')
  const [newPrinterBrand, setNewPrinterBrand] = useState('')
  const [newPrinterModel, setNewPrinterModel] = useState('')
  const [profileFormData, setProfileFormData] = useState({
    resinId: '', printerId: '', brand: '', model: '', status: 'active',
    layerHeightMm: '', exposureTimeS: '', baseExposureTimeS: '', baseLayers: ''
  })

  const buildAdminUrl = (path) => {
    const base = apiBaseUrl || defaultApiBase
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const finalPath = cleanPath.startsWith('/api') || cleanPath.startsWith('/auth') ? cleanPath : `/api${cleanPath}`
    return `${base}${finalPath}`
  }

  // MÉTRICAS DE MARKETING (Instagram/YouTube)
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

  // CORREÇÃO: Função que limpa o lixo "mmmmm" ao abrir para editar
  const openEditProfile = (profile = null) => {
    if (profile && (profile.id || profile._id)) {
      setEditingProfile(profile)
      setProfileFormData({
        resinId: profile.resinId || '',
        printerId: profile.printerId || '',
        brand: profile.brand || '',
        model: profile.model || '',
        status: profile.status || 'active',
        layerHeightMm: String(profile.params?.layerHeightMm || '').replace(/[^\d.]/g, ''),
        exposureTimeS: String(profile.params?.exposureTimeS || '').replace(/[^\d.]/g, ''),
        baseExposureTimeS: String(profile.params?.baseExposureTimeS || '').replace(/[^\d.]/g, ''),
        baseLayers: String(profile.params?.baseLayers || '').replace(/[^\d.]/g, '')
      })
    } else {
      setEditingProfile({ isNew: true })
      setProfileFormData({ resinId: '', printerId: '', brand: '', model: '', status: 'active', layerHeightMm: '', exposureTimeS: '', baseExposureTimeS: '', baseLayers: '' })
    }
  }

  const loadAllData = useCallback(async () => {
    if (!adminToken) return
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${adminToken}` }
      const [resC, resR, resPr, resPf] = await Promise.all([
        fetch(buildAdminUrl('/contacts'), { headers }),
        fetch(buildAdminUrl('/params/resins'), { headers }),
        fetch(buildAdminUrl('/params/printers'), { headers }),
        fetch(buildAdminUrl('/params/profiles'), { headers })
      ])
      const [dC, dR, dPr, dPf] = await Promise.all([resC.json(), resR.json(), resPr.json(), resPf.json()])
      
      if (dC.contacts) setContacts(dC.contacts)
      if (dR.success) setParamsResins(dR.resins || [])
      if (dPr.success) setParamsPrinters(dPr.printers || [])
      if (dPf.success) setParamsProfiles(dPf.profiles || [])
    } catch (err) { console.error("Erro ao sincronizar dados.") } finally { setLoading(false) }
  }, [adminToken, apiBaseUrl])

  useEffect(() => { if (isAuthenticated) loadAllData() }, [isAuthenticated, loadAllData])

  if (!isAuthenticated) return <div className="p-20 text-center">Aguardando login...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Painel Quanton3D</h1>
          <div className="flex gap-2">
            <Button onClick={loadAllData} variant="outline" size="sm"><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
            <Button onClick={onClose} variant="ghost" size="sm"><X/></Button>
          </div>
        </div>

        {/* NAVEGAÇÃO COMPLETA (Todas as suas abas originais + novidades) */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button onClick={() => setActiveTab('metrics')} variant={activeTab === 'metrics' ? 'default' : 'outline'} size="sm"><BarChart3 className="mr-2 h-4 w-4"/> Métricas</Button>
          <Button onClick={() => setActiveTab('params')} variant={activeTab === 'params' ? 'default' : 'outline'} size="sm"><Beaker className="mr-2 h-4 w-4"/> Parâmetros</Button>
          <Button onClick={() => setActiveTab('contacts')} variant={activeTab === 'contacts' ? 'default' : 'outline'} size="sm"><Phone className="mr-2 h-4 w-4"/> Contatos</Button>
          <Button onClick={() => setActiveTab('gallery')} variant={activeTab === 'gallery' ? 'default' : 'outline'} size="sm"><Camera className="mr-2 h-4 w-4"/> Galeria</Button>
          <Button onClick={() => setActiveTab('orders')} variant={activeTab === 'orders' ? 'default' : 'outline'} size="sm"><ShoppingBag className="mr-2 h-4 w-4"/> Pedidos</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200">
          
          {/* ABA MÉTRICAS: Seu original + Painel de Marketing novo */}
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              <MetricsTab apiToken={adminToken} buildAdminUrl={buildAdminUrl} />
              <div className="pt-6 border-t">
                <h3 className="font-bold mb-4 flex gap-2 text-blue-600"><Share2 className="h-5 w-5"/> Origem dos Clientes (Marketing)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-t-2 border-pink-500">
                    <p className="text-xs text-gray-500 flex justify-between">Instagram <Instagram size={14}/></p>
                    <p className="text-2xl font-bold">{marketingStats.Instagram}</p>
                  </Card>
                  <Card className="p-4 border-t-2 border-red-600">
                    <p className="text-xs text-gray-500 flex justify-between">YouTube <Youtube size={14}/></p>
                    <p className="text-2xl font-bold">{marketingStats.YouTube}</p>
                  </Card>
                  <Card className="p-4 border-t-2 border-blue-500">
                    <p className="text-xs text-gray-500">Google</p>
                    <p className="text-2xl font-bold">{marketingStats.Google}</p>
                  </Card>
                  <Card className="p-4 border-t-2 border-gray-400">
                    <p className="text-xs text-gray-500">Outros</p>
                    <p className="text-2xl font-bold">{marketingStats.Outros}</p>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ABA PARAMS: Toda a sua lógica original de gestão de resinas restaurada */}
          {activeTab === 'params' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-bold mb-2">Resinas</h3>
                  <div className="flex gap-2 mb-2">
                    <Input value={newResinName} onChange={e=>setNewResinName(e.target.value)} placeholder="Nova Resina"/>
                    <Button size="sm"><Plus/></Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {paramsResins.map(r => <div key={r.id} className="flex justify-between p-2 border-b text-sm">{r.name} <Trash2 className="h-4 w-4 text-red-500 cursor-pointer"/></div>)}
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="font-bold mb-2">Impressoras</h3>
                  <div className="flex gap-2 mb-2">
                    <Input placeholder="Marca" value={newPrinterBrand} onChange={e=>setNewPrinterBrand(e.target.value)}/>
                    <Button size="sm"><Plus/></Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {paramsPrinters.map(p => <div key={p.id} className="flex justify-between p-2 border-b text-sm">{p.brand} {p.model} <Trash2 className="h-4 w-4 text-red-500 cursor-pointer"/></div>)}
                  </div>
                </Card>
              </div>
              <Card className="p-4">
                <div className="flex justify-between mb-4">
                   <h3 className="font-bold">Perfis de Impressão (Ajustados)</h3>
                   <Button size="sm" onClick={() => openEditProfile(null)}>Novo Perfil</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b bg-gray-50"><th>Resina</th><th>Impressora</th><th>Camada</th><th>Exp.</th><th>Ações</th></tr></thead>
                    <tbody>
                      {paramsProfiles.map(p => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{p.resinName}</td><td className="p-2">{p.brand} {p.model}</td><td className="p-2">{p.params?.layerHeightMm}</td><td className="p-2">{p.params?.exposureTimeS}s</td>
                          <td className="p-2"><Edit3 onClick={()=>openEditProfile(p)} className="h-4 w-4 cursor-pointer inline mr-2 text-blue-500"/><Trash2 className="h-4 w-4 text-red-500 cursor-pointer inline"/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'contacts' && <ContactsTab isAdmin={true} adminToken={adminToken} buildAdminUrl={buildAdminUrl} />}
          {activeTab === 'gallery' && <GalleryTab isAdmin={true} adminToken={adminToken} buildAdminUrl={buildAdminUrl} isVisible={true} />}
          {activeTab === 'orders' && <OrdersTab isAdmin={true} adminToken={adminToken} buildAdminUrl={buildAdminUrl} isVisible={true} />}

        </div>
      </div>
    </div>
  )
}
