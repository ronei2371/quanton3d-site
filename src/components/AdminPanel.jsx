import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { X, Check, Clock, User, Phone, Calendar, MessageSquare, Users, TrendingUp, BarChart3, BookOpen, Plus, FileText, Beaker, Edit3, Mail, Camera, Image, Loader2, Eye, Trash2, Upload, AlertCircle, Filter } from 'lucide-react'

// URL base da API (garantindo que pega a rota certa)
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
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border shadow-sm">
      <div className="flex gap-4">
        <img 
          src={item.imageUrl} 
          alt="Foto pendente" 
          className="w-40 h-40 object-cover rounded-lg border flex-shrink-0"
        />
        <div className="flex-1 space-y-3">
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Enviada em: {new Date(item.createdAt).toLocaleString('pt-BR')}</span>
            {item.userName && <span className="font-semibold text-blue-600">Cliente: {item.userName}</span>}
          </div>
          <select
            value={defectType}
            onChange={(e) => setDefectType(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o tipo de defeito...</option>
            <option value="problema de LCD">Problema de LCD / Tela</option>
            <option value="descolamento da base">Descolamento da base</option>
            <option value="falha de suportes">Falha de suportes</option>
            <option value="rachadura/quebra da peca">Rachadura/quebra da peça</option>
            <option value="falha de adesao entre camadas / delaminacao">Delaminação</option>
            <option value="deformacao/warping">Deformação/Warping</option>
            <option value="problema de superficie/acabamento">Problema de superfície</option>
            <option value="excesso ou falta de cura">Excesso ou falta de cura</option>
            <option value="outro">Outro</option>
          </select>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Diagnóstico técnico (O que o bot deve responder?)"
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600 min-h-[60px]"
          />
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Solução recomendada passo a passo..."
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600 min-h-[60px]"
          />
          <div className="flex gap-2">
            <Button 
              size="sm"
              onClick={handleApproveClick}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Aprovando...' : 'Aprovar e Treinar Bot'}
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
      // CORRECAO: Rota correta /api/suggestions
      const response = await fetch(`${API_BASE}/api/suggestions?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
    }
  }

  const loadCustomRequests = async () => {
    try {
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

  // --- Galeria ---
  const loadGalleryEntries = async () => {
    setGalleryLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/gallery/all?auth=quanton3d_admin_secret`)
      const data = await response.json()
      setGalleryEntries(data.entries || [])
    } catch (error) { console.error(error) } finally { setGalleryLoading(false) }
  }

  // --- Detalhes Resina ---
  const loadResinDetails = async (resin) => {
    setSelectedResin(resin)
    setResinDetailsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/metrics/resin-details?resin=${encodeURIComponent(resin)}&auth=quanton3d_admin_secret`)
      const data = await response.json()
      if (data.success) setResinDetails(data)
    } catch (error) { console.error(error) } finally { setResinDetailsLoading(false) }
  }

  // --- Filtros ---
  const getFilteredKnowledge = () => {
    if (!knowledgeDateStart && !knowledgeDateEnd) return knowledgeDocuments
    return knowledgeDocuments.filter(doc => {
      const d = new Date(doc.createdAt)
      if (knowledgeDateStart && d < new Date(knowledgeDateStart)) return false
      if (knowledgeDateEnd && d > new Date(knowledgeDateEnd + 'T23:59:59')) return false
      return true
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">
            Painel Quanton3D
          </h2>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Senha de Acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="bg-gray-700 text-white border-gray-600"
            />
            <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
              Acessar Sistema
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 font-sans text-gray-900 dark:text-gray-100">
      <div className="container mx-auto max-w-7xl">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
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

        {/* === ABA MÉTRICAS === */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
                <p className="text-blue-100 mb-1">Total de Conversas</p>
                <p className="text-4xl font-bold">{metrics.conversations.total}</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg">
                <p className="text-purple-100 mb-1">Clientes Registrados</p>
                <p className="text-4xl font-bold">{metrics.registrations.total}</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-lg">
                <p className="text-green-100 mb-1">Taxa de Conversão</p>
                <p className="text-4xl font-bold">
                  {metrics.conversations.total > 0 ? ((metrics.registrations.total / metrics.conversations.uniqueSessions) * 100).toFixed(1) : 0}%
                </p>
              </Card>
            </div>

            {/* Resinas (Filtrando "Outros") */}
            <Card className="p-6 border-none shadow-md">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Beaker className="h-5 w-5 text-blue-500" />
                Resinas Mais Utilizadas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(metrics.resinMentions)
                  .filter(([name]) => !['Outros', 'Outra', 'Outras'].includes(name)) // Filtra "Outros"
                  .map(([resin, count]) => (
                    <div 
                      key={resin}
                      onClick={() => loadResinDetails(resin)}
                      className="cursor-pointer group relative overflow-hidden bg-white dark:bg-gray-800 border p-4 rounded-xl hover:border-blue-500 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500">{resin}</p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1 group-hover:text-blue-500 transition-colors">{count}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Users className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Questions */}
              <Card className="p-6 border-none shadow-md">
                <h3 className="text-lg font-bold mb-4">Perguntas Frequentes</h3>
                <div className="space-y-3">
                  {metrics.topQuestions.slice(0, 5).map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm truncate flex-1 mr-4">{q.question}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{q.count}x</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6 border-none shadow-md">
                <h3 className="text-lg font-bold mb-4">Atividade Recente</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {metrics.conversations.recent.map((conv, i) => (
                    <div key={i} className="text-sm border-l-2 border-blue-500 pl-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{conv.userName || 'Visitante'}</span>
                        <span>{new Date(conv.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 truncate">"{conv.message}"</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* === ABA SUGESTÕES === */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 border-none shadow-md bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <MessageSquare className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">Sugestões de Correção</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Aqui aparecem as sugestões enviadas pelos clientes quando o bot erra ou não sabe responder. 
                    Aprovar uma sugestão adiciona o conhecimento ao banco automaticamente.
                  </p>
                </div>
              </div>
            </Card>

            {suggestions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Check className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Nenhuma sugestão pendente! 🎉</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {suggestions.map((item) => (
                  <Card key={item.id} className="p-6 border-l-4 border-yellow-400 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 dark:text-white">{item.userName}</span>
                        <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">PENDENTE</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-xs font-bold text-gray-400 mb-1">PERGUNTA DO CLIENTE</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.lastUserMessage || '-'}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                        <p className="text-xs font-bold text-green-600 mb-1">SUGESTÃO DO CLIENTE</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{item.suggestion}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" 
                        onClick={async () => {
                          if(confirm('Rejeitar sugestão?')) {
                             /* Lógica de rejeição via API se existir, ou apenas remover da lista visual */
                             alert('Funcionalidade de rejeição em desenvolvimento no backend.')
                          }
                        }}
                      >
                        Rejeitar
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                         onClick={async () => {
                           try {
                             const response = await fetch(`${API_BASE}/approve-suggestion/${item.id}`, {
                               method: 'PUT',
                               headers: {'Content-Type': 'application/json'},
                               body: JSON.stringify({ auth: 'quanton3d_admin_secret', editedAnswer: item.suggestion })
                             })
                             const data = await response.json()
                             if(data.success) {
                               alert('Sugestão aprovada e adicionada ao conhecimento!')
                               loadSuggestions()
                             } else {
                               alert('Erro: ' + data.message)
                             }
                           } catch(e) { alert('Erro: ' + e.message) }
                         }}
                      >
                        <Check className="h-4 w-4 mr-2" /> Aprovar e Ensinar Bot
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
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
                  <h4 className="font-bold">Documentos Existentes ({getFilteredKnowledge().length})</h4>
                  <Button variant="ghost" size="sm" onClick={loadKnowledgeDocuments}><TrendingUp className="h-4 w-4"/></Button>
                </div>
                
                {/* Filtro de Data */}
                <div className="flex gap-2 mb-4 bg-gray-50 p-2 rounded-lg">
                  <Input type="date" className="text-xs" value={knowledgeDateStart} onChange={e => setKnowledgeDateStart(e.target.value)} />
                  <Input type="date" className="text-xs" value={knowledgeDateEnd} onChange={e => setKnowledgeDateEnd(e.target.value)} />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {getFilteredKnowledge().map(doc => (
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

      </div>
    </div>
  )
}
