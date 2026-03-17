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
    return value.trim().replace(/\/+$/, '')
  } catch { return '' }
}

const deriveDefaultApiBase = () => {
  return "https://quanton3d-bot-v2.onrender.com"
}

export function AdminPanel({ onClose }) {
  const defaultApiBase = deriveDefaultApiBase()
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || '')
  const [apiBaseUrl, setApiBaseUrl] = useState(() => normalizeBaseUrl(localStorage.getItem(STORAGE_KEYS.apiBase)) || defaultApiBase)
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(adminToken && adminToken !== 'null'))
  const [activeTab, setActiveTab] = useState('metrics')
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([])
  const [paramsResins, setParamsResins] = useState([])
  const [paramsPrinters, setParamsPrinters] = useState([])
  const [paramsProfiles, setParamsProfiles] = useState([])
  const [profileFormData, setProfileFormData] = useState({
    resinId: '', printerId: '', brand: '', model: '', status: 'active',
    layerHeightMm: '', exposureTimeS: '', baseExposureTimeS: '', baseLayers: ''
  })
  const [editingProfile, setEditingProfile] = useState(null)

  // BLOQUEIO DE SEGURANÇA: Se não estiver logado, NÃO tenta carregar nada
  const buildAdminUrl = (path) => {
    const base = apiBaseUrl || defaultApiBase
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const finalPath = cleanPath.startsWith('/api') || cleanPath.startsWith('/auth') ? cleanPath : `/api${cleanPath}`
    return `${base}${finalPath}`
  }

  // MÉTRICAS DE MARKETING: Quem veio de onde
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
    if (!adminToken || adminToken === 'null') return
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
    } catch (err) { console.error("Erro na sincronização.") } finally { setLoading(false) }
  }, [adminToken, apiBaseUrl])

  useEffect(() => { if (isAuthenticated) loadAllData() }, [isAuthenticated, loadAllData])

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.token)
    setAdminToken('')
    setIsAuthenticated(false)
    window.location.reload() // Recarrega para limpar erros globais do site
  }

  // TELA DE LOGIN RESISTENTE
  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <Card className="p-8 bg-gray-800 border-gray-700 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 italic">ACESSO QUANTON3D</h2>
        <p className="text-gray-400 mb-6 text-sm">Clique abaixo para limpar qualquer erro antigo e tentar o login novamente.</p>
        <Button onClick={handleLogout} variant="default" className="w-full bg-blue-600 mb-2">LIMPAR SESSÃO E LOGAR</Button>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-black text-blue-600 italic">QUANTON3D ADMIN</h1>
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
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200">
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              <MetricsTab apiToken={adminToken} buildAdminUrl={buildAdminUrl} />
              <div className="pt-6 border-t">
                <h3 className="font-bold mb-4 flex gap-2 text-blue-600 uppercase tracking-tighter"><Share2/> Marketing Digital</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-t-4 border-pink-500 shadow-md">
                    <p className="text-xs text-gray-500 flex justify-between uppercase font-bold">Instagram <Instagram size={14}/></p>
                    <p className="text-4xl font-black">{marketingStats.Instagram}</p>
                  </Card>
                  <Card className="p-4 border-t-4 border-red-600 shadow-md">
                    <p className="text-xs text-gray-500 flex justify-between uppercase font-bold">YouTube <Youtube size={14}/></p>
                    <p className="text-4xl font-black">{marketingStats.YouTube}</p>
                  </Card>
                  <Card className="p-4 border-t-4 border-blue-500 shadow-md">
                    <p className="text-xs text-gray-500 uppercase font-bold">Google</p>
                    <p className="text-4xl font-black">{marketingStats.Google}</p>
                  </Card>
                  <Card className="p-4 border-t-4 border-gray-400 shadow-md">
                    <p className="text-xs text-gray-500 uppercase font-bold">Outros</p>
                    <p className="text-4xl font-black">{marketingStats.Outros}</p>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'params' && (
            <div className="space-y-6">
              <Card className="p-4 border-2 border-blue-50">
                <div className="flex justify-between mb-4 items-center">
                  <h3 className="font-bold text-lg">Perfis de Impressão (Vacinados)</h3>
                  <Button size="sm" onClick={() => openEditProfile(null)} className="bg-blue-600">+ Novo</Button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100"><tr>
                    <th className="p-2">Resina</th><th className="p-2">Impressora</th><th className="p-2">Camada</th><th className="p-2">Exp.</th><th className="p-2">Ações</th>
                  </tr></thead>
                  <tbody>
                    {paramsProfiles.map(p => (
                      <tr key={p.id} className="border-b">
                        <td className="p-2 font-bold">{p.resinName}</td>
                        <td className="p-2">{p.brand} {p.model}</td>
                        <td className="p-2 text-blue-600">{p.params?.layerHeightMm}mm</td>
                        <td className="p-2">{p.params?.exposureTimeS}s</td>
                        <td className="p-2"><Edit3 onClick={()=>openEditProfile(p)} className="h-5 w-5 cursor-pointer inline mr-3 text-blue-500"/><Trash2 className="h-5 w-5 text-red-500 cursor-pointer inline"/></td>
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
