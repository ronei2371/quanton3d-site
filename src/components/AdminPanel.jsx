import { useCallback, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { X, User, Phone, MessageSquare, BarChart3, BookOpen, Plus, Beaker, Edit3, Mail, Camera, Loader2, Eye, Trash2, Upload, AlertCircle, Handshake, ShoppingBag, AlertTriangle, RefreshCw, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PartnersManager } from './PartnersManager.jsx'
import { MetricsTab } from './admin/MetricsTab.jsx'
import { SuggestionsTab } from './admin/SuggestionsTab.jsx'
import { OrdersTab } from './admin/OrdersTab.jsx'
// import { GalleryTab } from './admin/GalleryTab.jsx' // REMOVIDO PARA EVITAR ERRO
import { DocumentsTab } from './admin/DocumentsTab.jsx'
import { ContactsTab } from './admin/ContactsTab.jsx'

// --- GALERIA INTERNA BLINDADA (A Correção) ---
function InternalGalleryTab({ isAdmin, isVisible, adminToken, onPendingCountChange }) {
  const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  const loadPhotos = useCallback(async () => {
    if (!isVisible) return
    setLoading(true)
    setError(null)
    try {
      let response = await fetch(`${API_BASE_URL}/api/visual-knowledge`, {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      })
      if (response.status === 404) {
         response = await fetch(`${API_BASE_URL}/visual-knowledge`, {
            headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
         })
      }
      const text = await response.text()
      if (!response.ok) throw new Error(`Erro: ${response.status}`)
      let data
      try { data = JSON.parse(text) } catch { throw new Error("Erro JSON") }
      const safeList = Array.isArray(data.documents) ? data.documents : []
      setPhotos(safeList)
      if (onPendingCountChange) onPendingCountChange(safeList.filter(p => !p.approved).length)
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar.")
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [isVisible, adminToken, onPendingCountChange])

  useEffect(() => { loadPhotos() }, [loadPhotos])

  const handleAction = async (id, action) => {
    if (!isAdmin) return
    setProcessingId(id)
    try {
        const endpoint = action === 'delete' ? '' : '/approve'
        const method = action === 'delete' ? 'DELETE' : 'PUT'
        await fetch(`${API_BASE_URL}/api/visual-knowledge/${id}${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: action === 'approve' ? JSON.stringify({ defectType: 'Ok', diagnosis: 'Ok', solution: 'Ok' }) : undefined
        })
        toast.success("Sucesso!")
        loadPhotos()
    } catch { toast.error("Erro") } finally { setProcessingId(null) }
  }

  if (error) return <div className="p-4 bg-red-50 text-red-700 rounded"><p>{error}</p><Button onClick={loadPhotos} size="sm" variant="outline" className="mt-2 bg-white">Tentar Novamente</Button></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold flex gap-2"><Camera className="h-5 w-5"/> Galeria</h3>
        <Button onClick={loadPhotos} size="sm" disabled={loading}><RefreshCw className="h-4 w-4"/></Button>
      </div>
      {loading ? <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div> : 
       photos.length === 0 ? <p className="text-center text-gray-500 py-10">Vazio.</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.map(p => (
            <Card key={p._id} className="p-3">
              <img src={p.imageUrl} className="w-full h-40 object-cover rounded mb-2 bg-gray-100"/>
              <div className="flex gap-2 mt-2">
                {isAdmin && !p.approved && <Button size="sm" className="flex-1 bg-green-600" onClick={() => handleAction(p._id, 'approve')} disabled={processingId === p._id}><Check className="h-4 w-4"/></Button>}
                {isAdmin && <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleAction(p._id, 'delete')} disabled={processingId === p._id}><Trash2 className="h-4 w-4"/></Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
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
  const [accessLevel, setAccessLevel] = useState('admin')
  const [password, setPassword] = useState('')
  const [adminToken, setAdminToken] = useState('') 
  
  const safeAdminToken = adminToken || import.meta.env.VITE_ADMIN_API_TOKEN || ''
  
  const buildAuthHeaders = useCallback((headers = {}) => {
    if (!safeAdminToken) return headers
    return { ...headers, Authorization: `Bearer ${safeAdminToken}` }
  }, [safeAdminToken])
  
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

  const [paramsLoading, setParamsLoading] = useState(false)
  const [paramsResins, setParamsResins] = useState([])
  const [paramsPrinters, setParamsPrinters] = useState([])
  const [paramsProfiles, setParamsProfiles] = useState([])
  const [paramsStats, setParamsStats] = useState(null)
  const [newResinName, setNewResinName] = useState('')
  const [newPrinterBrand, setNewPrinterBrand] = useState('')
  const [newPrinterModel, setNewPrinterModel] = useState('')
  const [editingProfile, setEditingProfile] = useState(null)
  const [profileFormData, setProfileFormData] = useState({})
  
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
  
  const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'
  const ADMIN_PASSWORD = 'Rmartins1201'
  const TEAM_SECRET = 'suporte_quanton_2025'
  
  const isAdmin = accessLevel === 'admin'

  const buildAdminUrl = useCallback((path, params = {}) => {
    let finalPath = path
    if (!finalPath.startsWith('/api') && !finalPath.startsWith('/auth')) {
        if (!finalPath.startsWith('/admin')) {
             finalPath = `/admin${finalPath.startsWith('/') ? '' : '/'}${finalPath}`
        }
    }
    const url = new URL(finalPath, `${API_BASE_URL}/`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
    return url.toString()
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch(buildAdminUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()

      if (data.success && data.token) {
        setAccessLevel('admin')
        setIsAuthenticated(true)
        setAdminToken(data.token)
        toast.success('Login conectado ao servidor!')
        await refreshAllData(data.token)
        return
      }
    } catch (e) {
      console.warn('Login backend falhou, tentando fallback local...', e)
    } finally {
      setLoading(false)
    }

    if (password === ADMIN_PASSWORD) {
      setAccessLevel('admin')
      setIsAuthenticated(true)
      toast.info('Modo Admin Local')
      refreshAllData()
    } else if (password === TEAM_SECRET) {
      setAccessLevel('support')
      setIsAuthenticated(true)
      refreshAllData()
    } else {
      toast.error('Senha incorreta!')
    }
  }

  const refreshAllData = async (tokenOverride) => {
    const tokenToUse = tokenOverride || safeAdminToken
    setLoading(true)
    try {
      setMetricsRefreshKey((key) => key + 1)
      setSuggestionsRefreshKey((key) => key + 1)
      setOrdersRefreshKey((key) => key + 1)
      setKnowledgeRefreshKey((key) => key + 1)
      setContactRefreshKey((key) => key + 1)
      await Promise.all([
        loadCustomRequests(tokenToUse),
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

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData()
    }
  }, [isAuthenticated])

  const loadCustomRequests = async (tokenToUse) => {
    try {
      const token = tokenToUse || safeAdminToken
      const response = await fetch(buildAdminUrl('/api/admin/formulations'), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      const data = await response.json()
      setCustomRequests(data.formulations || data.requests || [])
    } catch (error) {
      console.error('Erro ao carregar pedidos customizados:', error)
    }
  }

  const loadVisualKnowledge = async () => {
    setVisualLoading(true)
    try {
      const response = await fetch(buildAdminUrl('/api/visual-knowledge'), {
        headers: buildAuthHeaders()
      })
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
      const response = await fetch(buildAdminUrl('/api/visual-knowledge/pending'), {
        headers: buildAuthHeaders()
      })
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
      const response = await fetch(buildAdminUrl(`/api/visual-knowledge/${id}/approve`), {
        method: 'PUT',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ defectType, diagnosis, solution })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Conhecimento visual aprovado com sucesso!')
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
    if (!isAdmin) return
    if (!confirm('Tem certeza que deseja deletar esta foto pendente?')) return
    try {
      await fetch(buildAdminUrl(`/api/visual-knowledge/${id}`), {
        method: 'DELETE',
        headers: buildAuthHeaders()
      })
      loadPendingVisualPhotos()
    } catch (error) {
      console.error(error)
    }
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

      await fetch(buildAdminUrl('/api/visual-knowledge'), {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: formData
      })
      
      toast.success('Adicionado!')
      setVisualImage(null)
      setVisualImagePreview(null)
      loadVisualKnowledge()
    } catch (error) {
      toast.error('Erro ao adicionar')
    } finally {
      setAddingVisual(false)
    }
  }

  const deleteVisualKnowledgeEntry = async (id) => {
    if (!isAdmin) return
    if (!confirm('Deletar?')) return
    try {
      await fetch(buildAdminUrl(`/api/visual-knowledge/${id}`), {
        method: 'DELETE',
        headers: buildAuthHeaders()
      })
      loadVisualKnowledge()
    } catch (error) {
      console.error(error)
    }
  }

  const loadParamsData = async () => {
    setParamsLoading(true)
    try {
      const [resinsRes, printersRes, profilesRes, statsRes] = await Promise.all([
        fetch(buildAdminUrl('/params/resins'), { headers: buildAuthHeaders() }),
        fetch(buildAdminUrl('/params/printers'), { headers: buildAuthHeaders() }),
        fetch(buildAdminUrl('/params/profiles'), { headers: buildAuthHeaders() }),
        fetch(buildAdminUrl('/params/stats'), { headers: buildAuthHeaders() })
      ])
      const [resinsData, printersData, profilesData, statsData] = await Promise.all([
        resinsRes.json(),
        printersRes.json(),
        profilesRes.json(),
        statsRes.json()
      ])
      if (resinsData.success) setParamsResins(resinsData.resins || [])
      if (printersData.success) setParamsPrinters(printersData.printers || [])
      if (profilesData.success) setParamsProfiles(profilesData.profiles || [])
      if (statsData.success) setParamsStats(statsData.stats || null)
    } catch (error) {
      console.error('Erro params:', error)
    } finally {
      setParamsLoading(false)
    }
  }

  const addResin = async () => {
    if (!newResinName.trim()) return
    await fetch(buildAdminUrl('/params/resins'), {
      method: 'POST',
      headers: buildAuthHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({name: newResinName})
    })
    setNewResinName('')
    loadParamsData()
  }
  
  const deleteResin = async (id) => {
    if(!isAdmin) return
    if(!confirm('Deletar?')) return
    await fetch(buildAdminUrl(`/params/resins/${id}`), {method: 'DELETE', headers: buildAuthHeaders()})
    loadParamsData()
  }

  const addPrinter = async () => {
    if (!newPrinterBrand.trim()) return
    await fetch(buildAdminUrl('/params/printers'), {
      method: 'POST',
      headers: buildAuthHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({brand: newPrinterBrand, model: newPrinterModel})
    })
    setNewPrinterBrand('')
    setNewPrinterModel('')
    loadParamsData()
  }

  const deletePrinter = async (id) => {
    if(!isAdmin) return
    if(!confirm('Deletar?')) return
    await fetch(buildAdminUrl(`/params/printers/${id}`), {method: 'DELETE', headers: buildAuthHeaders()})
    loadParamsData()
  }

  const openEditProfile = (profile) => {
    setEditingProfile(profile)
    setProfileFormData({
      resinId: profile.resinId || '',
      printerId: profile.printerId || '',
      status: profile.status || 'active',
      ...profile.params
    })
  }

  const saveProfile = async () => {
    await fetch(buildAdminUrl('/params/profiles'), {
      method: 'POST',
      headers: buildAuthHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({
        resinId: profileFormData.resinId,
        printerId: profileFormData.printerId,
        status: profileFormData.status || 'active',
        params: profileFormData
      })
    })
    setEditingProfile(null)
    loadParamsData()
  }

  const deleteProfile = async (id) => {
    if(!isAdmin) return
    if(!confirm('Deletar?')) return
    await fetch(buildAdminUrl(`/params/profiles/${id}`), {method: 'DELETE', headers: buildAuthHeaders()})
    loadParamsData()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Painel Administrativo</h2>
          <div className="space-y-4">
            <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
            <Button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">{loading ? 'Entrando...' : 'Entrar'}</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Painel Administrativo</h1>
          <div className="flex gap-3">
            <Button onClick={() => refreshAllData()} disabled={loading}><Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar</Button>
            <Button onClick={onClose} variant="outline"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button onClick={() => setActiveTab('metrics')} variant={activeTab === 'metrics' ? 'default' : 'outline'} className={activeTab === 'metrics' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><BarChart3 className="mr-2 h-4 w-4"/> Métricas</Button>
          <Button onClick={() => setActiveTab('suggestions')} variant={activeTab === 'suggestions' ? 'default' : 'outline'} className={activeTab === 'suggestions' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><MessageSquare className="mr-2 h-4 w-4"/> Sugestões</Button>
          <Button onClick={() => setActiveTab('orders')} variant={activeTab === 'orders' ? 'default' : 'outline'} className={activeTab === 'orders' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><ShoppingBag className="mr-2 h-4 w-4"/> Pedidos</Button>
          <Button onClick={() => setActiveTab('gallery')} variant={activeTab === 'gallery' ? 'default' : 'outline'} className={activeTab === 'gallery' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Camera className="mr-2 h-4 w-4"/> Galeria</Button>
          <Button onClick={() => setActiveTab('visual')} variant={activeTab === 'visual' ? 'default' : 'outline'} className={activeTab === 'visual' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Eye className="mr-2 h-4 w-4"/> Treinamento Visual</Button>
          <Button onClick={() => {setActiveTab('params'); loadParamsData();}} variant={activeTab === 'params' ? 'default' : 'outline'} className={activeTab === 'params' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Beaker className="mr-2 h-4 w-4"/> Parâmetros</Button>
          <Button onClick={() => setActiveTab('documents')} variant={activeTab === 'documents' ? 'default' : 'outline'} className={activeTab === 'documents' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><BookOpen className="mr-2 h-4 w-4"/> Documentos</Button>
          <Button onClick={() => setActiveTab('partners')} variant={activeTab === 'partners' ? 'default' : 'outline'} className={activeTab === 'partners' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Handshake className="mr-2 h-4 w-4"/> Parceiros</Button>
          <Button onClick={() => setActiveTab('contacts')} variant={activeTab === 'contacts' ? 'default' : 'outline'} className={activeTab === 'contacts' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Phone className="mr-2 h-4 w-4"/> Contatos</Button>
          <Button onClick={() => {setActiveTab('custom'); loadCustomRequests();}} variant={activeTab === 'custom' ? 'default' : 'outline'} className={activeTab === 'custom' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Beaker className="mr-2 h-4 w-4"/> Formulações</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
          {activeTab === 'metrics' && <MetricsTab apiToken={safeAdminToken} buildAdminUrl={buildAdminUrl} refreshKey={metricsRefreshKey} />}
          
          {activeTab === 'suggestions' && <SuggestionsTab isAdmin={isAdmin} isVisible={true} adminToken={safeAdminToken} buildAdminUrl={buildAdminUrl} onCountChange={setSuggestionsCount} refreshKey={suggestionsRefreshKey} />}
          
          {activeTab === 'orders' && <OrdersTab isAdmin={isAdmin} isVisible={true} adminToken={safeAdminToken} buildAdminUrl={buildAdminUrl} onCountChange={setOrdersPendingCount} refreshKey={ordersRefreshKey} />}
          
          {/* ✅ GALERIA INTERNA BLINDADA */}
          {activeTab === 'gallery' && <InternalGalleryTab isAdmin={isAdmin} isVisible={true} adminToken={safeAdminToken} onPendingCountChange={setGalleryPendingCount} />}
          
          {activeTab === 'documents' && <DocumentsTab isAdmin={isAdmin} refreshKey={knowledgeRefreshKey} />}
          
          {activeTab === 'contacts' && <ContactsTab isAdmin={isAdmin} isVisible={true} adminToken={safeAdminToken} buildAdminUrl={buildAdminUrl} onCountChange={setContactCount} refreshKey={contactRefreshKey} />}
          
          {activeTab === 'partners' && <PartnersManager isAdmin={isAdmin} />}

          {/* VISUAL (MANTIDO) */}
          {activeTab === 'visual' && (
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Eye className="h-5 w-5"/> Treinamento Visual</h3>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4 mb-6">
                  <h4 className="font-semibold flex gap-2"><Upload className="h-4 w-4"/> Adicionar Novo</h4>
                  <input type="file" onChange={(e) => {
                    const file = e.target.files[0]; setVisualImage(file);
                    if(file) { const r = new FileReader(); r.onload = () => setVisualImagePreview(r.result); r.readAsDataURL(file); }
                  }} className="w-full border rounded p-2 bg-white dark:bg-gray-600"/>
                  {visualImagePreview && <img src={visualImagePreview} className="h-32 object-contain"/>}
                  
                  <select value={visualDefectType} onChange={(e) => setVisualDefectType(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-gray-600">
                    <option value="">Tipo de Defeito...</option>
                    <option value="descolamento da base">Descolamento</option>
                    <option value="falha de suportes">Suportes</option>
                    <option value="outro">Outro</option>
                  </select>
                  <textarea value={visualDiagnosis} onChange={(e) => setVisualDiagnosis(e.target.value)} placeholder="Diagnóstico" className="w-full p-2 border rounded bg-white dark:bg-gray-600"/>
                  <textarea value={visualSolution} onChange={(e) => setVisualSolution(e.target.value)} placeholder="Solução" className="w-full p-2 border rounded bg-white dark:bg-gray-600"/>
                  <Button onClick={addVisualKnowledgeEntry} disabled={addingVisual} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">{addingVisual ? 'Enviando...' : 'Adicionar'}</Button>
                </div>

                {pendingVisualPhotos.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h4 className="font-bold text-yellow-600">Pendentes ({pendingVisualPhotos.length})</h4>
                    {pendingVisualPhotos.map(item => (
                      <PendingVisualItemForm key={item._id} item={item} onApprove={approvePendingVisual} onDelete={deletePendingVisual} canDelete={isAdmin} />
                    ))}
                  </div>
                )}

                <div className="grid gap-4">
                  {visualKnowledge.map(item => (
                    <div key={item._id} className="flex gap-4 p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                      <img src={item.imageUrl} className="w-24 h-24 object-cover rounded"/>
                      <div className="flex-1">
                        <p className="font-bold">{item.defectType}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.diagnosis}</p>
                        {isAdmin && <Button size="sm" variant="outline" onClick={() => deleteVisualKnowledgeEntry(item._id)} className="mt-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4"/> Deletar</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* PARAMS (MANTIDO) */}
          {activeTab === 'params' && (
            <div className="space-y-6">
              {paramsStats && (
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-4"><p>Resinas</p><p className="text-2xl font-bold">{paramsStats.totalResins}</p></Card>
                  <Card className="p-4"><p>Impressoras</p><p className="text-2xl font-bold">{paramsStats.totalPrinters}</p></Card>
                  <Card className="p-4"><p>Perfis</p><p className="text-2xl font-bold">{paramsStats.activeProfiles}</p></Card>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-bold mb-2">Resinas</h3>
                  <div className="flex gap-2 mb-2"><Input value={newResinName} onChange={e=>setNewResinName(e.target.value)}/><Button onClick={addResin}><Plus/></Button></div>
                  {paramsResins.map(r => <div key={r.id} className="flex justify-between p-1 border-b">{r.name} <Trash2 onClick={()=>deleteResin(r.id)} className="h-4 w-4 cursor-pointer text-red-500"/></div>)}
                </Card>
                <Card className="p-4">
                  <h3 className="font-bold mb-2">Impressoras</h3>
                  <div className="flex gap-2 mb-2"><Input placeholder="Marca" value={newPrinterBrand} onChange={e=>setNewPrinterBrand(e.target.value)}/><Input placeholder="Modelo" value={newPrinterModel} onChange={e=>setNewPrinterModel(e.target.value)}/><Button onClick={addPrinter}><Plus/></Button></div>
                  {paramsPrinters.map(p => <div key={p.id} className="flex justify-between p-1 border-b">{p.brand} {p.model} <Trash2 onClick={()=>deletePrinter(p.id)} className="h-4 w-4 cursor-pointer text-red-500"/></div>)}
                </Card>
              </div>

              <Card className="p-4">
                <div className="flex justify-between mb-4"><h3 className="font-bold">Perfis</h3><Button onClick={()=>openEditProfile({})}>Novo</Button></div>
                <table className="w-full text-sm">
                  <thead><tr><th>Resina</th><th>Impressora</th><th>Camada</th><th>Exp.</th><th>Ações</th></tr></thead>
                  <tbody>
                    {paramsProfiles.map(p => (
                      <tr key={p.id} className="border-b">
                        <td>{p.resinName}</td><td>{p.brand} {p.model}</td><td>{p.params?.layerHeightMm}</td><td>{p.params?.exposureTimeS}</td>
                        <td><Edit3 onClick={()=>openEditProfile(p)} className="h-4 w-4 cursor-pointer inline mr-2"/><Trash2 onClick={()=>deleteProfile(p.id)} className="h-4 w-4 cursor-pointer text-red-500 inline"/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {editingProfile && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                  <Card className="p-6 w-full max-w-lg bg-white dark:bg-gray-800 overflow-y-auto max-h-[90vh]">
                    <h3 className="font-bold mb-4">Editar Perfil</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={profileFormData.resinId} onChange={e=>setProfileFormData({...profileFormData, resinId: e.target.value})} className="border p-2 rounded bg-white dark:bg-gray-700">
                        <option value="">Resina...</option>{paramsResins.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <select value={profileFormData.printerId} onChange={e=>setProfileFormData({...profileFormData, printerId: e.target.value})} className="border p-2 rounded bg-white dark:bg-gray-700">
                        <option value="">Impressora...</option>{paramsPrinters.map(p=><option key={p.id} value={p.id}>{p.brand} {p.model}</option>)}
                      </select>
                      <Input placeholder="Camada (mm)" value={profileFormData.layerHeightMm} onChange={e=>setProfileFormData({...profileFormData, layerHeightMm: e.target.value})}/>
                      <Input placeholder="Expo (s)" value={profileFormData.exposureTimeS} onChange={e=>setProfileFormData({...profileFormData, exposureTimeS: e.target.value})}/>
                      <Input placeholder="Base (s)" value={profileFormData.baseExposureTimeS} onChange={e=>setProfileFormData({...profileFormData, baseExposureTimeS: e.target.value})}/>
                      <Input placeholder="Camadas Base" value={profileFormData.baseLayers} onChange={e=>setProfileFormData({...profileFormData, baseLayers: e.target.value})}/>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={()=>setEditingProfile(null)}>Cancelar</Button>
                      <Button onClick={saveProfile}>Salvar</Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === 'custom' && (
            <div>
              {customRequests.length === 0 ? <p className="text-center p-8 text-gray-500">Sem pedidos.</p> : customRequests.map((req, i) => (
                <Card key={i} className="p-4 mb-4">
                  <div className="flex justify-between"><h4 className="font-bold">{req.name}</h4><span className="text-xs">{new Date(req.createdAt).toLocaleDateString()}</span></div>
                  <p className="text-sm">Característica: {req.caracteristica}</p>
                  <Button size="sm" className="mt-2 bg-green-600" onClick={()=>window.open(`https://wa.me/55${req.phone}`)}><Phone className="h-4 w-4 mr-2"/> WhatsApp</Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
