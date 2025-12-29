import { useCallback, useState } from 'react'
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
        // Limpar campos apos aprovacao bem-sucedida
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
  const [accessLevel, setAccessLevel] = useState(null) // 'admin' | 'support' | null
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('metrics') // 'metrics' | 'suggestions' | 'orders' | 'knowledge' | 'custom' | 'messages' | 'gallery' | 'visual' | 'partners'
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
  // Visual RAG states
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
  // Estados para gerenciamento de parametros de impressao
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

  const API_BASE_URL = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '')
  const ADMIN_API_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN || ''

  const buildAdminUrl = useCallback((path, params = {}) => {
    const url = new URL(path, `${API_BASE_URL}/`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
    return url.toString()
  }, [API_BASE_URL])

  // Senhas de acesso- Admin tem acesso total, Equipe tem acesso limitado (sem excluir)
  const ADMIN_PASSWORD = 'Rmartins1201'
  const TEAM_SECRET = 'suporte_quanton_2025'
  
  // Helpers para verificar nivel de acesso
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
      console.error('Erro ao carregar pedidos customizados:', error)
    }
  }

    // Visual RAG functions
      const loadVisualKnowledge = async () => {
        setVisualLoading(true)
        try {
          const response = await fetch(buildAdminUrl('/api/visual-knowledge'))
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
          const response = await fetch(buildAdminUrl('/api/visual-knowledge/pending'))
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ defectType, diagnosis, solution })
          })
        const data = await response.json()
        if (data.success) {
          toast.success('Conhecimento visual aprovado com sucesso!')
          loadPendingVisualPhotos()
          loadVisualKnowledge()
          return true
        } else {
          toast.error('Erro: ' + data.error)
          return false
        }
      } catch (error) {
        console.error('Erro ao aprovar conhecimento visual:', error)
        toast.error('Erro ao aprovar conhecimento visual')
        return false
      }
    }

    const deletePendingVisual = async (id) => {
        if (!isAdmin) {
          toast.warning('Seu nivel de acesso nao permite excluir dados.')
          return
        }
        if (!confirm('Tem certeza que deseja deletar esta foto pendente?')) return
        try {
          const response = await fetch(buildAdminUrl(`/api/visual-knowledge/${id}`), {
            method: 'DELETE'
          })
          const data = await response.json()
        if (data.success) {
          loadPendingVisualPhotos()
        } else {
          toast.error('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao deletar foto pendente:', error)
        toast.error('Erro ao deletar foto pendente')
      }
    }

    const addVisualKnowledgeEntry = async () => {
      if (!visualImage || !visualDefectType || !visualDiagnosis || !visualSolution) {
        toast.warning('Preencha todos os campos e selecione uma imagem')
        return
      }

        setAddingVisual(true)
        try {
          const formData = new FormData()
          formData.append('image', visualImage)
          formData.append('defectType', visualDefectType)
          formData.append('diagnosis', visualDiagnosis)
          formData.append('solution', visualSolution)

          const response = await fetch(buildAdminUrl('/api/visual-knowledge'), {
            method: 'POST',
          body: formData
          })
        const data = await response.json()
        
        if (data.success) {
          toast.success('Conhecimento visual adicionado com sucesso!')
          setVisualImage(null)
          setVisualImagePreview(null)
          setVisualDefectType('')
          setVisualDiagnosis('')
          setVisualSolution('')
          loadVisualKnowledge()
        } else {
          toast.error('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao adicionar conhecimento visual:', error)
        toast.error('Erro ao adicionar conhecimento visual')
      } finally {
        setAddingVisual(false)
      }
    }

    const deleteVisualKnowledgeEntry= async (id) => {
        if (!isAdmin) {
          toast.warning('Seu nivel de acesso nao permite excluir dados.')
          return
        }
        if (!confirm('Tem certeza que deseja deletar este conhecimento visual?')) return

        try {
          const response = await fetch(buildAdminUrl(`/api/visual-knowledge/${id}`), {
            method: 'DELETE'
          })
          const data = await response.json()
        
        if (data.success) {
          loadVisualKnowledge()
        } else {
          toast.error('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao deletar conhecimento visual:', error)
        toast.error('Erro ao deletar conhecimento visual')
      }
    }

    // Funcoes para gerenciamento de parametros de impressao
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
        console.error('Erro ao carregar parametros:', error)
      } finally {
        setParamsLoading(false)
      }
    }

    const addResin = async () => {
      if (!newResinName.trim()) {
        toast.warning('Digite o nome da resina')
        return
      }
      try {
        const response = await fetch(buildAdminUrl('/params/resins'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newResinName.trim() })
        })
        const data = await response.json()
        if (data.success) {
          setNewResinName('')
          loadParamsData()
          toast.success('Resina adicionada com sucesso!')
        } else {
          toast.error('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao adicionar resina:', error)
        toast.error('Erro ao adicionar resina')
      }
    }

    const deleteResin = async (resinId) => {
      if (!isAdmin) {
        toast.warning('Seu nivel de acesso nao permite excluir dados.')
        return
      }
      if (!confirm('Tem certeza que deseja deletar esta resina e todos os perfis associados?')) return
      try {
        const response = await fetch(buildAdminUrl(`/params/resins/${resinId}`), {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          loadParamsData()
          toast.success('Resina deletada com sucesso!')
        } else {
          toast.error('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao deletar resina:', error)
        toast.error('Erro ao deletar resina')
      }
    }

    const addPrinter = async () => {
      if (!newPrinterBrand.trim() || !newPrinterModel.trim()) {
        toast.warning('Digite a marca e o modelo da impressora')
        return
      }
      try {
        const response = await fetch(buildAdminUrl('/params/printers'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand: newPrinterBrand.trim(), model: newPrinterModel.trim() })
        })
        const data = await response.json()
        if (data.success) {
          setNewPrinterBrand('')
          setNewPrinterModel('')
          loadParamsData()
          toast.success('Impressora adicionada com sucesso!')
        } else {
          toast.error('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao adicionar impressora:', error)
        toast.error('Erro ao adicionar impressora')
      }
    }

    const deletePrinter = async (printerId) => {
      if (!isAdmin) {
        toast.warning('Seu nivel de acesso nao permite excluir dados.')
        return
      }
      if (!confirm('Tem certeza que deseja deletar esta impressora e todos os perfis associados?')) return
      try {
        const response = await fetch(buildAdminUrl(`/params/printers/${printerId}`), {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          loadParamsData()
          toast.success('Impressora deletada com sucesso!')
        } else {
          toast.error('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao deletar impressora:', error)
        toast.error('Erro ao deletar impressora')
      }
    }

    const openEditProfile = (profile) => {
      setEditingProfile(profile)
      setProfileFormData({
        resinId: profile.resinId || '',
        printerId: profile.printerId || '',
        status: profile.status || 'active',
        layerHeightMm: profile.params?.layerHeightMm || '',
        exposureTimeS: profile.params?.exposureTimeS || '',
        baseExposureTimeS: profile.params?.baseExposureTimeS || '',
        baseLayers: profile.params?.baseLayers || '',
        uvOffDelayS: profile.params?.uvOffDelayS || '',
        restBeforeLiftS: profile.params?.restBeforeLiftS || '',
        restAfterLiftS: profile.params?.restAfterLiftS || '',
        restAfterRetractS: profile.params?.restAfterRetractS || '',
        uvPower: profile.params?.uvPower || ''
      })
    }

    const saveProfile = async () => {
      if (!profileFormData.resinId || !profileFormData.printerId) {
        toast.warning('Selecione a resina e a impressora')
        return
      }
      try {
        const response = await fetch(buildAdminUrl('/params/profiles'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resinId: profileFormData.resinId,
            printerId: profileFormData.printerId,
            status: profileFormData.status || 'active',
            params: {
              layerHeightMm: profileFormData.layerHeightMm || null,
              exposureTimeS: profileFormData.exposureTimeS || null,
              baseExposureTimeS: profileFormData.baseExposureTimeS || null,
              baseLayers: profileFormData.baseLayers || null,
              uvOffDelayS: profileFormData.uvOffDelayS || null,
              restBeforeLiftS: profileFormData.restBeforeLiftS || null,
              restAfterLiftS: profileFormData.restAfterLiftS || null,
              restAfterRetractS: profileFormData.restAfterRetractS || null,
              uvPower: profileFormData.uvPower || null
            }
          })
        })
        const data = await response.json()
        if (data.success) {
          setEditingProfile(null)
          setProfileFormData({})
          loadParamsData()
          toast.success('Perfil salvo com sucesso!')
        } else {
          toast.error('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao salvar perfil:', error)
        toast.error('Erro ao salvar perfil')
      }
    }

    const deleteProfile = async (profileId) => {
      if (!isAdmin) {
        toast.warning('Seu nivel de acesso nao permite excluir dados.')
        return
      }
      if (!confirm('Tem certeza que deseja deletar este perfil?')) return
      try {
        const response = await fetch(buildAdminUrl(`/params/profiles/${profileId}`), {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          loadParamsData()
          toast.success('Perfil deletado com sucesso!')
        } else {
          toast.error('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao deletar perfil:', error)
        toast.error('Erro ao deletar perfil')
      }
    }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Painel Administrativo
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Métricas e Gestão de Conhecimento
          </p>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Senha do painel (admin ou equipe)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
              Entrar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isAdmin 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {isAdmin ? 'Admin' : 'Equipe'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={refreshAllData} disabled={loading}>
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button 
            onClick={() => setActiveTab('metrics')}
            variant={activeTab === 'metrics' ? 'default' : 'outline'}
            className={activeTab === 'metrics' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Métricas
          </Button>
          <Button 
            onClick={() => setActiveTab('suggestions')}
            variant={activeTab === 'suggestions' ? 'default' : 'outline'}
            className={activeTab === 'suggestions' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Sugestões ({suggestionsCount})
          </Button>
          <Button 
            onClick={() => setActiveTab('orders')}
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            className={activeTab === 'orders' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Pedidos ({ordersPendingCount})
          </Button>
          <Button 
            onClick={() => { setActiveTab('knowledge'); setKnowledgeRefreshKey((key) => key + 1); }}
            variant={activeTab === 'knowledge' ? 'default' : 'outline'}
            className={activeTab === 'knowledge' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Gestão de Conhecimento
          </Button>
          <Button 
            onClick={() => setActiveTab('custom')}
            variant={activeTab === 'custom' ? 'default' : 'outline'}
            className={activeTab === 'custom' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <Beaker className="h-4 w-4 mr-2" />
            Formulações ({customRequests.length})
          </Button>
          <Button 
            onClick={() => { setActiveTab('messages'); setContactRefreshKey((key) => key + 1); }}
            variant={activeTab === 'messages' ? 'default' : 'outline'}
            className={activeTab === 'messages' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <Mail className="h-4 w-4 mr-2" />
            Mensagens ({contactCount})
          </Button>
          <Button 
            onClick={() => setActiveTab('gallery')}
            variant={activeTab === 'gallery' ? 'default' : 'outline'}
            className={activeTab === 'gallery' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <Camera className="h-4 w-4 mr-2" />
            Galeria ({galleryPendingCount})
          </Button>
          <Button 
            onClick={() => setActiveTab('visual')}
            variant={activeTab === 'visual' ? 'default' : 'outline'}
            className={activeTab === 'visual' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <Eye className="h-4 w-4 mr-2" />
            Treinamento Visual ({visualKnowledge.length})
          </Button>
          <Button 
            onClick={() => setActiveTab('partners')}
            variant={activeTab === 'partners' ? 'default' : 'outline'}
            className={activeTab === 'partners' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <Handshake className="h-4 w-4 mr-2" />
            Parceiros
          </Button>
          <Button 
            onClick={() => { setActiveTab('params'); loadParamsData(); }}
            variant={activeTab === 'params' ? 'default' : 'outline'}
            className={activeTab === 'params' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <Beaker className="h-4 w-4 mr-2" />
            Gerenciar Parametros
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'metrics' && (
          <MetricsTab apiToken={ADMIN_API_TOKEN} buildAdminUrl={buildAdminUrl} refreshKey={metricsRefreshKey} />
        )}

        {activeTab === 'knowledge' && (
          <DocumentsTab isAdmin={isAdmin} refreshKey={knowledgeRefreshKey} />
        )}

        {activeTab === 'custom' && (
          <div className="space-y-4">
            {customRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Beaker className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Nenhum pedido de formulação customizada ainda
                </p>
              </Card>
            ) : (
              customRequests.map((request, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {request.phone}
                          </span>
                          <span className="truncate">{request.email}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(request.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">CARACTERÍSTICA</p>
                      <p className="text-sm">{request.caracteristica}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">COR</p>
                      <p className="text-sm">{request.cor}</p>
                    </div>
                    {request.complementos && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">COMPLEMENTOS</p>
                        <p className="text-sm whitespace-pre-wrap">{request.complementos}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => window.open(`https://wa.me/55${request.phone.replace(/\D/g, '')}?text=Olá ${request.name}, sobre sua solicitação de formulação customizada...`, '_blank')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contatar via WhatsApp
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        <ContactsTab
          buildAdminUrl={buildAdminUrl}
          isVisible={activeTab === 'messages'}
          onCountChange={setContactCount}
          refreshKey={contactRefreshKey}
        />

        <SuggestionsTab
          buildAdminUrl={buildAdminUrl}
          isAdmin={isAdmin}
          isVisible={activeTab === 'suggestions'}
          onCountChange={setSuggestionsCount}
          refreshKey={suggestionsRefreshKey}
        />

        <OrdersTab
          buildAdminUrl={buildAdminUrl}
          isAdmin={isAdmin}
          isVisible={activeTab === 'orders'}
          onCountChange={setOrdersPendingCount}
          refreshKey={ordersRefreshKey}
        />

        {activeTab === 'gallery' && (
          <GalleryTab
            isAdmin={isAdmin}
            isVisible={activeTab === 'gallery'}
            refreshKey={galleryRefreshKey}
            onPendingCountChange={setGalleryPendingCount}
          />
        )}

        {/* Visual RAG Tab - Treinamento Visual */}
        {activeTab === 'visual' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Treinamento Visual - Banco de Conhecimento Visual
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adicione fotos de problemas com diagnostico e solucao. Quando um cliente enviar uma foto similar, o bot usara sua resposta treinada.
              </p>

              {/* Secao de fotos pendentes - enviadas automaticamente pelo bot */}
              {pendingVisualLoading ? (
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-6">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-sm">Carregando fotos pendentes...</p>
                </div>
              ) : (
                pendingVisualPhotos.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-3">
                      <AlertCircle className="h-5 w-5" />
                      Fotos Pendentes para Treinamento ({pendingVisualPhotos.length})
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                      Estas fotos foram enviadas por clientes e o bot nao conseguiu identificar o problema. Adicione o conhecimento para treinar o bot.
                    </p>
                    <div className="space-y-4">
                      {pendingVisualPhotos.map((item) => (
                        <PendingVisualItemForm 
                          key={item._id} 
                          item={item} 
                          onApprove={approvePendingVisual}
                          onDelete={deletePendingVisual}
                          canDelete={isAdmin}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Form para adicionar novo conhecimento visual */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Adicionar Novo Exemplo Visual
                </h4>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Foto do Problema</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      setVisualImage(file)
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setVisualImagePreview(reader.result)
                        }
                        reader.readAsDataURL(file)
                      } else {
                        setVisualImagePreview(null)
                      }
                    }}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700"
                  />
                  {visualImagePreview && (
                    <div className="mt-3 relative">
                      <p className="text-sm text-green-600 mb-2">Preview da imagem:</p>
                      <img 
                        src={visualImagePreview} 
                        alt="Preview" 
                        className="max-w-xs max-h-48 object-contain rounded-lg border shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVisualImage(null)
                          setVisualImagePreview(null)
                        }}
                        className="absolute top-8 left-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Defeito</label>
                  <select
                    value={visualDefectType}
                    onChange={(e) => setVisualDefectType(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700"
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
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Diagnostico Tecnico</label>
                  <textarea
                    value={visualDiagnosis}
                    onChange={(e) => setVisualDiagnosis(e.target.value)}
                    placeholder="Descreva o diagnostico tecnico do problema..."
                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Solucao Recomendada</label>
                  <textarea
                    value={visualSolution}
                    onChange={(e) => setVisualSolution(e.target.value)}
                    placeholder="Descreva a solucao passo a passo..."
                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 min-h-[80px]"
                  />
                </div>

                <Button 
                  onClick={addVisualKnowledgeEntry}
                  disabled={addingVisual}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {addingVisual ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar ao Banco Visual
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Lista de conhecimentos visuais existentes */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Exemplos Visuais Cadastrados ({visualKnowledge.length})</h3>
              
              {visualLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : visualKnowledge.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-gray-500">Nenhum exemplo visual cadastrado ainda.</p>
                  <p className="text-sm text-gray-400 mt-2">Adicione fotos de problemas para treinar o bot.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {visualKnowledge.map((item) => (
                    <div key={item._id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {/* Imagem */}
                      <img
                        src={item.imageUrl}
                        alt={item.defectType}
                        className="w-32 h-32 object-cover rounded-lg border flex-shrink-0"
                      />
                      
                      {/* Detalhes */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold">
                            {item.defectType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold text-blue-600">Diagnostico:</span>
                            <p className="text-gray-700 dark:text-gray-300">{item.diagnosis}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-green-600">Solucao:</span>
                            <p className="text-gray-700 dark:text-gray-300">{item.solution}</p>
                          </div>
                        </div>
                        
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => deleteVisualKnowledgeEntry(item._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Deletar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <PartnersManager />
        )}

        {/* Params Tab - Gerenciar Parametros de Impressao */}
        {activeTab === 'params' && (
          <div className="space-y-6">
            {paramsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2">Carregando parametros...</span>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                {paramsStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total de Resinas</p>
                      <p className="text-2xl font-bold text-blue-600">{paramsStats.totalResins || 0}</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total de Impressoras</p>
                      <p className="text-2xl font-bold text-green-600">{paramsStats.totalPrinters || 0}</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Perfis Ativos</p>
                      <p className="text-2xl font-bold text-purple-600">{paramsStats.activeProfiles || 0}</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Perfis Em Breve</p>
                      <p className="text-2xl font-bold text-yellow-600">{paramsStats.comingSoonProfiles || 0}</p>
                    </Card>
                  </div>
                )}

                {/* Resinas Section */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Resinas</h3>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Nome da nova resina..."
                      value={newResinName}
                      onChange={(e) => setNewResinName(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button onClick={addResin} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {paramsResins.map((resin) => (
                      <div key={resin.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm truncate">{resin.name}</span>
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => deleteResin(resin.id)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Impressoras Section */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Impressoras</h3>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Marca..."
                      value={newPrinterBrand}
                      onChange={(e) => setNewPrinterBrand(e.target.value)}
                      className="max-w-[150px]"
                    />
                    <Input
                      placeholder="Modelo..."
                      value={newPrinterModel}
                      onChange={(e) => setNewPrinterModel(e.target.value)}
                      className="max-w-[200px]"
                    />
                    <Button onClick={addPrinter} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {paramsPrinters.map((printer) => (
                      <div key={printer.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm truncate">{printer.brand} {printer.model}</span>
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => deletePrinter(printer.id)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Perfis Section */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Perfis de Impressao ({paramsProfiles.length})</h3>
                  <div className="mb-4">
                    <Button 
                      onClick={() => {
                        setEditingProfile({})
                        setProfileFormData({ status: 'active' })
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Novo Perfil
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Resina</th>
                          <th className="text-left p-2">Impressora</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Camada</th>
                          <th className="text-left p-2">Exposicao</th>
                          <th className="text-left p-2">Acoes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paramsProfiles.slice(0, 50).map((profile) => (
                          <tr key={profile.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-2">{profile.resinName}</td>
                            <td className="p-2">{profile.brand} {profile.model}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {profile.status === 'active' ? 'Ativo' : 'Em Breve'}
                              </span>
                            </td>
                            <td className="p-2">{profile.params?.layerHeightMm || '-'}</td>
                            <td className="p-2">{profile.params?.exposureTimeS || '-'}</td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => openEditProfile(profile)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                {isAdmin && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => deleteProfile(profile.id)}
                                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {paramsProfiles.length > 50 && (
                      <p className="text-sm text-gray-500 mt-2">Mostrando 50 de {paramsProfiles.length} perfis</p>
                    )}
                  </div>
                </Card>

                {/* Modal de Edicao de Perfil */}
                {editingProfile && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                      <h3 className="text-xl font-bold mb-4">
                        {editingProfile.id ? 'Editar Perfil' : 'Novo Perfil'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Resina</label>
                          <select
                            value={profileFormData.resinId || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, resinId: e.target.value})}
                            className="w-full p-2 border rounded mt-1"
                          >
                            <option value="">Selecione...</option>
                            {paramsResins.map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Impressora</label>
                          <select
                            value={profileFormData.printerId || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, printerId: e.target.value})}
                            className="w-full p-2 border rounded mt-1"
                          >
                            <option value="">Selecione...</option>
                            {paramsPrinters.map((p) => (
                              <option key={p.id} value={p.id}>{p.brand} {p.model}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <select
                            value={profileFormData.status || 'active'}
                            onChange={(e) => setProfileFormData({...profileFormData, status: e.target.value})}
                            className="w-full p-2 border rounded mt-1"
                          >
                            <option value="active">Ativo</option>
                            <option value="coming_soon">Em Breve</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Altura de Camada (mm)</label>
                          <Input
                            value={profileFormData.layerHeightMm || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, layerHeightMm: e.target.value})}
                            placeholder="0.05"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Tempo de Exposicao (s)</label>
                          <Input
                            value={profileFormData.exposureTimeS || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, exposureTimeS: e.target.value})}
                            placeholder="2.5"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Exposicao Base (s)</label>
                          <Input
                            value={profileFormData.baseExposureTimeS || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, baseExposureTimeS: e.target.value})}
                            placeholder="30"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Camadas de Base</label>
                          <Input
                            value={profileFormData.baseLayers || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, baseLayers: e.target.value})}
                            placeholder="5"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Retardo UV (s)</label>
                          <Input
                            value={profileFormData.uvOffDelayS || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, uvOffDelayS: e.target.value})}
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descanso Antes Elevacao (s)</label>
                          <Input
                            value={profileFormData.restBeforeLiftS || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, restBeforeLiftS: e.target.value})}
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descanso Apos Elevacao (s)</label>
                          <Input
                            value={profileFormData.restAfterLiftS || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, restAfterLiftS: e.target.value})}
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descanso Apos Retracao (s)</label>
                          <Input
                            value={profileFormData.restAfterRetractS || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, restAfterRetractS: e.target.value})}
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Potencia UV</label>
                          <Input
                            value={profileFormData.uvPower || ''}
                            onChange={(e) => setProfileFormData({...profileFormData, uvPower: e.target.value})}
                            placeholder="100%"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingProfile(null)
                            setProfileFormData({})
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={saveProfile} className="bg-blue-600 hover:bg-blue-700">
                          Salvar Perfil
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
