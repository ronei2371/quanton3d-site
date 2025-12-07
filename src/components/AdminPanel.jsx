import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { X, Check, Clock, User, Phone, Calendar, MessageSquare, Users, TrendingUp, BarChart3, BookOpen, Plus, FileText, Beaker, Edit3, Mail, Camera, Image, Loader2, Eye, Trash2, Upload, AlertCircle } from 'lucide-react'

// URL base do Backend
const API_BASE = 'https://quanton3d-bot-v2.onrender.com';

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
            <option value="problema de LCD">Problema de LCD / Tela</option>
            <option value="descolamento da base">Descolamento da base</option>
            <option value="falha de suportes">Falha de suportes</option>
            <option value="rachadura/quebra da peca">Rachadura/quebra da peca</option>
            <option value="falha de adesao entre camadas / delaminacao">Delaminacao</option>
            <option value="deformacao/warping">Deformacao/warping</option>
            <option value="problema de superficie/acabamento">Problema de superficie</option>
            <option value="excesso ou falta de cura">Excesso ou falta de cura</option>
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
  const [metrics, setMetrics] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Knowledge States
  const [knowledgeTitle, setKnowledgeTitle] = useState('')
  const [knowledgeContent, setKnowledgeContent] = useState('')
  const [addingKnowledge, setAddingKnowledge] = useState(false)
  const [knowledgeDocuments, setKnowledgeDocuments] = useState([])
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [knowledgeDateStart, setKnowledgeDateStart] = useState('')
  const [knowledgeDateEnd, setKnowledgeDateEnd] = useState('')
  const [editingKnowledge, setEditingKnowledge] = useState(null)
  const [editKnowledgeTitle, setEditKnowledgeTitle] = useState('')
  const [editKnowledgeContent, setEditKnowledgeContent] = useState('')
  
  // Other States
  const [customRequests, setCustomRequests] = useState([])
  const [editingSuggestion, setEditingSuggestion] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [contactMessages, setContactMessages] = useState([])
  const [galleryEntries, setGalleryEntries] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  
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
  
  // Details Modals
  const [selectedResin, setSelectedResin] = useState(null)
  const [resinDetails, setResinDetails] = useState(null)
  const [resinDetailsLoading, setResinDetailsLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientHistory, setClientHistory] = useState(null)
  const [clientHistoryLoading, setClientHistoryLoading] = useState(false)
  
  // Gallery Edit
  const [editingGalleryEntry, setEditingGalleryEntry] = useState(null)
  const [editGalleryData, setEditGalleryData] = useState({})
  const [savingGalleryEdit, setSavingGalleryEdit] = useState(false)

  const ADMIN_PASSWORD = 'quanton3d2024'
  const TEAM_SECRET = 'suporte_quanton_2025'
  
  const isAdmin = accessLevel === 'admin'

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAccessLevel('admin')
      setIsAuthenticated(true)
    } else if (password === TEAM_SECRET) {
      setAccessLevel('support')
      setIsAuthenticated(true)
    } else {
      alert('Senha incorreta!')
      return
    }
    loadAllData()
  }

  const loadAllData = () => {
    loadMetrics()
    loadSuggestions()
    loadCustomRequests()
    loadContactMessages()
    loadGalleryEntries()
    loadVisualKnowledge()
    loadPendingVisualPhotos()
    loadKnowledgeDocuments()
  }

  // --- CARREGAMENTO DE DADOS (RESTORED ORIGINAL PATHS) ---
  const loadMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/metrics?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      // CORRECAO: Rota original restaurada (/suggestions)
      const response = await fetch(`${API_BASE}/suggestions?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
    }
  }

  const loadCustomRequests = async () => {
    try {
      // CORRECAO: Rota original restaurada
      const response = await fetch(`${API_BASE}/custom-requests?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setCustomRequests(data.requests || [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    }
  }

  const loadContactMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/contact?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setContactMessages(data.messages || [])
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const toggleMessageResolved = async (messageId, currentResolved) => {
    try {
      const response = await fetch(`${API_BASE}/api/contact/${messageId}?auth=quanton3d_admin_secret`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: !currentResolved })
      })
      const data = await response.json()
      if (data.success) {
        loadContactMessages()
      } else {
        alert('Erro ao atualizar status: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error)
      alert('Erro ao atualizar status da mensagem')
    }
  }

  const loadKnowledgeDocuments = async () => {
    setKnowledgeLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/knowledge?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setKnowledgeDocuments(data.documents || [])
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    } finally {
      setKnowledgeLoading(false)
    }
  }

  // --- CRUD Conhecimento Texto ---
  const deleteKnowledgeDocument = async (id) => {
    if (!isAdmin) return alert('Acesso negado.')
    if (!confirm('Tem certeza? Isso apagará o conhecimento da memória do bot.')) return
    try {
      const response = await fetch(`${API_BASE}/api/knowledge/${id}?auth=quanton3d_admin_secret`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        alert('Conhecimento removido!')
        loadKnowledgeDocuments()
      }
    } catch (error) {
      alert('Erro ao deletar: ' + error.message)
    }
  }

  const openEditKnowledge = (doc) => {
    setEditingKnowledge(doc)
    setEditKnowledgeTitle(doc.title || '')
    setEditKnowledgeContent(doc.content || '')
  }

  const saveEditKnowledge = async () => {
    if (!editingKnowledge) return
    try {
      const response = await fetch(`${API_BASE}/api/knowledge/${editingKnowledge._id}?auth=quanton3d_admin_secret`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editKnowledgeTitle, content: editKnowledgeContent })
      })
      const data = await response.json()
      if (data.success) {
        alert('Atualizado com sucesso!')
        setEditingKnowledge(null)
        loadKnowledgeDocuments()
      }
    } catch (error) {
      alert('Erro ao atualizar: ' + error.message)
    }
  }

  const getFilteredKnowledgeDocuments = () => {
    if (!knowledgeDateStart && !knowledgeDateEnd) return knowledgeDocuments
    return knowledgeDocuments.filter(doc => {
      if (!doc.createdAt) return true
      const docDate = new Date(doc.createdAt)
      if (knowledgeDateStart && docDate < new Date(knowledgeDateStart)) return false
      if (knowledgeDateEnd && docDate > new Date(knowledgeDateEnd + 'T23:59:59')) return false
      return true
    })
  }

  // --- Visual RAG ---
  const loadVisualKnowledge = async () => {
    setVisualLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/visual-knowledge?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setVisualKnowledge(data.documents || [])
    } catch (error) { console.error(error) } finally { setVisualLoading(false) }
  }

  const loadPendingVisualPhotos = async () => {
    setPendingVisualLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/visual-knowledge/pending?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setPendingVisualPhotos(data.documents || [])
    } catch (error) { console.error(error) } finally { setPendingVisualLoading(false) }
  }

  const approvePendingVisual = async (id, defectType, diagnosis, solution) => {
    if (!defectType || !diagnosis || !solution) {
      alert('Preencha todos os campos antes de aprovar')
      return false
    }
    try {
      const response = await fetch(`${API_BASE}/api/visual-knowledge/${id}/approve?auth=quanton3d_admin_secret`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defectType, diagnosis, solution })
      })
      const data = await response.json()
      if (data.success) {
        alert('Conhecimento visual aprovado com sucesso!')
        loadPendingVisualPhotos()
        loadVisualKnowledge()
        return true
      } else {
        alert('Erro: ' + data.error)
        return false
      }
    } catch (error) {
      console.error('Erro ao aprovar conhecimento visual:', error)
      alert('Erro ao aprovar conhecimento visual')
      return false
    }
  }

  const deletePendingVisual = async (id) => {
    if (!isAdmin) {
      alert('Seu nivel de acesso nao permite excluir dados.')
      return
    }
    if (!confirm('Tem certeza que deseja deletar esta foto pendente?')) return
    try {
      const response = await fetch(`${API_BASE}/api/visual-knowledge/${id}?auth=quanton3d_admin_secret`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        loadPendingVisualPhotos()
      } else {
        alert('Erro: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao deletar foto pendente:', error)
      alert('Erro ao deletar foto pendente')
    }
  }

  const addVisualKnowledgeEntry = async () => {
    if (!visualImage || !visualDefectType || !visualDiagnosis || !visualSolution) {
      alert('Preencha todos os campos e a foto!')
      return
    }
    setAddingVisual(true)
    try {
      const formData = new FormData()
      formData.append('image', visualImage)
      formData.append('defectType', visualDefectType)
      formData.append('diagnosis', visualDiagnosis)
      formData.append('solution', visualSolution)

      const response = await fetch(`${API_BASE}/api/visual-knowledge?auth=quanton3d_admin_secret`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        alert('Foto adicionada ao cérebro visual do Bot!')
        setVisualImage(null); setVisualImagePreview(null); setVisualDefectType(''); setVisualDiagnosis(''); setVisualSolution('');
        loadVisualKnowledge()
      } else {
        alert('Erro: ' + data.error)
      }
    } catch (error) {
      alert('Erro: ' + error.message)
    } finally {
      setAddingVisual(false)
    }
  }

  const deleteVisualKnowledgeEntry= async (id) => {
    if (!isAdmin) {
      alert('Seu nivel de acesso nao permite excluir dados.')
      return
    }
    if (!confirm('Tem certeza que deseja deletar este conhecimento visual?')) return
    
    try {
      const response = await fetch(`${API_BASE}/api/visual-knowledge/${id}?auth=quanton3d_admin_secret`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        loadVisualKnowledge()
      } else {
        alert('Erro: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao deletar conhecimento visual:', error)
      alert('Erro ao deletar conhecimento visual')
    }
  }

  // --- Galeria ---
  const loadGalleryEntries = async () => {
    setGalleryLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/gallery/all?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setGalleryEntries(data.entries || [])
    } catch (error) { console.error(error) } finally { setGalleryLoading(false) }
  }

  const approveGalleryEntry = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/gallery/${id}/approve?auth=quanton3d_admin_secret`, {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.success) {
        loadGalleryEntries()
      } else {
        alert('Erro ao aprovar: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      alert('Erro ao aprovar foto')
    }
  }

  const rejectGalleryEntry = async (id) => {
    if (!isAdmin) {
      alert('Seu nivel de acesso nao permite rejeitar/excluir dados.')
      return
    }
    if (!confirm('Tem certeza que deseja rejeitar esta foto? As imagens serao deletadas.')) return
    try {
      const response = await fetch(`${API_BASE}/api/gallery/${id}/reject?auth=quanton3d_admin_secret`, {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.success) {
        loadGalleryEntries()
      } else {
        alert('Erro ao rejeitar: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
      alert('Erro ao rejeitar foto')
    }
  }

  // --- Detalhes Resina e Cliente (RESTORED ORIGINAL LOGIC) ---
  const loadResinDetails = async (resin) => {
    setSelectedResin(resin)
    setResinDetailsLoading(true)
    setResinDetails(null)
    try {
      // Usando a rota original que funcionava
      const response = await fetch(`${API_BASE}/metrics/resin-details?resin=${encodeURIComponent(resin)}&auth=quanton3d_admin_secret`)
      const data = await response.json()
      if (data.success) {
        setResinDetails(data)
      } else {
        alert('Erro ao carregar detalhes: ' + data.error)
        setSelectedResin(null)
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da resina:', error)
      alert('Erro ao carregar detalhes da resina')
      setSelectedResin(null)
    } finally {
      setResinDetailsLoading(false)
    }
  }

  const loadClientHistory = async (clientKey) => {
    setSelectedClient(clientKey)
    setClientHistoryLoading(true)
    setClientHistory(null)
    try {
      // Usando a rota original que funcionava
      const response = await fetch(`${API_BASE}/metrics/client-history?clientKey=${encodeURIComponent(clientKey)}&auth=quanton3d_admin_secret`)
      const data = await response.json()
      if (data.success) {
        setClientHistory(data)
      } else {
        alert('Erro ao carregar historico: ' + data.error)
        setSelectedClient(null)
      }
    } catch (error) {
      console.error('Erro ao carregar historico do cliente:', error)
      alert('Erro ao carregar historico do cliente')
      setSelectedClient(null)
    } finally {
      setClientHistoryLoading(false)
    }
  }

  // Funcao para abrir modal de edicao da galeria
  const openEditGallery = (entry) => {
    setEditingGalleryEntry(entry)
    setEditGalleryData({
      name: entry.name || '',
      resin: entry.resin || '',
      printer: entry.printer || '',
      comment: entry.comment || '',
      layerHeight: entry.layerHeight || '',
      baseLayers: entry.baseLayers || '',
      exposureTime: entry.exposureTime || '',
      baseExposureTime: entry.baseExposureTime || '',
      transitionLayers: entry.transitionLayers || '',
      uvOffDelay: entry.uvOffDelay || '',
      lowerLiftDistance1: entry.lowerLiftDistance1 || '',
      lowerLiftDistance2: entry.lowerLiftDistance2 || '',
      liftDistance1: entry.liftDistance1 || '',
      liftDistance2: entry.liftDistance2 || '',
      lowerRetractDistance1: entry.lowerRetractDistance1 || '',
      lowerRetractDistance2: entry.lowerRetractDistance2 || '',
      retractDistance1: entry.retractDistance1 || '',
      retractDistance2: entry.retractDistance2 || '',
      lowerLiftSpeed1: entry.lowerLiftSpeed1 || '',
      lowerLiftSpeed2: entry.lowerLiftSpeed2 || '',
      liftSpeed1: entry.liftSpeed1 || '',
      liftSpeed2: entry.liftSpeed2 || '',
      lowerRetractSpeed1: entry.lowerRetractSpeed1 || '',
      lowerRetractSpeed2: entry.lowerRetractSpeed2 || '',
      retractSpeed1: entry.retractSpeed1 || '',
      retractSpeed2: entry.retractSpeed2 || ''
    })
  }

  const saveGalleryEdit = async () => {
    if (!editingGalleryEntry) return
    setSavingGalleryEdit(true)
    try {
      const response = await fetch(`${API_BASE}/api/gallery/${editingGalleryEntry._id}?auth=quanton3d_admin_secret`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editGalleryData)
      })
      const data = await response.json()
      if (data.success) {
        setEditingGalleryEntry(null)
        setEditGalleryData({})
        loadGalleryEntries()
        alert('Entrada atualizada com sucesso!')
      } else {
        alert('Erro ao atualizar: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      alert('Erro ao atualizar entrada da galeria')
    } finally {
      setSavingGalleryEdit(false)
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 font-sans text-gray-900 dark:text-gray-100">
      <div className="container mx-auto max-w-7xl py-8">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Centro de Comando Quanton3D
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Logado como: <span className="font-semibold text-blue-500">{isAdmin ? 'Administrador' : 'Suporte'}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAllData} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar Dados'}
            </Button>
            {onClose && <Button variant="ghost" onClick={onClose}><X className="h-5 w-5"/></Button>}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border dark:border-gray-700">
          {[
            { id: 'metrics', label: 'Métricas', icon: BarChart3 },
            { id: 'suggestions', label: `Sugestões (${suggestions.length})`, icon: MessageSquare },
            { id: 'knowledge', label: 'Gestão de Texto', icon: BookOpen },
            { id: 'visual', label: 'Treinamento Visual', icon: Eye },
            { id: 'gallery', label: 'Galeria', icon: Camera },
            { id: 'messages', label: 'Leads', icon: Mail },
            { id: 'custom', label: 'Formulações', icon: Beaker },
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* === ABA MÉTRICAS (RESTAURADA DO ORIGINAL) === */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Conversas</p>
                    <p className="text-3xl font-bold text-blue-600">{metrics.conversations.total}</p>
                    <p className="text-xs text-gray-500 mt-1">{metrics.conversations.uniqueSessions} sessões únicas</p>
                  </div>
                  <MessageSquare className="h-12 w-12 text-blue-500 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cadastros Realizados</p>
                    <p className="text-3xl font-bold text-green-600">{metrics.registrations.total}</p>
                    <p className="text-xs text-gray-500 mt-1">Clientes registrados</p>
                  </div>
                  <Users className="h-12 w-12 text-green-500 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {metrics.conversations.total > 0 
                        ? ((metrics.registrations.total / metrics.conversations.uniqueSessions) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Cadastros / Sessões</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-purple-500 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Perguntas Mais Frequentes */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">📊 Perguntas Mais Frequentes</h3>
              {metrics.topQuestions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma pergunta registrada ainda</p>
              ) : (
                <div className="space-y-2">
                  {metrics.topQuestions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <span className="font-semibold text-blue-600 mr-2">#{index + 1}</span>
                        <span className="text-sm">{item.question}</span>
                      </div>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                        {item.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Conversas por Resina - AGORA CLICÁVEIS DE NOVO */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🧪 Menções de Resinas nas Conversas</h3>
              <p className="text-sm text-gray-500 mb-4">Clique em uma resina para ver detalhes dos clientes</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(metrics.resinMentions)
                  .filter(([name]) => !['Outros', 'Outra', 'Outras'].includes(name))
                  .map(([resin, count]) => (
                  <div 
                    key={resin} 
                    onClick={() => loadResinDetails(resin)}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all border-2 border-transparent hover:border-purple-400"
                  >
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{resin}</p>
                    <p className="text-2xl font-bold text-purple-600">{count}</p>
                    <p className="text-xs text-gray-400 mt-1">Clique para detalhes</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Clientes com Duvidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">👤 Top Clientes com Dúvidas</h3>
                {!metrics.topClients || metrics.topClients.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum cliente registrado ainda</p>
                ) : (
                  <div className="space-y-2">
                    {metrics.topClients.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-700' :
                            index === 2 ? 'bg-orange-400 text-orange-900' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-sm truncate max-w-[120px]">{item.client}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-semibold">
                            {item.count}x
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => loadClientHistory(item.client)}
                            className="text-xs px-2 py-1 h-7"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Histórico
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Topicos Mais Acessados */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">🔥 Tópicos Mais Acessados</h3>
                {!metrics.topTopics || metrics.topTopics.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum tópico registrado ainda</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {metrics.topTopics.map((item, index) => (
                      <span 
                        key={index} 
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          index < 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                          index < 6 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' :
                          index < 10 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                        title={`${item.count} menções`}
                      >
                        {item.topic} ({item.count})
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Clientes Cadastrados - RESTAURADO VISUALIZAÇÃO ORIGINAL */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">👥 Clientes Cadastrados ({metrics.registrations.total})</h3>
              {metrics.registrations.users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum cadastro realizado ainda</p>
              ) : (
                <div className="space-y-3">
                  {metrics.registrations.users.map((user, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{user.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(user.registeredAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Conversas Recentes */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">💬 Últimas Conversas</h3>
              {metrics.conversations.recent.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma conversa registrada ainda</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {metrics.conversations.recent.slice(0, 20).map((conv, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{conv.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(conv.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                          <p className="text-sm"><strong>Pergunta:</strong> {conv.message}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                          <p className="text-sm whitespace-pre-wrap"><strong>Resposta:</strong> {conv.reply}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* === ABA SUGESTÕES (RESTAURADA E FUNCIONAL) === */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Nenhuma sugestão pendente no momento
                </p>
              </Card>
            ) : (
              suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{suggestion.userName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {suggestion.userPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(suggestion.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      suggestion.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : suggestion.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {suggestion.status === 'pending' ? 'Pendente' : suggestion.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </span>
                  </div>

                  {/* Pergunta Original do Cliente */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-3">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">PERGUNTA DO CLIENTE</p>
                    <p className="text-sm whitespace-pre-wrap">{suggestion.lastUserMessage || 'Pergunta não disponível'}</p>
                  </div>

                  {/* Resposta Original do Bot */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3">
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">RESPOSTA DO BOT</p>
                    <p className="text-sm whitespace-pre-wrap">{suggestion.lastBotReply || 'Resposta não disponível'}</p>
                  </div>

                  {/* Sugestão do Cliente */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">SUGESTÃO DO CLIENTE</p>
                    <p className="text-sm whitespace-pre-wrap">{suggestion.suggestion}</p>
                  </div>

                  {suggestion.status === 'pending' && (
                    <>
                      {editingSuggestion === suggestion.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1 block">RESPOSTA CORRIGIDA (será salva no RAG)</label>
                            <textarea
                              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 min-h-[120px]"
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              placeholder="Escreva a resposta técnica correta que o bot deveria ter dado..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`${API_BASE}/approve-suggestion/${suggestion.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      auth: 'quanton3d_admin_secret',
                                      editedAnswer: editedText
                                    })
                                  })
                                  const data = await response.json()
                                  if (data.success) {
                                    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
                                    setEditingSuggestion(null)
                                    setEditedText('')
                                  } else {
                                    alert('Erro: ' + data.message)
                                  }
                                } catch (error) {
                                  alert('Erro ao aprovar: ' + error.message)
                                }
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Aprovar com Correção
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setEditingSuggestion(null)
                                setEditedText('')
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={async () => {
                              try {
                                const response = await fetch(`${API_BASE}/approve-suggestion/${suggestion.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ auth: 'quanton3d_admin_secret' })
                                })
                                const data = await response.json()
                                if (data.success) {
                                  setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
                                } else {
                                  alert('Erro: ' + data.message)
                                }
                              } catch (error) {
                                alert('Erro ao aprovar: ' + error.message)
                              }
                            }}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              setEditingSuggestion(suggestion.id)
                              setEditedText(suggestion.lastBotReply || '')
                            }}
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Editar Resposta
                          </Button>
                          {isAdmin && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`${API_BASE}/reject-suggestion/${suggestion.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ auth: 'quanton3d_admin_secret' })
                                  })
                                  const data = await response.json()
                                  if (data.success) {
                                    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
                                  } else {
                                    alert('Erro: ' + data.message)
                                  }
                                } catch (error) {
                                  alert('Erro ao rejeitar: ' + error.message)
                                }
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rejeitar
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* === ABA CONHECIMENTO (TEXTO) === */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6 animate-in fade-in">
             <Card className="p-6 border-none shadow-md bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500">
              <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">🧠 Cérebro de Texto (RAG)</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Use esta aba para adicionar manuais, textos explicativos e parâmetros. <br/>
                <strong>ATENÇÃO:</strong> Para fotos de defeitos (LCD, Peças), use a aba <strong>"Treinamento Visual"</strong>.
              </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Formulario */}
              <Card className="p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Adicionar Novo Texto
                </h4>
                <div className="space-y-4">
                  <Input 
                    placeholder="Título (ex: Parâmetros Athon Dental)" 
                    value={knowledgeTitle}
                    onChange={e => setKnowledgeTitle(e.target.value)}
                  />
                  <textarea 
                    className="w-full min-h-[200px] p-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                    placeholder="Cole o texto técnico aqui..."
                    value={knowledgeContent}
                    onChange={e => setKnowledgeContent(e.target.value)}
                  />
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={addingKnowledge}
                    onClick={async () => {
                      if(!knowledgeTitle || !knowledgeContent) return alert('Preencha tudo!')
                      setAddingKnowledge(true)
                      try {
                        const res = await fetch(`${API_BASE}/add-knowledge`, {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({auth: 'quanton3d_admin_secret', title: knowledgeTitle, content: knowledgeContent})
                        })
                        const d = await res.json()
                        if(d.success) { alert('Salvo!'); setKnowledgeTitle(''); setKnowledgeContent(''); loadKnowledgeDocuments() }
                      } catch(e) { alert('Erro: ' + e.message) } finally { setAddingKnowledge(false) }
                    }}
                  >
                    {addingKnowledge ? 'Salvando...' : 'Salvar no Cérebro'}
                  </Button>
                </div>
              </Card>

              {/* Lista */}
              <Card className="p-6 flex flex-col h-[600px]">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Documentos Existentes ({getFilteredKnowledgeDocuments().length})</h4>
                  <Button variant="ghost" size="sm" onClick={loadKnowledgeDocuments}><TrendingUp className="h-4 w-4"/></Button>
                </div>
                
                {/* Filtro de Data */}
                <div className="flex gap-2 mb-4 bg-gray-50 p-2 rounded-lg">
                  <Input type="date" className="text-xs" value={knowledgeDateStart} onChange={e => setKnowledgeDateStart(e.target.value)} />
                  <Input type="date" className="text-xs" value={knowledgeDateEnd} onChange={e => setKnowledgeDateEnd(e.target.value)} />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {getFilteredKnowledgeDocuments().map(doc => (
                    <div key={doc._id} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{doc.title}</p>
                          <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                            setEditingKnowledge(doc); setEditKnowledgeTitle(doc.title); setEditKnowledgeContent(doc.content)
                          }}><Edit3 className="h-3 w-3 text-blue-500"/></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteKnowledgeDocument(doc._id)}><Trash2 className="h-3 w-3 text-red-500"/></Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.content}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* === ABA VISUAL (FOTOS) === */}
        {activeTab === 'visual' && (
          <div className="space-y-6 animate-in fade-in">
             <Card className="p-6 border-none shadow-md bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-500">
              <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200 mb-2">👁️ Cérebro Visual (Fotos)</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Aqui você ensina o bot a enxergar. Faça upload de fotos de <strong>LCD com defeito, Falhas de Impressão e Peças Quebradas</strong>.
                O bot usará esses exemplos para diagnosticar fotos dos clientes.
              </p>
            </Card>

            {/* Pendentes */}
            {pendingVisualPhotos.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                 <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                   <AlertCircle className="h-5 w-5"/> Fotos Pendentes de Aprovação ({pendingVisualPhotos.length})
                 </h4>
                 <div className="space-y-4">
                    {pendingVisualPhotos.map(item => (
                      <PendingVisualItemForm 
                        key={item._id} 
                        item={item} 
                        canDelete={isAdmin}
                        onDelete={async (id) => {
                          if(confirm('Apagar?')) {
                             await fetch(`${API_BASE}/api/visual-knowledge/${id}?auth=quanton3d_admin_secret`, { method: 'DELETE' })
                             loadPendingVisualPhotos()
                          }
                        }}
                        onApprove={async (id, type, diag, sol) => {
                          const res = await fetch(`${API_BASE}/api/visual-knowledge/${id}/approve?auth=quanton3d_admin_secret`, {
                             method: 'PUT',
                             headers: {'Content-Type': 'application/json'},
                             body: JSON.stringify({defectType: type, diagnosis: diag, solution: sol})
                          })
                          const d = await res.json()
                          if(d.success) { alert('Aprovado!'); loadPendingVisualPhotos(); loadVisualKnowledge(); return true }
                          else { alert('Erro: ' + d.error); return false }
                        }}
                      />
                    ))}
                 </div>
              </div>
            )}

            {/* Upload Novo */}
            <Card className="p-6">
              <h4 className="font-bold mb-4">Adicionar Novo Exemplo Visual</h4>
              <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <div className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${visualImage ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}>
                       <input type="file" className="hidden" id="visual-upload" accept="image/*" onChange={e => {
                         const file = e.target.files[0]
                         if(file) {
                           setVisualImage(file)
                           const reader = new FileReader()
                           reader.onload = () => setVisualImagePreview(reader.result)
                           reader.readAsDataURL(file)
                         }
                       }}/>
                       <label htmlFor="visual-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                          {visualImagePreview ? (
                            <img src={visualImagePreview} className="h-full w-full object-contain rounded-lg" />
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-gray-400 mb-2"/>
                              <p className="text-sm text-gray-500">Clique para selecionar foto</p>
                            </>
                          )}
                       </label>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <select className="w-full p-2 border rounded-lg" value={visualDefectType} onChange={e => setVisualDefectType(e.target.value)}>
                        <option value="">Selecione o Defeito...</option>
                        <option value="problema de LCD">Problema de LCD / Tela</option>
                        <option value="descolamento da base">Descolamento</option>
                        <option value="falha de suportes">Falha de Suportes</option>
                        <option value="delaminacao">Delaminação</option>
                        <option value="outro">Outro</option>
                    </select>
                    <textarea 
                      className="w-full p-2 border rounded-lg h-24" 
                      placeholder="Diagnóstico Técnico (ex: LCD com vazamento de cristal...)"
                      value={visualDiagnosis}
                      onChange={e => setVisualDiagnosis(e.target.value)}
                    />
                    <textarea 
                      className="w-full p-2 border rounded-lg h-24" 
                      placeholder="Solução (ex: Substituir tela, verificar cabos...)"
                      value={visualSolution}
                      onChange={e => setVisualSolution(e.target.value)}
                    />
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={addVisualKnowledgeEntry} disabled={addingVisual}>
                       {addingVisual ? 'Processando IA...' : 'Adicionar ao Banco Visual'}
                    </Button>
                 </div>
              </div>
            </Card>

            {/* Galeria Existente */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {visualKnowledge.map(item => (
                 <div key={item._id} className="relative group rounded-xl overflow-hidden shadow-sm border aspect-square">
                    <img src={item.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center text-white">
                       <p className="font-bold text-sm mb-1">{item.defectType}</p>
                       <p className="text-xs line-clamp-2 mb-2">{item.diagnosis}</p>
                       {isAdmin && (
                         <Button size="sm" variant="destructive" onClick={async () => {
                           if(confirm('Deletar?')) {
                              await fetch(`${API_BASE}/api/visual-knowledge/${item._id}?auth=quanton3d_admin_secret`, {method: 'DELETE'})
                              loadVisualKnowledge()
                           }
                         }}>Excluir</Button>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
        
        {/* Modals Extras (Edição, Detalhes) */}
        {editingKnowledge && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <Card className="w-full max-w-lg p-6">
                <h3 className="text-lg font-bold mb-4">Editar Texto</h3>
                <Input className="mb-4" value={editKnowledgeTitle} onChange={e => setEditKnowledgeTitle(e.target.value)} />
                <textarea className="w-full border rounded-lg p-2 h-40 mb-4" value={editKnowledgeContent} onChange={e => setEditKnowledgeContent(e.target.value)} />
                <div className="flex justify-end gap-2">
                   <Button variant="outline" onClick={() => setEditingKnowledge(null)}>Cancelar</Button>
                   <Button onClick={saveEditKnowledge}>Salvar</Button>
                </div>
             </Card>
          </div>
        )}

        {/* Modal de Detalhes da Resina - CORRECAO 3 */}
        {selectedResin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">🧪 Detalhes da Resina: {selectedResin}</h3>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedResin(null); setResinDetails(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {resinDetailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  <span className="ml-2">Carregando detalhes...</span>
                </div>
              ) : resinDetails ? (
                <div className="space-y-6">
                  {/* Clientes que usam essa resina */}
                  <div>
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Clientes que usam {selectedResin} ({resinDetails.customersCount})
                    </h4>
                    {resinDetails.customers.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nenhum cliente cadastrado com essa resina</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {resinDetails.customers.map((customer, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.email || customer.phone || 'Sem contato'}</p>
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <p>{customer.printer || 'Impressora nao informada'}</p>
                              {customer.registeredAt && <p>{new Date(customer.registeredAt).toLocaleDateString('pt-BR')}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Conversas relacionadas */}
                  <div>
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      Conversas Relacionadas ({resinDetails.conversationsCount})
                    </h4>
                    {resinDetails.conversations.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nenhuma conversa encontrada</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {resinDetails.conversations.map((conv, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{conv.customerName}</span>
                              <span className="text-xs text-gray-500">{new Date(conv.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-sm">
                                <strong>Duvida:</strong> {conv.userPrompt}
                              </div>
                              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-sm">
                                <strong>Resposta:</strong> {conv.botReply?.substring(0, 200)}{conv.botReply?.length > 200 ? '...' : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Erro ao carregar detalhes</p>
              )}
            </Card>
          </div>
        )}

        {/* Modal de Historico do Cliente - CORRECAO 4 */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">👤 Histórico do Cliente</h3>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedClient(null); setClientHistory(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {clientHistoryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2">Carregando historico...</span>
                </div>
              ) : clientHistory ? (
                <div className="space-y-6">
                  {/* Info do Cliente */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{clientHistory.client.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {clientHistory.client.email && <span>{clientHistory.client.email}</span>}
                          {clientHistory.client.phone && <span>{clientHistory.client.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Total de interacoes: {clientHistory.totalInteractions}</p>
                  </div>

                  {/* Registros do Cliente */}
                  {clientHistory.registrations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Resinas Utilizadas</h4>
                      <div className="flex flex-wrap gap-2">
                        {clientHistory.registrations.map((reg, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                            {reg.resin} - {reg.printer}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conversas do Cliente */}
                  <div>
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      Historico de Conversas ({clientHistory.conversations.length})
                    </h4>
                    {clientHistory.conversations.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nenhuma conversa encontrada</p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {clientHistory.conversations.map((conv, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500">{new Date(conv.timestamp).toLocaleString('pt-BR')}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                conv.documentsFound > 0 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {conv.documentsFound > 0 ? 'Resolvido pelo RAG' : 'Sem match RAG'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">DUVIDA PRINCIPAL</p>
                                <p className="text-sm">{conv.prompt}</p>
                              </div>
                              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded">
                                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">RESPOSTA DO BOT</p>
                                <p className="text-sm whitespace-pre-wrap">{conv.reply}</p>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className={`px-2 py-1 rounded ${
                                  conv.documentsFound > 0 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-300 text-gray-700'
                                }`}>
                                  Status: {conv.documentsFound > 0 ? 'Resolvido' : 'Nao resolvido'}
                                </span>
                                {conv.questionType && (
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                                    Tipo: {conv.questionType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Erro ao carregar historico</p>
              )}
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}
