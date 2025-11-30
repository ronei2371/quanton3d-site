import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { X, Check, Clock, User, Phone, Calendar, MessageSquare, Users, TrendingUp, BarChart3, BookOpen, Plus, FileText, Beaker, Edit3, Mail, Camera, Image, Loader2 } from 'lucide-react'

export function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
    const [activeTab, setActiveTab] = useState('metrics') // 'metrics' | 'suggestions' | 'knowledge' | 'custom' | 'messages' | 'gallery'
    const [metrics, setMetrics] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [knowledgeTitle, setKnowledgeTitle] = useState('')
    const [knowledgeContent, setKnowledgeContent] = useState('')
    const [addingKnowledge, setAddingKnowledge] = useState(false)
    const [customRequests, setCustomRequests] = useState([])
    const [editingSuggestion, setEditingSuggestion] = useState(null)
    const [editedText, setEditedText] = useState('')
    const [contactMessages, setContactMessages] = useState([])
    const [galleryEntries, setGalleryEntries] = useState([])
    const [galleryLoading, setGalleryLoading] = useState(false)

  const ADMIN_PASSWORD = 'quanton3d2024'

    const handleLogin = () => {
      if (password === ADMIN_PASSWORD) {
        setIsAuthenticated(true)
        loadMetrics()
        loadSuggestions()
        loadCustomRequests()
        loadContactMessages()
        loadGalleryEntries()
      } else {
        alert('Senha incorreta!')
      }
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
      setSuggestions(data.suggestions || [])
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
              placeholder="Senha de administrador"
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Painel Administrativo
          </h1>
          <div className="flex items-center gap-3">
            <Button onClick={() => { loadMetrics(); loadSuggestions(); loadCustomRequests(); loadContactMessages(); loadGalleryEntries(); }} disabled={loading}>
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
            onClick={() => setActiveTab('knowledge')}
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

            {/* Conversas por Resina */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🧪 Menções de Resinas nas Conversas</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(metrics.resinMentions).map(([resin, count]) => (
                  <div key={resin} className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{resin}</p>
                    <p className="text-2xl font-bold text-purple-600">{count}</p>
                  </div>
                ))}
              </div>
            </Card>

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
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-white" />
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
                        message.status === 'new' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {message.status === 'new' ? 'Nova' : message.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>

                  <div className="flex gap-2">
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
            ) : galleryEntries.length === 0 ? (
              <Card className="p-8 text-center">
                <Image className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-gray-500">Nenhuma foto na galeria ainda.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {galleryEntries.map((entry) => (
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => rejectGalleryEntry(entry._id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
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
      </div>
    </div>
  )
}
