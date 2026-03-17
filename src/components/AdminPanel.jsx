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

// CORREÇÃO: Forçamos o link do seu servidor oficial para evitar erro de login
const deriveDefaultApiBase = () => {
  return "https://quanton3d-bot-v2.onrender.com"
}

export function AdminPanel({ onClose }) {
  const defaultApiBase = deriveDefaultApiBase()
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || '')
  const [apiBaseUrl, setApiBaseUrl] = useState(() => normalizeBaseUrl(localStorage.getItem(STORAGE_KEYS.apiBase)) || defaultApiBase)
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(adminToken))
  const [activeTab, setActiveTab] = useState('metrics')
  const [loading, setLoading] = useState(false)
  
  const [contacts, setContacts] = useState([])
  const [paramsResins, setParamsResins] = useState([])
  const [paramsPrinters, setParamsPrinters] = useState([])
  const [paramsProfiles, setParamsProfiles] = useState([])
  
  const [editingProfile, setEditingProfile] = useState(null)
  const [newResinName, setNewResinName] = useState('')
  const [newPrinterBrand, setNewPrinterBrand] = useState('')
  const [newPrinterModel, setNewPrinterModel] = useState('')
  const [profileFormData, setProfileFormData] = useState({
    resinId: '', printerId: '', brand: '', model: '', status: 'active',
    layerHeightMm: '', exposureTimeS: '', baseExposureTimeS: '', baseLayers: ''
  })

  // Trava de segurança para limpar logins antigos que dão erro
  useEffect(() => {
    if (adminToken === 'undefined' || adminToken === 'null') {
      localStorage.removeItem(STORAGE_KEYS.token);
      setAdminToken('');
      setIsAuthenticated(false);
    }
  }, [adminToken]);

  const buildAdminUrl = (path) => {
    const base = apiBaseUrl || defaultApiBase
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const finalPath = cleanPath.startsWith('/api') || cleanPath.startsWith('/auth') ? cleanPath : `/api${cleanPath}`
    return `${base}${finalPath}`
  }

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

  // VACINA: Limpa o "mmmmm" na hora de editar
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
    } catch (err) { 
      console.error("Erro na sincronização. Verificando acesso...");
    } finally { setLoading(false) }
  }, [adminToken, apiBaseUrl])

  useEffect(() => { if (isAuthenticated) loadAllData() }, [isAuthenticated, loadAllData])

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.token)
    setAdminToken('')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <Card className="p-8 bg-gray-800 border-gray-700 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500"/>
        <h2 className="text-xl font-bold">Aguardando login administrativo...</h2>
        <p className="text-gray-400 mt-2 text-sm">Se esta tela travar, tente limpar o cache do navegador.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Tentar Reconectar</Button>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic tracking-tighter">QUANTON3D ADMIN</h1>
          <div className="flex gap-2">
            <Button onClick={loadAllData} variant="outline" size="sm"><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
            <Button onClick={handleLogout} variant="destructive" size="sm">Sair</Button>
            <Button onClick={onClose} variant="ghost" size="sm"><X/></Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button onClick={() => setActiveTab('metrics')} variant={activeTab === 'metrics' ? 'default' : 'outline'} size="sm"><BarChart3 className="mr-2 h-4 w-4"/> Métricas</Button>
          <Button onClick={() => setActiveTab('params')} variant={activeTab === 'params' ? 'default' : 'outline'} size="sm"><Beaker className="mr-2 h-4 w-4"/> Parâmetros</Button>
          <Button onClick={() => setActiveTab('contacts')} variant={activeTab === 'contacts' ? 'default' : 'outline'} size="sm"><Phone className="mr-2 h-4 w-4"/> Contatos</Button>
          <Button onClick={() => setActiveTab('gallery')} variant={activeTab === 'gallery' ? 'default' : 'outline'} size="sm"><Camera className="mr-2 h-4 w-4"/> Galeria</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200">
          
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              <MetricsTab apiToken={adminToken} buildAdminUrl={buildAdminUrl} />
              <div className="pt-6 border-t">
                <h3 className="font-bold mb-4 flex gap-2 text-blue-600 items-center"><Share2 className="h-5 w-5"/> RESULTADOS DE MARKETING</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-t-2 border-pink-500 shadow-sm">
                    <p className="text-xs text-gray-500 flex justify-between uppercase font-bold">Instagram <Instagram size={14}/></p>
                    <p className="text-3xl font-black">{marketingStats.Instagram}</p>
                  </Card>
                  <Card className="p-4 border-t-2 border-red-600 shadow-sm">
                    <p className="text-xs text-gray-500 flex justify-between uppercase font-bold">YouTube <Youtube size={14}/></p>
                    <p className="text-3xl font-black">{marketingStats.YouTube}</p>
                  </Card>
                  <Card className="p-4 border-t-2 border-blue-500 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Google</p>
                    <p className="text-3xl font-black">{marketingStats.Google}</p>
                  </Card>
                  <Card className="p-4 border-t-2 border-gray-400 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Outros</p>
                    <p className="text-3xl font-black">{marketingStats.Outros}</p>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'params' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-600"><Beaker size={16}/> Resinas</h3>
                  <div className="flex gap-2 mb-2">
                    <Input value={newResinName} onChange={e=>setNewResinName(e.target.value)} placeholder="Nova Resina" className="bg-white"/>
                    <Button size="sm"><Plus/></Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto bg-white rounded-md border">
                    {paramsResins.map(r => <div key={r.id} className="flex justify-between p-2 border-b text-sm last:border-0 hover:bg-gray-50">{r.name} <Trash2 className="h-4 w-4 text-red-500 cursor-pointer"/></div>)}
                  </div>
                </Card>
                <Card className="p-4 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-600"><Camera size={16}/> Impressoras</h3>
                  <div className="flex gap-2 mb-2">
                    <Input placeholder="Marca/Modelo" value={newPrinterBrand} onChange={e=>setNewPrinterBrand(e.target.value)} className="bg-white"/>
                    <Button size="sm"><Plus/></Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto bg-white rounded-md border">
                    {paramsPrinters.map(p => <div key={p.id} className="flex justify-between p-2 border-b text-sm last:border-0 hover:bg-gray-50">{p.brand} {p.model} <Trash2 className="h-4 w-4 text-red-500 cursor-pointer"/></div>)}
                  </div>
                </Card>
              </div>
              <Card className="p-4">
                <div className="flex justify-between mb-4 items-center">
                   <h3 className="font-bold text-lg">Perfis de Impressão (Modo Limpo)</h3>
                   <Button size="sm" onClick={() => openEditProfile(null)} className="bg-blue-600">+ Novo Perfil</Button>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b bg-gray-100 dark:bg-gray-700 font-bold">
                      <th className="p-3">Resina</th><th className="p-3">Impressora</th><th className="p-3">Camada</th><th className="p-3">Exp.</th><th className="p-3">Ações</th>
                    </tr></thead>
                    <tbody>
                      {paramsProfiles.map(p => (
                        <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3 font-medium">{p.resinName}</td>
                          <td className="p-3">{p.brand} {p.model}</td>
                          <td className="p-3 text-blue-600 font-mono">{p.params?.layerHeightMm}mm</td>
                          <td className="p-3 font-mono">{p.params?.exposureTimeS}s</td>
                          <td className="p-3">
                            <div className="flex gap-3">
                              <Edit3 onClick={()=>openEditProfile(p)} className="h-5 w-5 cursor-pointer text-blue-500 hover:scale-110 transition-transform"/>
                              <Trash2 className="h-5 w-5 text-red-500 cursor-pointer hover:scale-110 transition-transform"/>
                            </div>
                          </td>
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
