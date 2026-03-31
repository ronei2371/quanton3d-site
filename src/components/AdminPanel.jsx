import { useCallback, useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { X, Check, User, Phone, MessageSquare, BarChart3, BookOpen, Plus, Beaker, Edit3, Mail, Camera, Loader2, Eye, Trash2, Upload, AlertCircle, Handshake, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { PartnersManager } from './PartnersManager.jsx'
import { MetricsTab } from './admin/MetricsTab.jsx'
import { SuggestionsTab } from './admin/SuggestionsTab.jsx'
import { OrdersTab } from './admin/OrdersTab.jsx'
import { GalleryTab } from './admin/GalleryTab.jsx'
import { DocumentsTab } from './admin/DocumentsTab.jsx'
import { ContactsTab } from './admin/ContactsTab.jsx'

function PendingVisualItemForm({ item, onApprove, onDelete, canDelete }) {
  const [defectType, setDefectType] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [solution, setSolution] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApproveClick = async () => {
    setIsSubmitting(true)
    try {
      const success = await onApprove(item._id, defectType, diagnosis, solution)
      if (success) {
        setDefectType('')
        setDiagnosis('')
        setSolution('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
      <div className="flex gap-4">
        <img 
          src={item.imageUrl} 
          alt="Foto pendente" 
          className="w-40 h-40 object-cover rounded-lg border flex-shrink-0"
        />
        <div className="flex-1 space-y-3">
          <div className="text-xs text-gray-500">
            Enviada em: {new Date(item.createdAt).toLocaleString('pt-BR')}
            {item.userName && <span className="ml-2">| Cliente: {item.userName}</span>}
          </div>
          <select
            value={defectType}
            onChange={(e) => setDefectType(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600"
          >
            <option value="">Selecione o tipo de defeito...</option>
            <option value="descolamento da base">Descolamento da base</option>
            <option value="falha de suportes">Falha de suportes</option>
            <option value="rachadura/quebra da peca">Rachadura/quebra da peca</option>
            <option value="falha de adesao entre camadas / delaminacao">Delaminacao</option>
            <option value="deformacao/warping">Deformacao/warping</option>
            <option value="problema de superficie/acabamento">Problema de superficie</option>
            <option value="excesso ou falta de cura">Excesso ou falta de cura</option>
            <option value="problema de LCD">Problema de LCD</option>
            <option value="outro">Outro</option>
          </select>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Diagnostico tecnico..."
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600 min-h-[60px]"
          />
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Solucao recomendada..."
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600 min-h-[60px]"
          />
          <div className="flex gap-2">
            <Button 
              size="sm"
              onClick={handleApproveClick}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Aprovando...' : 'Aprovar e Treinar'}
            </Button>
            {canDelete && (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => onDelete(item._id)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Descartar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessLevel, setAccessLevel] = useState(null)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('metrics')
  const [metricsRefreshKey, setMetricsRefreshKey] = useState(0)
  const [suggestionsCount, setSuggestionsCount] = useState(0)
  const [suggestionsRefreshKey, setSuggestionsRefreshKey] = useState(0)
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)
  const [ordersPendingCount, setOrdersPendingCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [knowledgeRefreshKey, setKnowledgeRefreshKey] = useState(0)
  const [customRequests, setCustomRequests] = useState([])
  const [galleryPendingCount, setGalleryPendingCount] = useState(0)
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0)
  const [contactCount, setContactCount] = useState(0)
  const [contactRefreshKey, setContactRefreshKey] = useState(0)
  const [visualKnowledge, setVisualKnowledge] = useState([])
  const [visualLoading, setVisualLoading] = useState(false)
  const [visualImage, setVisualImage] = useState(null)
  const [visualImagePreview, setVisualImagePreview] = useState(null)
  const [pendingVisualPhotos, setPendingVisualPhotos] = useState([])
  const [pendingVisualLoading, setPendingVisualLoading] = useState(false)
  const [visualDefectType, setVisualDefectType] = useState('')
  const [visualDiagnosis, setVisualDiagnosis] = useState('')
  const [visualSolution, setVisualSolution] = useState('')
  const [addingVisual, setAddingVisual] = useState(false)
  const [paramsResins, setParamsResins] = useState([])
  const [paramsPrinters, setParamsPrinters] = useState([])
  const [paramsProfiles, setParamsProfiles] = useState([])
  const [paramsLoading, setParamsLoading] = useState(false)
  const [paramsStats, setParamsStats] = useState(null)
  const [newResinName, setNewResinName] = useState('')
  const [newPrinterBrand, setNewPrinterBrand] = useState('')
  const [newPrinterModel, setNewPrinterModel] = useState('')
  const [editingProfile, setEditingProfile] = useState(null)
  const [profileFormData, setProfileFormData] = useState({})

  const API_BASE_URL = useMemo(() => {
    const url = import.meta.env.VITE_API_URL || window.location.origin
    return url.replace(/\/api\/?$/, '').replace(/\/$/, '')
  }, [])

  const buildAdminUrl = useCallback((path, params = {}) => {
    const cleanPath = path.replace(/^\/+/, '').replace(/^api\//, '')
    const url = new URL(`api/${cleanPath}`, `${API_BASE_URL}/`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
    return url.toString()
  }, [API_BASE_URL])

  const ADMIN_PASSWORD = 'Rmartins1201'
  const TEAM_SECRET = 'suporte_quanton_2025'
  
  const isAdmin = accessLevel === 'admin'

  const refreshAllData = async () => {
    setLoading(true)
    try {
      setMetricsRefreshKey((key) => key + 1)
      setSuggestionsRefreshKey((key) => key + 1)
      setOrdersRefreshKey((key) => key + 1)
      setKnowledgeRefreshKey((key) => key + 1)
      setContactRefreshKey((key) => key + 1)
      await Promise.all([
        loadCustomRequests(),
        loadVisualKnowledge(),
        loadPendingVisualPhotos(),
        loadParamsData()
      ])
      setGalleryRefreshKey((key) => key + 1)
    } catch (error) {
      console.error('Erro ao atualizar painel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (password === ADMIN_PASSWORD) {
      setAccessLevel('admin')
      setIsAuthenticated(true)
    } else if (password === TEAM_SECRET) {
      setAccessLevel('support')
      setIsAuthenticated(true)
    } else {
      toast.error('Senha incorreta!')
      return
    }
    await refreshAllData()
  }

  const loadCustomRequests = async () => {
    try {
      const response = await fetch(buildAdminUrl('/custom-requests'))
      const data = await response.json()
      setCustomRequests(data.requests || [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    }
  }

  const loadVisualKnowledge = async () => {
    setVisualLoading(true)
    try {
      const response = await fetch(buildAdminUrl('/visual-knowledge'))
      const data = await response.json()
      setVisualKnowledge(data.documents || [])
    } catch (error) {
      console.error('Erro ao carregar conhecimento visual:', error)
    } finally {
      setVisualLoading(false)
    }
  }

  const loadPendingVisualPhotos = async () => {
    setPendingVisualLoading(true)
    try {
      const response = await fetch(buildAdminUrl('/visual-knowledge/pending'))
      const data = await response.json()
      setPendingVisualPhotos(data.documents || [])
    } catch (error) {
      console.error('Erro ao carregar fotos pendentes:', error)
    } finally {
      setPendingVisualLoading(false)
    }
  }

  const approvePendingVisual = async (id, defectType, diagnosis, solution) => {
    if (!defectType || !diagnosis || !solution) {
      toast.warning('Preencha todos os campos antes de aprovar')
      return false
    }
    try {
      const response = await fetch(buildAdminUrl(`/visual-knowledge/${id}/approve`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defectType, diagnosis, solution })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Treinamento aprovado!')
        loadPendingVisualPhotos()
        loadVisualKnowledge()
        return true
      }
      return false
    } catch (error) {
      toast.error('Erro ao aprovar')
      return false
    }
  }

  const deletePendingVisual = async (id) => {
    if (!isAdmin) { toast.warning('Acesso negado'); return }
    if (!confirm('Deletar esta foto?')) return
    try {
      const response = await fetch(buildAdminUrl(`/visual-knowledge/${id}`), { method: 'DELETE' })
      const data = await response.json()
      if (data.success) loadPendingVisualPhotos()
    } catch (error) { console.error(error) }
  }

  const addVisualKnowledgeEntry = async () => {
    if (!visualImage || !visualDefectType || !visualDiagnosis || !visualSolution) {
      toast.warning('Preencha tudo')
      return
    }
    setAddingVisual(true)
    try {
      const formData = new FormData()
      formData.append('image', visualImage)
      formData.append('defectType', visualDefectType)
      formData.append('diagnosis', visualDiagnosis)
      formData.append('solution', visualSolution)
      const response = await fetch(buildAdminUrl('/visual-knowledge'), { method: 'POST', body: formData })
      const data = await response.json()
      if (data.success) {
        toast.success('Adicionado!')
        setVisualImage(null); setVisualImagePreview(null);
        loadVisualKnowledge()
      }
    } finally { setAddingVisual(false) }
  }

  const loadParamsData = async () => {
    setParamsLoading(true)
    try {
      const [resinsRes, printersRes, profilesRes, statsRes] = await Promise.all([
        fetch(buildAdminUrl('/params/resins')),
        fetch(buildAdminUrl('/params/printers')),
        fetch(buildAdminUrl('/params/profiles')),
        fetch(buildAdminUrl('/params/stats'))
      ])
      const [resinsData, printersData, profilesData, statsData] = await Promise.all([
        resinsRes.json(), printersRes.json(), profilesRes.json(), statsRes.json()
      ])
      if (resinsData.success) setParamsResins(resinsData.resins || [])
      if (printersData.success) setParamsPrinters(printersData.printers || [])
      if (profilesData.success) setParamsProfiles(profilesData.profiles || [])
      if (statsData.success) setParamsStats(statsData.stats || null)
    } finally { setParamsLoading(false) }
  }

  const addResin = async () => {
    if (!newResinName.trim()) return
    const res = await fetch(buildAdminUrl('/params/resins'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newResinName.trim() })
    })
    if ((await res.json()).success) { setNewResinName(''); loadParamsData(); toast.success('Ok!'); }
  }

  const deleteResin = async (id) => {
    if (!isAdmin) return
    if (confirm('Deletar?')) {
      await fetch(buildAdminUrl(`/params/resins/${id}`), { method: 'DELETE' })
      loadParamsData()
    }
  }

  const addPrinter = async () => {
    if (!newPrinterBrand.trim() || !newPrinterModel.trim()) return
    await fetch(buildAdminUrl('/params/printers'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand: newPrinterBrand.trim(), model: newPrinterModel.trim() })
    })
    setNewPrinterBrand(''); setNewPrinterModel(''); loadParamsData()
  }

  const saveProfile = async () => {
    await fetch(buildAdminUrl('/params/profiles'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profileFormData, params: { ...profileFormData } })
    })
    setEditingProfile(null); loadParamsData(); toast.success('Salvo!')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Painel Administrativo
          </h2>
          <div className="space-y-4">
            <Input type="password" placeholder="Senha do painel" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
            <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Entrar</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Painel Administrativo</h1>
          <div className="flex gap-3">
            <Button onClick={refreshAllData} disabled={loading}>{loading ? '...' : 'Atualizar'}</Button>
            {onClose && <Button onClick={onClose} variant="outline"><X className="h-4 w-4" /></Button>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={() => setActiveTab('metrics')} variant={activeTab === 'metrics' ? 'default' : 'outline'}><BarChart3 className="h-4 w-4 mr-2" /> Métricas</Button>
          <Button onClick={() => setActiveTab('suggestions')} variant={activeTab === 'suggestions' ? 'default' : 'outline'}><MessageSquare className="h-4 w-4 mr-2" /> Sugestões ({suggestionsCount})</Button>
          <Button onClick={() => setActiveTab('orders')} variant={activeTab === 'orders' ? 'default' : 'outline'}><ShoppingBag className="h-4 w-4 mr-2" /> Pedidos ({ordersPendingCount})</Button>
          <Button onClick={() => setActiveTab('knowledge')} variant={activeTab === 'knowledge' ? 'default' : 'outline'}><BookOpen className="h-4 w-4 mr-2" /> Conhecimento</Button>
          <Button onClick={() => setActiveTab('custom')} variant={activeTab === 'custom' ? 'default' : 'outline'}><Beaker className="h-4 w-4 mr-2" /> Fórmulas ({customRequests.length})</Button>
          <Button onClick={() => setActiveTab('messages')} variant={activeTab === 'messages' ? 'default' : 'outline'}><Mail className="h-4 w-4 mr-2" /> Mensagens ({contactCount})</Button>
          <Button onClick={() => setActiveTab('gallery')} variant={activeTab === 'gallery' ? 'default' : 'outline'}><Camera className="h-4 w-4 mr-2" /> Galeria ({galleryPendingCount})</Button>
          <Button onClick={() => setActiveTab('visual')} variant={activeTab === 'visual' ? 'default' : 'outline'}><Eye className="h-4 w-4 mr-2" /> Treino Visual</Button>
          <Button onClick={() => setActiveTab('partners')} variant={activeTab === 'partners' ? 'default' : 'outline'}><Handshake className="h-4 w-4 mr-2" /> Parceiros</Button>
          <Button onClick={() => setActiveTab('params')} variant={activeTab === 'params' ? 'default' : 'outline'}><Beaker className="h-4 w-4 mr-2" /> Parâmetros</Button>
        </div>

        {activeTab === 'metrics' && <MetricsTab buildAdminUrl={buildAdminUrl} refreshKey={metricsRefreshKey} />}
        {activeTab === 'knowledge' && <DocumentsTab isAdmin={isAdmin} refreshKey={knowledgeRefreshKey} />}
        {activeTab === 'custom' && (
          <div className="grid gap-4">
            {customRequests.map((req, i) => (
              <Card key={i} className="p-4">
                <div className="flex justify-between">
                  <p className="font-bold">{req.name} - {req.cor}</p>
                  <Button size="sm" onClick={() => window.open(`https://wa.me/55${req.phone.replace(/\D/g, '')}`)}>WhatsApp</Button>
                </div>
                <p className="text-sm mt-2">{req.caracteristica}</p>
              </Card>
            ))}
          </div>
        )}
        {activeTab === 'messages' && <ContactsTab buildAdminUrl={buildAdminUrl} isVisible={true} onCountChange={setContactCount} refreshKey={contactRefreshKey} />}
        {activeTab === 'suggestions' && <SuggestionsTab buildAdminUrl={buildAdminUrl} isAdmin={isAdmin} isVisible={true} onCountChange={setSuggestionsCount} refreshKey={suggestionsRefreshKey} />}
        {activeTab === 'orders' && <OrdersTab buildAdminUrl={buildAdminUrl} isAdmin={isAdmin} isVisible={true} onCountChange={setOrdersPendingCount} refreshKey={ordersRefreshKey} />}
        {activeTab === 'gallery' && <GalleryTab isAdmin={isAdmin} isVisible={true} refreshKey={galleryRefreshKey} onPendingCountChange={setGalleryPendingCount} />}
        {activeTab === 'visual' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Novo Treino Visual</h3>
              <input type="file" onChange={(e) => setVisualImage(e.target.files[0])} className="mb-4 block" />
              <select value={visualDefectType} onChange={(e) => setVisualDefectType(e.target.value)} className="w-full p-2 border rounded mb-2">
                <option value="">Defeito...</option>
                <option value="descolamento da base">Descolamento</option>
                <option value="falha de suportes">Suportes</option>
              </select>
              <textarea placeholder="Diagnóstico" value={visualDiagnosis} onChange={(e) => setVisualDiagnosis(e.target.value)} className="w-full p-2 border rounded mb-2" />
              <textarea placeholder="Solução" value={visualSolution} onChange={(e) => setVisualSolution(e.target.value)} className="w-full p-2 border rounded mb-4" />
              <Button onClick={addVisualKnowledgeEntry} disabled={addingVisual}>Salvar no Cérebro do ELIO</Button>
            </Card>
            {pendingVisualPhotos.map(p => <PendingVisualItemForm key={p._id} item={p} onApprove={approvePendingVisual} onDelete={deletePendingVisual} canDelete={isAdmin} />)}
          </div>
        )}
        {activeTab === 'partners' && <PartnersManager />}
        {activeTab === 'params' && (
           <Card className="p-6">
              <h3 className="font-bold mb-4">Gerenciar Resinas e Impressoras</h3>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Nova Resina" value={newResinName} onChange={e => setNewResinName(e.target.value)} />
                <Button onClick={addResin}>Adicionar</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {paramsResins.map(r => <div key={r.id} className="p-2 border rounded flex justify-between">{r.name} <Trash2 className="h-4 cursor-pointer text-red-500" onClick={() => deleteResin(r.id)} /></div>)}
              </div>
           </Card>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
