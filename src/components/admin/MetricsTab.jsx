import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Calendar, Eye, Loader2, MessageSquare, Phone, TrendingUp, User, Users, X } from 'lucide-react'
import { toast } from 'sonner'

export function MetricsTab({ buildAdminUrl, refreshKey }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [conversationDateFilter, setConversationDateFilter] = useState('all')
  const [showAllClients, setShowAllClients] = useState(false)
  const [clientsDateFilter, setClientsDateFilter] = useState('all')
  const [selectedResin, setSelectedResin] = useState(null)
  const [resinDetails, setResinDetails] = useState(null)
  const [resinDetailsLoading, setResinDetailsLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientHistory, setClientHistory] = useState(null)
  const [clientHistoryLoading, setClientHistoryLoading] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [topicConversations, setTopicConversations] = useState([])
  const [topicLoading, setTopicLoading] = useState(false)

  const loadMetrics = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(buildAdminUrl('/metrics'))
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
      toast.error('Erro ao carregar métricas')
    } finally {
      setLoading(false)
    }
  }, [buildAdminUrl])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics, refreshKey])

  const loadResinDetails = async (resin) => {
    const resinName = resin?.trim()
    if (!resinName) {
      toast.error('Selecione uma resina válida para ver os detalhes')
      return
    }
    setSelectedResin(resinName)
    setResinDetailsLoading(true)
    setResinDetails(null)
    try {
      const response = await fetch(buildAdminUrl('/metrics/resin-details', { resin: resinName }))
      const data = await response.json()
      if (data.success) {
        setResinDetails(data)
      } else {
        toast.error(data.error ? `Erro ao carregar detalhes: ${data.error}` : 'Erro ao carregar detalhes da resina')
        setSelectedResin(null)
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da resina:', error)
      toast.error('Erro ao carregar detalhes da resina')
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
      const response = await fetch(buildAdminUrl('/metrics/client-history', { clientKey }))
      const data = await response.json()
      if (data.success) {
        setClientHistory(data)
      } else {
        toast.error(data.error ? `Erro ao carregar histórico: ${data.error}` : 'Erro ao carregar histórico do cliente')
        setSelectedClient(null)
      }
    } catch (error) {
      console.error('Erro ao carregar historico do cliente:', error)
      toast.error('Erro ao carregar histórico do cliente')
      setSelectedClient(null)
    } finally {
      setClientHistoryLoading(false)
    }
  }

  const loadTopicConversations = async (topic) => {
    setSelectedTopic(topic)
    setTopicLoading(true)
    setTopicConversations([])
    try {
      const response = await fetch(buildAdminUrl('/metrics/topic-details', { topic }))
      const data = await response.json()
      if (data.success) {
        setTopicConversations(data.conversations || [])
      } else {
        const filtered =
          metrics?.conversations?.recent?.filter(
            (conv) =>
              conv.message?.toLowerCase().includes(topic.toLowerCase()) ||
              conv.reply?.toLowerCase().includes(topic.toLowerCase())
          ) || []
        setTopicConversations(filtered)
      }
    } catch (error) {
      console.error('Erro ao carregar conversas do topico:', error)
      const filtered =
        metrics?.conversations?.recent?.filter(
          (conv) =>
            conv.message?.toLowerCase().includes(topic.toLowerCase()) ||
            conv.reply?.toLowerCase().includes(topic.toLowerCase())
        ) || []
      setTopicConversations(filtered)
    } finally {
      setTopicLoading(false)
    }
  }

  const getFilteredClients = () => {
    if (!metrics?.registrations?.users) return []
    const users = metrics.registrations.users
    if (clientsDateFilter === 'all') return users

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return users.filter((user) => {
      const regDate = new Date(user.registeredAt)
      switch (clientsDateFilter) {
        case 'today':
          return regDate >= today
        case 'this_week':
          return regDate >= thisWeekStart
        case 'this_month':
          return regDate >= thisMonthStart
        default:
          return true
      }
    })
  }

  const getFilteredConversations = () => {
    if (!metrics?.conversations?.recent) return []
    const conversations = metrics.conversations.recent
    if (conversationDateFilter === 'all') return conversations

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    return conversations.filter((conv) => {
      const convDate = new Date(conv.timestamp)
      switch (conversationDateFilter) {
        case 'today':
          return convDate >= today
        case 'yesterday':
          return convDate >= yesterday && convDate < today
        case 'last_week':
          return convDate >= lastWeek
        case 'last_month':
          return convDate >= lastMonth
        default:
          return true
      }
    })
  }

  return (
    <>
      {!metrics ? (
        <Card className="p-6 flex items-center gap-3">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? 'Carregando métricas...' : 'Nenhuma métrica carregada. Clique em atualizar para tentar novamente.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
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
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Cadastros / Sessões</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-500 opacity-20" />
              </div>
            </Card>
          </div>

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
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? 'bg-yellow-400 text-yellow-900'
                              : index === 1
                                ? 'bg-gray-300 text-gray-700'
                                : index === 2
                                  ? 'bg-orange-400 text-orange-900'
                                  : 'bg-blue-100 text-blue-800'
                          }`}
                        >
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

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🔥 Tópicos Mais Acessados</h3>
              <p className="text-xs text-gray-500 mb-3">Clique em um tópico para ver as conversas relacionadas</p>
              {!metrics.topTopics || metrics.topTopics.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum tópico registrado ainda</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {metrics.topTopics.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => loadTopicConversations(item.topic)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 hover:scale-105 transition-all ${
                        index < 3
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : index < 6
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                            : index < 10
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                      title={`Clique para ver ${item.count} conversas sobre "${item.topic}"`}
                    >
                      {item.topic} ({item.count})
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowAllClients(!showAllClients)}>
                <h3 className="text-xl font-bold">👥 Clientes Cadastrados ({metrics.registrations.total})</h3>
                <Button variant="ghost" size="sm">
                  {showAllClients ? '▲' : '▼'}
                </Button>
              </div>
              {showAllClients && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <select
                    value={clientsDateFilter}
                    onChange={(e) => setClientsDateFilter(e.target.value)}
                    className="px-2 py-1 text-sm border rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="all">Todos</option>
                    <option value="today">Hoje</option>
                    <option value="this_week">Esta Semana</option>
                    <option value="this_month">Este Mês</option>
                  </select>
                </div>
              )}
            </div>
            {showAllClients && (
              <>
                {getFilteredClients().length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {clientsDateFilter === 'all' ? 'Nenhum cadastro realizado ainda' : 'Nenhum cadastro encontrado para este período'}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-500 mb-2">
                      Mostrando {getFilteredClients().length} de {metrics.registrations.total} clientes
                    </p>
                    {getFilteredClients().map((user, index) => (
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
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.registeredAt).toLocaleDateString('pt-BR')}
                          </span>
                          <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => loadClientHistory(user.email || user.phone)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Histórico
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">💬 Últimas Conversas</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Filtrar:</span>
                <select
                  value={conversationDateFilter}
                  onChange={(e) => setConversationDateFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="today">Hoje</option>
                  <option value="yesterday">Ontem</option>
                  <option value="last_week">Última Semana</option>
                  <option value="last_month">Último Mês</option>
                </select>
              </div>
            </div>
            {getFilteredConversations().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {conversationDateFilter === 'all' ? 'Nenhuma conversa registrada ainda' : 'Nenhuma conversa encontrada para este período'}
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-500 mb-2">
                  Mostrando {Math.min(getFilteredConversations().length, 20)} de {getFilteredConversations().length} conversas
                </p>
                {getFilteredConversations()
                  .slice(0, 20)
                  .map((conv, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{conv.userName}</span>
                        <span className="text-xs text-gray-500">{new Date(conv.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                          <p className="text-sm">
                            <strong>Pergunta:</strong> {conv.message}
                          </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                          <p className="text-sm whitespace-pre-wrap">
                            <strong>Resposta:</strong> {conv.reply}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      )}

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
                              <strong>Resposta:</strong> {conv.botReply?.substring(0, 200)}
                              {conv.botReply?.length > 200 ? '...' : ''}
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

      {selectedTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">🔥 Conversas sobre: {selectedTopic}</h3>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedTopic(null); setTopicConversations([]); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {topicLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2">Carregando conversas...</span>
              </div>
            ) : topicConversations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma conversa encontrada para este tópico</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Encontradas {topicConversations.length} conversas relacionadas a "{selectedTopic}"</p>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {topicConversations.map((conv, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{conv.userName || conv.customerName || 'Cliente'}</span>
                        <span className="text-xs text-gray-500">{new Date(conv.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                          <p className="text-sm">
                            <strong>Pergunta:</strong> {conv.message || conv.userPrompt}
                          </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                          <p className="text-sm whitespace-pre-wrap">
                            <strong>Resposta:</strong> {conv.reply || conv.botReply}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

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
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                conv.documentsFound > 0
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}
                            >
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
                              <span
                                className={`px-2 py-1 rounded ${
                                  conv.documentsFound > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                                }`}
                              >
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
    </>
  )
}
