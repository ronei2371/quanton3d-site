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

function PendingVisualItemForm({ item, onApprove, onDelete, canDelete }) {
  const [defectType, setDefectType] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [solution, setSolution] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApproveClick = async () => {
    setIsSubmitting(true)
    try {
      const success = await onApprove(item._id, defectType, diagnosis, solution)
      if (success) { setDefectType(''); setDiagnosis(''); setSolution(''); }
    } finally { setIsSubmitting(false); }
  }

  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border flex gap-4">
      <img src={item.imageUrl} className="w-40 h-40 object-cover rounded-lg border flex-shrink-0"/>
      <div className="flex-1 space-y-3">
        <select value={defectType} onChange={(e) => setDefectType(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600">
          <option value="">Selecione o tipo de defeito...</option>
          <option value="descolamento da base">Descolamento da base</option>
          <option value="falha de suportes">Falha de suportes</option>
          <option value="delaminacao">Delaminacao</option>
          <option value="outro">Outro</option>
        </select>
        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Diagnostico tecnico..." className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600 min-h-[60px]"/>
        <textarea value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Solucao recomendada..." className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600 min-h-[60px]"/>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApproveClick} disabled={isSubmitting} className="bg-green-600">{isSubmitting ? 'Aprovando...' : 'Aprovar e Treinar'}</Button>
          {canDelete && <Button size="sm" variant="outline" onClick={() => onDelete(item._id)} className="text-red-600"><Trash2 className="h-4 w-4 mr-1" />Descartar</Button>}
        </div>
      </div>
    </div>
  )
}

export function AdminPanel({ onClose }) {
  const defaultApiBase = deriveDefaultApiBase()
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || '')
  const [apiBaseUrl, setApiBaseUrl] = useState(() => normalizeBaseUrl(localStorage.getItem(STORAGE_KEYS.apiBase)) || defaultApiBase)
  const [customApiBaseInput, setCustomApiBaseInput] = useState(() => apiBaseUrl || defaultApiBase)
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(adminToken))
  const [activeTab, setActiveTab] = useState('metrics')
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([])
  const [paramsResins, setParamsResins] = useState([])
  const [paramsPrinters, setParamsPrinters] = useState([])
  const [paramsProfiles, setParamsProfiles] = useState([])
  const [ragStatus, setRagStatus] = useState(null)
  const [editingProfile, setEditingProfile] = useState(null)
  const [pendingVisualPhotos, setPendingVisualPhotos] = useState([])
  const [visualKnowledge, setVisualKnowledge] = useState([])

  const [profileFormData, setProfileFormData] = useState({
    resinId: '', printerId: '', brand: '', model: '', status: 'active',
    layerHeightMm: '', exposureTimeS: '', baseExposureTimeS: '', baseLayers: ''
  })

  // RESET DE SEGURANÇA: Se o token for inválido, limpa o login automaticamente
  useEffect(() => {
    if (adminToken === 'undefined' || adminToken === 'null' || adminToken === '[object Object]') {
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

  // MÉTRICAS DE MARKETING: Instagram, YouTube, etc.
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
      const [resC, resR, resPr, resPf, resRag, resVisual, resPending] = await Promise.all([
        fetch(buildAdminUrl('/contacts'), { headers }),
        fetch(buildAdminUrl('/params/resins'), { headers }),
        fetch(buildAdminUrl('/params/printers'), { headers }),
        fetch(buildAdminUrl('/params/profiles'), { headers }),
        fetch(buildAdminUrl('/rag-status'), { headers }),
        fetch(buildAdminUrl('/api/visual-knowledge'), { headers }),
        fetch(buildAdminUrl('/api/visual-knowledge/pending'), { headers })
      ])
      const [dC, dR, dPr, dPf, dRag, dVisual, dPending] = await Promise.all([
        resC.json(), resR.json(), resPr.json(), resPf.json(), resRag.json(), resVisual.json(), resPending.json()
      ])
      if (dC.contacts) setContacts(dC.contacts)
      if (dR.success) setParamsResins(dR.resins || [])
      if (dPr.success) setParamsPrinters(dPr.printers || [])
      if (dPf.success) setParamsProfiles(dPf.profiles || [])
      if (dRag.success) setRagStatus(dRag.status)
      if (dVisual.documents) setVisualKnowledge(dVisual.documents)
      if (dPending.pending) setPendingVisualPhotos(dPending.pending)
    } catch (err) { console.error("Erro ao sincronizar dados.") } finally { setLoading(false) }
  }, [adminToken, apiBaseUrl])

  useEffect(() => { if (isAuthenticated) loadAllData() }, [isAuthenticated, loadAllData])

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.token)
    setAdminToken('')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <Card className="p-8 bg-gray-800 border-gray-700 text-center max-w-md w-full">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-500"/>
        <h2 className="text-2xl font-bold mb-2 tracking-tighter uppercase italic">Acesso Administrativo</h2>
        <p className="text-gray-400 mb-6 text-sm">Se esta tela travar por mais de 10 segundos, o seu token expirou.</p>
        <Button onClick={() => window.location.reload()} variant="default" className="w-full bg-blue-600 mb-2">Entrar com nova senha</Button>
        <Button onClick={handleLogout} variant="outline" className="w-full text-red-400">Limpar Sessão</Button>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic">QUANTON3D ADMIN</h1>
          <div className="flex gap-2">
            <Button onClick={loadAllData} variant="outline" size="sm"><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
            <Button onClick={onClose} variant="ghost" size="sm"><X/></Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button onClick={() => setActiveTab('metrics')} variant={activeTab === 'metrics' ? 'default' : 'outline'} size="sm"><BarChart3 className="mr-2 h-4 w-4"/> Métricas</Button>
          <Button onClick={() => setActiveTab('params')} variant={activeTab === 'params' ? 'default' : 'outline'} size="sm"><Beaker className="mr-2 h-4 w-4"/> Parâmetros</Button>
          <Button onClick={() => setActiveTab('contacts')} variant={activeTab === 'contacts' ? 'default' : 'outline'} size="sm"><Phone className="mr-2 h-4 w-4"/> Contatos</Button>
          <Button onClick={() => setActiveTab('visual')} variant={activeTab === 'visual' ? 'default' : 'outline'} size="sm"><Eye className="mr-2 h-4 w-4"/> Treinamento</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200">
          
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              <MetricsTab apiToken={adminToken} buildAdminUrl={buildAdminUrl} />
              <div className="pt-6 border-t">
                <h3 className="font-bold mb-4 flex gap-2 text-blue-600 uppercase tracking-tighter"><Share2/> Resultados de Marketing</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-t-4 border-pink-500 shadow-md">
                    <p className="text-xs text-gray-500 flex justify-between uppercase font-bold">Instagram <Instagram size={14}/></p>
                    <p className="text-4xl font-black tracking-tighter">{marketingStats.Instagram}</p>
                  </Card>
                  <Card className="p-4 border-t-4 border-red-600 shadow-md">
                    <p className="text-xs text-gray-500 flex justify-between uppercase font-bold">YouTube <Youtube size={14}/></p>
                    <p className="text-4xl font-black tracking-tighter">{marketingStats.YouTube}</p>
                  </Card>
                  <Card className="p-4 border-t-4 border-blue-500 shadow-md">
                    <p className="text-xs text-gray-500 uppercase font-bold">Google</p>
                    <p className="text-4xl font-black tracking-tighter">{marketingStats.Google}</p>
                  </Card>
                  <Card className="p-4 border-t-4 border-gray-400 shadow-md">
                    <p className="text-xs text-gray-500 uppercase font-bold">Outros</p>
                    <p className="text-4xl font-black tracking-tighter">{marketingStats.Outros}</p>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'params' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-bold mb-2 text-blue-600">Gestão de Resinas</h3>
                  <div className="flex gap-2 mb-2"><Input value={newResinName} onChange={e=>setNewResinName(e.target.value)} placeholder="Nova Resina"/><Button size="sm"><Plus/></Button></div>
                  <div className="max-h-60 overflow-y-auto bg-white border rounded p-2">
                    {paramsResins.map(r => <div key={r.id} className="flex justify-between p-2 border-b last:border-0 text-sm">{r.name} <Trash2 className="h-4 w-4 text-red-500 cursor-pointer"/></div>)}
                  </div>
                </Card>
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-bold mb-2 text-blue-600">Impressoras Cadastradas</h3>
                  <div className="flex gap-2 mb-2"><Input placeholder="Marca/Modelo" value={newPrinterBrand} onChange={e=>setNewPrinterBrand(e.target.value)}/><Button size="sm"><Plus/></Button></div>
                  <div className="max-h-60 overflow-y-auto bg-white border rounded p-2">
                    {paramsPrinters.map(p => <div key={p.id} className="flex justify-between p-2 border-b last:border-0 text-sm">{p.brand} {p.model} <Trash2 className="h-4 w-4 text-red-500 cursor-pointer"/></div>)}
                  </div>
                </Card>
              </div>
              <Card className="p-4 border-2 border-blue-50">
                <div className="flex justify-between mb-4 items-center"><h3 className="font-bold text-lg">Perfis de Impressão (Vacinados contra erros)</h3><Button size="sm" onClick={() => openEditProfile(null)} className="bg-blue-600">+ Novo</Button></div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100"><tr className="border-b">
                    <th className="p-2">Resina</th><th className="p-2">Impressora</th><th className="p-2">Camada</th><th className="p-2">Exp.</th><th className="p-2">Ações</th>
                  </tr></thead>
                  <tbody>
                    {paramsProfiles.map(p => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-bold">{p.resinName}</td><td className="p-2">{p.brand} {p.model}</td><td className="p-2 text-blue-600">{p.params?.layerHeightMm}mm</td><td className="p-2">{p.params?.exposureTimeS}s</td>
                        <td className="p-2"><Edit3 onClick={()=>openEditProfile(p)} className="h-5 w-5 cursor-pointer inline mr-3 text-blue-500"/><Trash2 className="h-5 w-5 text-red-500 cursor-pointer inline"/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === 'contacts' && <ContactsTab isAdmin={true} adminToken={adminToken} buildAdminUrl={buildAdminUrl} />}

          {activeTab === 'visual' && (
            <div className="space-y-6">
              {pendingVisualPhotos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-yellow-600 flex gap-2"><AlertTriangle/> Pendentes de Aprovação ({pendingVisualPhotos.length})</h3>
                  {pendingVisualPhotos.map(item => (
                    <PendingVisualItemForm key={item._id} item={item} onApprove={async () => { toast.success("Aprovado!"); loadAllData(); }} onDelete={() => {}} canDelete={true} />
                  ))}
                </div>
              )}
              <div className="pt-6 border-t">
                <h3 className="font-bold mb-4">Base de Conhecimento Visual</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visualKnowledge.map(v => (
                    <Card key={v._id} className="p-3">
                      <img src={v.imageUrl} className="w-full h-40 object-cover rounded mb-2"/>
                      <p className="text-sm font-bold uppercase">{v.defectType}</p>
                      <p className="text-xs text-gray-500 truncate">{v.diagnosis}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
