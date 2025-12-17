import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { X, Check, Clock, User, Phone, Calendar, MessageSquare, Users, TrendingUp, BarChart3, BookOpen, Plus, FileText, Beaker, Edit3, Mail, Camera, Image, Loader2, Eye, Trash2, Upload, AlertCircle, Handshake } from 'lucide-react'
import { PartnersManager } from './PartnersManager.jsx'

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
    const [activeTab, setActiveTab] = useState('metrics') // 'metrics' | 'suggestions' | 'knowledge' | 'custom' | 'messages' | 'gallery' | 'visual' | 'partners'
    const [metrics, setMetrics] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
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
    // Estados para modal de detalhes de resina (CORRECAO 3)
    const [selectedResin, setSelectedResin] = useState(null)
    const [resinDetails, setResinDetails] = useState(null)
    const [resinDetailsLoading, setResinDetailsLoading] = useState(false)
    // Estados para modal de historico do cliente (CORRECAO 4)
    const [selectedClient, setSelectedClient] = useState(null)
    const [clientHistory, setClientHistory] = useState(null)
    const [clientHistoryLoading, setClientHistoryLoading] = useState(false)
    // Estados para modal de edicao da galeria
    const [editingGalleryEntry, setEditingGalleryEntry] = useState(null)
    const [editGalleryData, setEditGalleryData] = useState({})
    const [savingGalleryEdit, setSavingGalleryEdit] = useState(false)
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

  // Senhas de acesso- Admin tem acesso total, Equipe tem acesso limitado (sem excluir)
  const ADMIN_PASSWORD = 'Rmartins1201'
  const TEAM_SECRET = 'suporte_quanton_2025'
  
  // Helpers para verificar nivel de acesso
  const isAdmin = accessLevel === 'admin'
  const isSupport = accessLevel === 'support'

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
      // Carregar dados para ambos os niveis
      loadMetrics()
      loadSuggestions()
      loadCustomRequests()
      loadContactMessages()
      loadGalleryEntries()
      loadVisualKnowledge()
      loadPendingVisualPhotos()
    }

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://quanton3d-bot-v2.onrender.com/metrics?auth=quanton3d_admin_secret')
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
      const response = await fetch('https://quanton3d-bot-v2.onrender.com/suggestions?auth=quanton3d_admin_secret')
      const data = await response.json()
      // Filtrar apenas sugestões SEM imagem (texto puro)
      // Sugestões COM imagem devem ir para Treinamento Visual
      const textOnlySuggestions = (data.suggestions || []).filter(s => !s.imageUrl)
      setSuggestions(textOnlySuggestions)
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
    }
  }

  const loadCustomRequests = async () => {
    try {
      const response = await fetch('https://quanton3d-bot-v2.onrender.com/custom-requests?auth=quanton3d_admin_secret')
      const data = await response.json()
      setCustomRequests(data.requests || [])
    } catch (error) {
      console.error('Erro ao carregar pedidos customizados:', error)
    }
  }

        const loadContactMessages = async () => {
          try {
            const response = await fetch('https://quanton3d-bot-v2.onrender.com/api/contact?auth=quanton3d_admin_secret')
            const data = await response.json()
            setContactMessages(data.messages || [])
          } catch (error) {
            console.error('Erro ao carregar mensagens de contato:', error)
          }
        }

        const toggleMessageResolved = async (messageId, currentResolved) => {
          try {
            const response = await fetch(`https://quanton3d-bot-v2.onrender.com/api/contact/${messageId}?auth=quanton3d_admin_secret`, {
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

        const loadGalleryEntries = async () => {
      setGalleryLoading(true)
      try {
        const response = await fetch('https://quanton3d-bot-v2.onrender.com/api/gallery/all?auth=quanton3d_admin_secret')
        const data = await response.json()
        setGalleryEntries(data.entries || [])
      } catch (error) {
        console.error('Erro ao carregar galeria:', error)
      } finally {
        setGalleryLoading(false)
      }
    }

    // Funcoes para Gestao de Conhecimento (documentos de texto)
    const loadKnowledgeDocuments = async () => {
      setKnowledgeLoading(true)
      try {
        const response = await fetch('https://quanton3d-bot-v2.onrender.com/api/knowledge?auth=quanton3d_admin_secret')
        const data = await response.json()
        setKnowledgeDocuments(data.documents || [])
      } catch (error) {
        console.error('Erro ao carregar documentos de conhecimento:', error)
      } finally {
        setKnowledgeLoading(false)
      }
    }

    const deleteKnowledgeDocument = async (id) => {
      if (!isAdmin) {
        alert('Seu nivel de acesso nao permite excluir dados.')
        return
      }
      if (!confirm('Tem certeza que deseja deletar este documento? Esta acao nao pode ser desfeita.')) return
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/api/knowledge/${id}?auth=quanton3d_admin_secret`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          alert('Documento deletado com sucesso!')
          loadKnowledgeDocuments()
        } else {
          alert('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao deletar documento:', error)
        alert('Erro ao deletar documento')
      }
    }

    const openEditKnowledge = (doc) => {
      setEditingKnowledge(doc)
      setEditKnowledgeTitle(doc.title || '')
      setEditKnowledgeContent(doc.content || '')
    }

    const saveEditKnowledge = async () => {
      if (!editingKnowledge) return
      if (!editKnowledgeTitle.trim() || !editKnowledgeContent.trim()) {
        alert('Preencha titulo e conteudo!')
        return
      }
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/api/knowledge/${editingKnowledge._id}?auth=quanton3d_admin_secret`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editKnowledgeTitle, content: editKnowledgeContent })
        })
        const data = await response.json()
        if (data.success) {
          alert('Documento atualizado com sucesso!')
          setEditingKnowledge(null)
          loadKnowledgeDocuments()
        } else {
          alert('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao atualizar documento:', error)
        alert('Erro ao atualizar documento')
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

    // Visual RAG functions
    const loadVisualKnowledge = async () => {
      setVisualLoading(true)
      try {
        const response = await fetch('https://quanton3d-bot-v2.onrender.com/api/visual-knowledge?auth=quanton3d_admin_secret')
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
        const response = await fetch('https://quanton3d-bot-v2.onrender.com/api/visual-knowledge/pending?auth=quanton3d_admin_secret')
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
        alert('Preencha todos os campos antes de aprovar')
        return false
      }
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/api/visual-knowledge/${id}/approve?auth=quanton3d_admin_secret`, {
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
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/api/visual-knowledge/${id}?auth=quanton3d_admin_secret`, {
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
        alert('Preencha todos os campos e selecione uma imagem')
        return
      }

      setAddingVisual(true)
      try {
        const formData = new FormData()
        formData.append('image', visualImage)
        formData.append('defectType', visualDefectType)
        formData.append('diagnosis', visualDiagnosis)
        formData.append('solution', visualSolution)

        const response = await fetch('https://quanton3d-bot-v2.onrender.com/api/visual-knowledge?auth=quanton3d_admin_secret', {
          method: 'POST',
          body: formData
        })
        const data = await response.json()
        
        if (data.success) {
          alert('Conhecimento visual adicionado com sucesso!')
          setVisualImage(null)
          setVisualImagePreview(null)
          setVisualDefectType('')
          setVisualDiagnosis('')
          setVisualSolution('')
          loadVisualKnowledge()
        } else {
          alert('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao adicionar conhecimento visual:', error)
        alert('Erro ao adicionar conhecimento visual')
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
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/api/visual-knowledge/${id}?auth=quanton3d_admin_secret`, {
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

    // CORRECAO 3: Carregar detalhes de clientes por resina
    const loadResinDetails = async (resin) => {
      setSelectedResin(resin)
      setResinDetailsLoading(true)
      setResinDetails(null)
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/metrics/resin-details?resin=${encodeURIComponent(resin)}&auth=quanton3d_admin_secret`)
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

    // CORRECAO 4: Carregar historico do cliente
    const loadClientHistory = async (clientKey) => {
      setSelectedClient(clientKey)
      setClientHistoryLoading(true)
      setClientHistory(null)
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/metrics/client-history?clientKey=${encodeURIComponent(clientKey)}&auth=quanton3d_admin_secret`)
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

    const approveGalleryEntry = async (id) => {
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/api/gallery/${id}/approve?auth=quanton3d_admin_secret`, {
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
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/api/gallery/${id}/reject?auth=quanton3d_admin_secret`, {
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

    // Funcao para abrir modal de edicao da galeria
    const openEditGallery = (entry) => {
      setEditingGalleryEntry(entry)
      // Ler dados de entry.params (estrutura do servidor) com fallback para campos antigos
      const params = entry.params || {}
      const lowerLiftDist = params.lowerLiftDistance || {}
      const liftDist = params.liftDistance || {}
      const liftSpd = params.liftSpeed || {}
      const lowerRetractSpd = params.lowerRetractSpeed || {}
      const retractSpd = params.retractSpeed || {}
      
      setEditGalleryData({
        name: entry.name || '',
        resin: entry.resin || '',
        printer: entry.printer || '',
        comment: entry.comment || '',
        layerHeight: params.layerHeight || entry.layerHeight || '',
        baseLayers: params.baseLayers || entry.baseLayers || '',
        exposureTime: params.exposureTime || entry.exposureTime || '',
        baseExposureTime: params.baseExposureTime || entry.baseExposureTime || '',
        transitionLayers: params.transitionLayers || entry.transitionLayers || '',
        uvOffDelay: params.uvOffDelay || entry.uvOffDelay || '',
        lowerLiftDistance1: lowerLiftDist.value1 || entry.lowerLiftDistance1 || '',
        lowerLiftDistance2: lowerLiftDist.value2 || entry.lowerLiftDistance2 || '',
        liftDistance1: liftDist.value1 || entry.liftDistance1 || '',
        liftDistance2: liftDist.value2 || entry.liftDistance2 || '',
        liftSpeed1: liftSpd.value1 || entry.liftSpeed1 || '',
        liftSpeed2: liftSpd.value2 || entry.liftSpeed2 || '',
        lowerRetractSpeed1: lowerRetractSpd.value1 || entry.lowerRetractSpeed1 || '',
        lowerRetractSpeed2: lowerRetractSpd.value2 || entry.lowerRetractSpeed2 || '',
        retractSpeed1: retractSpd.value1 || entry.retractSpeed1 || '',
        retractSpeed2: retractSpd.value2 || entry.retractSpeed2 || ''
      })
    }

    // Funcao para salvar edicao da galeria
    const saveGalleryEdit = async () => {
      if (!editingGalleryEntry) return
      setSavingGalleryEdit(true)
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/api/gallery/${editingGalleryEntry._id}?auth=quanton3d_admin_secret`, {
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

    // Funcoes para gerenciamento de parametros de impressao
    const loadParamsData = async () => {
      setParamsLoading(true)
      try {
        const [resinsRes, printersRes, profilesRes, statsRes] = await Promise.all([
          fetch('https://quanton3d-bot-v2.onrender.com/params/resins'),
          fetch('https://quanton3d-bot-v2.onrender.com/params/printers'),
          fetch('https://quanton3d-bot-v2.onrender.com/params/profiles'),
          fetch('https://quanton3d-bot-v2.onrender.com/params/stats')
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
        alert('Digite o nome da resina')
        return
      }
      try {
        const response = await fetch('https://quanton3d-bot-v2.onrender.com/params/resins?auth=quanton3d_admin_secret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newResinName.trim() })
        })
        const data = await response.json()
        if (data.success) {
          setNewResinName('')
          loadParamsData()
          alert('Resina adicionada com sucesso!')
        } else {
          alert('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao adicionar resina:', error)
        alert('Erro ao adicionar resina')
      }
    }

    const deleteResin = async (resinId) => {
      if (!isAdmin) {
        alert('Seu nivel de acesso nao permite excluir dados.')
        return
      }
      if (!confirm('Tem certeza que deseja deletar esta resina e todos os perfis associados?')) return
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/params/resins/${resinId}?auth=quanton3d_admin_secret`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          loadParamsData()
          alert('Resina deletada com sucesso!')
        } else {
          alert('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao deletar resina:', error)
        alert('Erro ao deletar resina')
      }
    }

    const addPrinter = async () => {
      if (!newPrinterBrand.trim() || !newPrinterModel.trim()) {
        alert('Digite a marca e o modelo da impressora')
        return
      }
      try {
        const response = await fetch('https://quanton3d-bot-v2.onrender.com/params/printers?auth=quanton3d_admin_secret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand: newPrinterBrand.trim(), model: newPrinterModel.trim() })
        })
        const data = await response.json()
        if (data.success) {
          setNewPrinterBrand('')
          setNewPrinterModel('')
          loadParamsData()
          alert('Impressora adicionada com sucesso!')
        } else {
          alert('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao adicionar impressora:', error)
        alert('Erro ao adicionar impressora')
      }
    }

    const deletePrinter = async (printerId) => {
      if (!isAdmin) {
        alert('Seu nivel de acesso nao permite excluir dados.')
        return
      }
      if (!confirm('Tem certeza que deseja deletar esta impressora e todos os perfis associados?')) return
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/params/printers/${printerId}?auth=quanton3d_admin_secret`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          loadParamsData()
          alert('Impressora deletada com sucesso!')
        } else {
          alert('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao deletar impressora:', error)
        alert('Erro ao deletar impressora')
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
        alert('Selecione a resina e a impressora')
        return
      }
      try {
        const response = await fetch('https://quanton3d-bot-v2.onrender.com/params/profiles?auth=quanton3d_admin_secret', {
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
          alert('Perfil salvo com sucesso!')
        } else {
          alert('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao salvar perfil:', error)
        alert('Erro ao salvar perfil')
      }
    }

    const deleteProfile = async (profileId) => {
      if (!isAdmin) {
        alert('Seu nivel de acesso nao permite excluir dados.')
        return
      }
      if (!confirm('Tem certeza que deseja deletar este perfil?')) return
      try {
        const response = await fetch(`https://quanton3d-bot-v2.onrender.com/params/profiles/${profileId}?auth=quanton3d_admin_secret`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          loadParamsData()
          alert('Perfil deletado com sucesso!')
        } else {
          alert('Erro: ' + data.error)
        }
      } catch (error) {
        console.error('Erro ao deletar perfil:', error)
        alert('Erro ao deletar perfil')
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
            <Button onClick={() => { loadMetrics(); loadSuggestions(); loadCustomRequests(); loadContactMessages(); loadGalleryEntries(); loadVisualKnowledge(); loadKnowledgeDocuments(); }} disabled={loading}>
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
            Sugestões ({suggestions.length})
          </Button>
                    <Button 
                      onClick={() => { setActiveTab('knowledge'); loadKnowledgeDocuments(); }}
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
                    onClick={() => setActiveTab('messages')}
                    variant={activeTab === 'messages' ? 'default' : 'outline'}
                    className={activeTab === 'messages' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Mensagens ({contactMessages.length})
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('gallery')}
                    variant={activeTab === 'gallery' ? 'default' : 'outline'}
                    className={activeTab === 'gallery' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Galeria ({galleryEntries.filter(e => e.status === 'pending').length})
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

                        {/* Conversas por Resina - CORRECAO 3: Cards clicaveis */}
                        <Card className="p-6">
                          <h3 className="text-xl font-bold mb-4">🧪 Menções de Resinas nas Conversas</h3>
                          <p className="text-sm text-gray-500 mb-4">Clique em uma resina para ver detalhes dos clientes</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(metrics.resinMentions).map(([resin, count]) => (
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

                        {/* Top Clientes com Duvidas - CORRECAO 4: Botao Ver Historico */}
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

                        {/* Clientes Cadastrados */}
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

        {activeTab === 'knowledge' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Novo Conhecimento ao RAG
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adicione manualmente novos conhecimentos que o bot deverá aprender. O conteúdo será salvo como arquivo .txt na base de conhecimento RAG.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título do Conhecimento</label>
                  <Input
                    placeholder="Ex: Configurações de impressão para resina ABS-Like"
                    value={knowledgeTitle}
                    onChange={(e) => setKnowledgeTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Conteúdo</label>
                  <textarea
                    className="w-full min-h-[200px] p-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o conteúdo completo que o bot deverá aprender...\n\nEx:\nPara impressão com resina ABS-Like:\n- Temperatura: 25-30°C\n- Tempo de exposição: 2-3s\n- Lift speed: 60mm/min"
                    value={knowledgeContent}
                    onChange={(e) => setKnowledgeContent(e.target.value)}
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!knowledgeTitle.trim() || !knowledgeContent.trim()) {
                      alert('Preencha título e conteúdo!')
                      return
                    }
                    setAddingKnowledge(true)
                    try {
                      const response = await fetch('https://quanton3d-bot-v2.onrender.com/add-knowledge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          auth: 'quanton3d_admin_secret',
                          title: knowledgeTitle,
                          content: knowledgeContent
                        })
                      })
                      const data = await response.json()
                      if (data.success) {
                        alert('✅ Conhecimento adicionado com sucesso! O bot já pode usar essa informação.')
                        setKnowledgeTitle('')
                        setKnowledgeContent('')
                      } else {
                        alert('❌ Erro: ' + data.error)
                      }
                    } catch (error) {
                      alert('❌ Erro ao adicionar conhecimento: ' + error.message)
                    } finally {
                      setAddingKnowledge(false)
                    }
                  }}
                  disabled={addingKnowledge}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {addingKnowledge ? 'Adicionando...' : 'Adicionar ao Conhecimento'}
                </Button>
              </div>
            </Card>

                    <Card className="p-6">
                      <h3 className="text-xl font-bold mb-4">💡 Dicas de Uso</h3>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• <strong>Seja específico:</strong> Quanto mais detalhado o conteúdo, melhor o bot responderá</li>
                        <li>• <strong>Use linguagem natural:</strong> Escreva como se estivesse explicando para um cliente</li>
                        <li>• <strong>Organize por tópicos:</strong> Use títulos claros que facilitem a busca semântica</li>
                        <li>• <strong>Inclua exemplos:</strong> Casos práticos ajudam o bot a contextualizar respostas</li>
                        <li>• <strong>Atualize regularmente:</strong> Adicione novos conhecimentos conforme surgem dúvidas frequentes</li>
                      </ul>
                    </Card>

                                        <Card className="p-6">
                                          <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                              <FileText className="h-5 w-5" />
                                              Documentos de Conhecimento ({getFilteredKnowledgeDocuments().length})
                                            </h3>
                                            <Button onClick={loadKnowledgeDocuments} variant="outline" size="sm" disabled={knowledgeLoading}>
                                              {knowledgeLoading ? 'Carregando...' : 'Atualizar Lista'}
                                            </Button>
                                          </div>

                                          {/* Filtro por Data */}
                                          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-sm font-medium">Filtrar por data:</span>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="date"
                                                value={knowledgeDateStart}
                                                onChange={(e) => setKnowledgeDateStart(e.target.value)}
                                                className="w-40 text-sm"
                                                placeholder="Data inicio"
                                              />
                                              <span className="text-gray-500">ate</span>
                                              <Input
                                                type="date"
                                                value={knowledgeDateEnd}
                                                onChange={(e) => setKnowledgeDateEnd(e.target.value)}
                                                className="w-40 text-sm"
                                                placeholder="Data fim"
                                              />
                                            </div>
                                            {(knowledgeDateStart || knowledgeDateEnd) && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setKnowledgeDateStart(''); setKnowledgeDateEnd(''); }}
                                                className="text-gray-500"
                                              >
                                                Limpar filtro
                                              </Button>
                                            )}
                                          </div>
              
                                          {knowledgeLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                            </div>
                                          ) : getFilteredKnowledgeDocuments().length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                              <p>Nenhum documento de conhecimento encontrado</p>
                                              <p className="text-sm">Adicione conhecimentos usando o formulario acima</p>
                                            </div>
                                          ) : (
                                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                              {getFilteredKnowledgeDocuments().map((doc) => (
                                                <div key={doc._id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                                                  <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm truncate">{doc.title || 'Sem titulo'}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                      {doc.content ? doc.content.substring(0, 150) + (doc.content.length > 150 ? '...' : '') : 'Sem conteudo'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                      {doc.source && <span className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">{doc.source}</span>}
                                                      {doc.createdAt && <span>{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>}
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-1 ml-2">
                                                    {isAdmin && (
                                                      <>
                                                        <Button
                                                          onClick={() => openEditKnowledge(doc)}
                                                          variant="ghost"
                                                          size="sm"
                                                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                                          title="Editar documento"
                                                        >
                                                          <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                          onClick={() => deleteKnowledgeDocument(doc._id)}
                                                          variant="ghost"
                                                          size="sm"
                                                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                          title="Excluir documento"
                                                        >
                                                          <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </Card>

                                        {/* Modal de Edicao de Conhecimento */}
                                        {editingKnowledge && (
                                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                                              <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold">Editar Conhecimento</h3>
                                                <Button variant="ghost" size="sm" onClick={() => setEditingKnowledge(null)}>
                                                  <X className="h-4 w-4" />
                                                </Button>
                                              </div>
                                              <div className="space-y-4">
                                                <div>
                                                  <label className="block text-sm font-medium mb-2">Titulo</label>
                                                  <Input
                                                    value={editKnowledgeTitle}
                                                    onChange={(e) => setEditKnowledgeTitle(e.target.value)}
                                                    placeholder="Titulo do conhecimento"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-sm font-medium mb-2">Conteudo</label>
                                                  <textarea
                                                    className="w-full min-h-[200px] p-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                                                    value={editKnowledgeContent}
                                                    onChange={(e) => setEditKnowledgeContent(e.target.value)}
                                                    placeholder="Conteudo do conhecimento"
                                                  />
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                  <Button variant="outline" onClick={() => setEditingKnowledge(null)}>
                                                    Cancelar
                                                  </Button>
                                                  <Button onClick={saveEditKnowledge} className="bg-gradient-to-r from-blue-600 to-purple-600">
                                                    Salvar Alteracoes
                                                  </Button>
                                                </div>
                                              </div>
                                            </Card>
                                          </div>
                                        )}
                  </div>
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

                {activeTab === 'messages' && (
                  <div className="space-y-4">
                    {contactMessages.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Nenhuma mensagem de contato ainda
                        </p>
                      </Card>
                    ) : (
                      contactMessages.map((message, index) => (
                        <Card 
                          key={index} 
                          className={`p-6 transition-all ${message.resolved ? 'opacity-60 bg-gray-100 dark:bg-gray-900' : ''}`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                message.resolved 
                                  ? 'bg-green-500' 
                                  : 'bg-gradient-to-br from-green-500 to-blue-500'
                              }`}>
                                {message.resolved ? (
                                  <Check className="h-5 w-5 text-white" />
                                ) : (
                                  <Mail className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">{message.name}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  {message.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {message.phone}
                                    </span>
                                  )}
                                  {message.email && (
                                    <span className="truncate">{message.email}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                message.resolved 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : message.status === 'new' 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                              }`}>
                                {message.resolved ? 'Resolvido' : message.status === 'new' ? 'Pendente' : message.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(message.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          </div>

                          <div className="flex gap-2 items-center">
                            {message.phone && (
                              <Button 
                                size="sm" 
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => window.open(`https://wa.me/55${message.phone.replace(/\D/g, '')}?text=Olá ${message.name}, recebemos sua mensagem...`, '_blank')}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                WhatsApp
                              </Button>
                            )}
                            {message.email && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => window.open(`mailto:${message.email}?subject=Re: Contato Quanton3D&body=Olá ${message.name},%0A%0ARecebemos sua mensagem...`, '_blank')}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={message.resolved ? 'outline' : 'default'}
                              className={message.resolved ? 'border-green-500 text-green-600' : 'bg-blue-600 hover:bg-blue-700'}
                              onClick={() => toggleMessageResolved(message._id, message.resolved)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {message.resolved ? 'Reabrir' : 'Marcar Resolvido'}
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}

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
                                  const response = await fetch(`https://quanton3d-bot-v2.onrender.com/approve-suggestion/${suggestion.id}`, {
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
                                const response = await fetch(`https://quanton3d-bot-v2.onrender.com/approve-suggestion/${suggestion.id}`, {
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
                                  const response = await fetch(`https://quanton3d-bot-v2.onrender.com/reject-suggestion/${suggestion.id}`, {
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

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Galeria de Fotos - Aprovacao
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Aprove ou rejeite as fotos enviadas pelos clientes antes de aparecerem na galeria publica.
              </p>
            </Card>

            {galleryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : galleryEntries.filter(e => e.status !== 'rejected').length === 0 ? (
              <Card className="p-8 text-center">
                <Image className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-gray-500">Nenhuma foto na galeria ainda.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {galleryEntries.filter(e => e.status !== 'rejected').map((entry) => (
                  <Card key={entry._id} className="p-4">
                    <div className="flex gap-4">
                      {/* Images */}
                      <div className="flex gap-2 flex-shrink-0">
                        {entry.images && entry.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={`Foto ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{entry.name || 'Anonimo'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(entry.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : entry.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {entry.status === 'pending' ? 'Pendente' : entry.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Resina:</span>
                            <span className="ml-1 font-medium">{entry.resin}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Impressora:</span>
                            <span className="ml-1 font-medium">{entry.printer}</span>
                          </div>
                        </div>
                        
                        {entry.comment && (
                          <p className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 p-2 rounded mb-3">
                            {entry.comment}
                          </p>
                        )}

                        {/* Configuracoes de Impressao */}
                        {(() => {
                          const params = entry.params || {}
                          const lowerLiftDist = params.lowerLiftDistance || {}
                          const liftDist = params.liftDistance || {}
                          const liftSpd = params.liftSpeed || {}
                          const lowerRetractSpd = params.lowerRetractSpeed || {}
                          const retractSpd = params.retractSpeed || {}
                          return (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">Configuracoes de Impressao</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div><span className="text-gray-500">Altura Camada:</span> <span className="font-medium">{params.layerHeight || entry.layerHeight || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Camadas Base:</span> <span className="font-medium">{params.baseLayers || entry.baseLayers || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Tempo Exp.:</span> <span className="font-medium">{params.exposureTime || entry.exposureTime || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Tempo Exp. Base:</span> <span className="font-medium">{params.baseExposureTime || entry.baseExposureTime || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Camadas Trans.:</span> <span className="font-medium">{params.transitionLayers || entry.transitionLayers || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Atraso UV:</span> <span className="font-medium">{params.uvOffDelay || entry.uvOffDelay || 'N/A'}</span></div>
                          </div>
                          
                          {/* Distancias de Elevacao */}
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mt-3 mb-1">Distancias de Elevacao (mm)</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-gray-500">Inferior:</span> <span className="font-medium">{lowerLiftDist.value1 || entry.lowerLiftDistance1 || 'N/A'} / {lowerLiftDist.value2 || entry.lowerLiftDistance2 || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Normal:</span> <span className="font-medium">{liftDist.value1 || entry.liftDistance1 || 'N/A'} / {liftDist.value2 || entry.liftDistance2 || 'N/A'}</span></div>
                          </div>
                          
                          {/* Velocidades */}
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mt-3 mb-1">Velocidades (mm/s)</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-gray-500">Elevacao:</span> <span className="font-medium">{liftSpd.value1 || entry.liftSpeed1 || 'N/A'} / {liftSpd.value2 || entry.liftSpeed2 || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Retracao:</span> <span className="font-medium">{retractSpd.value1 || entry.retractSpeed1 || 'N/A'} / {retractSpd.value2 || entry.retractSpeed2 || 'N/A'}</span></div>
                          </div>
                        </div>
                          )
                        })()}
                        
                        {entry.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveGalleryEntry(entry._id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            {isAdmin && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => rejectGalleryEntry(entry._id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {entry.status === 'approved' && isAdmin && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              onClick={() => openEditGallery(entry)}
                            >
                              <Edit3 className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => rejectGalleryEntry(entry._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Apagar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
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
              {pendingVisualPhotos.length > 0 && (
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

        {/* Modal de Edicao da Galeria */}
        {editingGalleryEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Editar Entrada da Galeria</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setEditingGalleryEntry(null)
                    setEditGalleryData({})
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Preview das imagens */}
              <div className="flex gap-2 mb-4">
                {editingGalleryEntry.images && editingGalleryEntry.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Foto ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                ))}
              </div>

              <div className="space-y-4">
                {/* Dados basicos */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <Input
                      value={editGalleryData.name || ''}
                      onChange={(e) => setEditGalleryData({...editGalleryData, name: e.target.value})}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Resina</label>
                    <Input
                      value={editGalleryData.resin || ''}
                      onChange={(e) => setEditGalleryData({...editGalleryData, resin: e.target.value})}
                      placeholder="Resina utilizada"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Impressora</label>
                    <Input
                      value={editGalleryData.printer || ''}
                      onChange={(e) => setEditGalleryData({...editGalleryData, printer: e.target.value})}
                      placeholder="Modelo da impressora"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Comentario</label>
                    <Input
                      value={editGalleryData.comment || ''}
                      onChange={(e) => setEditGalleryData({...editGalleryData, comment: e.target.value})}
                      placeholder="Comentario opcional"
                    />
                  </div>
                </div>

                {/* Configuracoes de Impressao */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Configuracoes de Impressao</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Altura Camada (mm)</label>
                      <Input
                        value={editGalleryData.layerHeight || ''}
                        onChange={(e) => setEditGalleryData({...editGalleryData, layerHeight: e.target.value})}
                        placeholder="0.05"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Camadas Base</label>
                      <Input
                        value={editGalleryData.baseLayers || ''}
                        onChange={(e) => setEditGalleryData({...editGalleryData, baseLayers: e.target.value})}
                        placeholder="6"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tempo Exposicao (s)</label>
                      <Input
                        value={editGalleryData.exposureTime || ''}
                        onChange={(e) => setEditGalleryData({...editGalleryData, exposureTime: e.target.value})}
                        placeholder="2.5"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tempo Exp. Base (s)</label>
                      <Input
                        value={editGalleryData.baseExposureTime || ''}
                        onChange={(e) => setEditGalleryData({...editGalleryData, baseExposureTime: e.target.value})}
                        placeholder="30"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Camadas Transicao</label>
                      <Input
                        value={editGalleryData.transitionLayers || ''}
                        onChange={(e) => setEditGalleryData({...editGalleryData, transitionLayers: e.target.value})}
                        placeholder="5"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Atraso UV (s)</label>
                      <Input
                        value={editGalleryData.uvOffDelay || ''}
                        onChange={(e) => setEditGalleryData({...editGalleryData, uvOffDelay: e.target.value})}
                        placeholder="0.5"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Distancias */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Distancias (mm)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Elevacao Inferior (1/2)</label>
                      <div className="flex gap-2">
                        <Input
                          value={editGalleryData.lowerLiftDistance1 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, lowerLiftDistance1: e.target.value})}
                          placeholder="Valor 1"
                          className="text-sm"
                        />
                        <Input
                          value={editGalleryData.lowerLiftDistance2 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, lowerLiftDistance2: e.target.value})}
                          placeholder="Valor 2"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Elevacao Normal (1/2)</label>
                      <div className="flex gap-2">
                        <Input
                          value={editGalleryData.liftDistance1 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, liftDistance1: e.target.value})}
                          placeholder="Valor 1"
                          className="text-sm"
                        />
                        <Input
                          value={editGalleryData.liftDistance2 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, liftDistance2: e.target.value})}
                          placeholder="Valor 2"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Retracao Inferior (1/2)</label>
                      <div className="flex gap-2">
                        <Input
                          value={editGalleryData.lowerRetractDistance1 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, lowerRetractDistance1: e.target.value})}
                          placeholder="Valor 1"
                          className="text-sm"
                        />
                        <Input
                          value={editGalleryData.lowerRetractDistance2 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, lowerRetractDistance2: e.target.value})}
                          placeholder="Valor 2"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Retracao Normal (1/2)</label>
                      <div className="flex gap-2">
                        <Input
                          value={editGalleryData.retractDistance1 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, retractDistance1: e.target.value})}
                          placeholder="Valor 1"
                          className="text-sm"
                        />
                        <Input
                          value={editGalleryData.retractDistance2 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, retractDistance2: e.target.value})}
                          placeholder="Valor 2"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Velocidades */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Velocidades (mm/s)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Elevacao Inferior (1/2)</label>
                      <div className="flex gap-2">
                        <Input
                          value={editGalleryData.lowerLiftSpeed1 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, lowerLiftSpeed1: e.target.value})}
                          placeholder="Valor 1"
                          className="text-sm"
                        />
                        <Input
                          value={editGalleryData.lowerLiftSpeed2 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, lowerLiftSpeed2: e.target.value})}
                          placeholder="Valor 2"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Elevacao Normal (1/2)</label>
                      <div className="flex gap-2">
                        <Input
                          value={editGalleryData.liftSpeed1 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, liftSpeed1: e.target.value})}
                          placeholder="Valor 1"
                          className="text-sm"
                        />
                        <Input
                          value={editGalleryData.liftSpeed2 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, liftSpeed2: e.target.value})}
                          placeholder="Valor 2"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Retracao Inferior (1/2)</label>
                      <div className="flex gap-2">
                        <Input
                          value={editGalleryData.lowerRetractSpeed1 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, lowerRetractSpeed1: e.target.value})}
                          placeholder="Valor 1"
                          className="text-sm"
                        />
                        <Input
                          value={editGalleryData.lowerRetractSpeed2 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, lowerRetractSpeed2: e.target.value})}
                          placeholder="Valor 2"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Retracao Normal (1/2)</label>
                      <div className="flex gap-2">
                        <Input
                          value={editGalleryData.retractSpeed1 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, retractSpeed1: e.target.value})}
                          placeholder="Valor 1"
                          className="text-sm"
                        />
                        <Input
                          value={editGalleryData.retractSpeed2 || ''}
                          onChange={(e) => setEditGalleryData({...editGalleryData, retractSpeed2: e.target.value})}
                          placeholder="Valor 2"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botoes */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingGalleryEntry(null)
                      setEditGalleryData({})
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={saveGalleryEdit}
                    disabled={savingGalleryEdit}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {savingGalleryEdit ? 'Salvando...' : 'Salvar Alteracoes'}
                  </Button>
                </div>
              </div>
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
