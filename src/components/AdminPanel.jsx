import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { X, Check, Clock, User, Phone, Calendar, MessageSquare, Users, TrendingUp, BarChart3 } from 'lucide-react'

export function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('metrics') // 'metrics' | 'suggestions'
  const [metrics, setMetrics] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const ADMIN_PASSWORD = 'quanton3d2024'

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      loadMetrics()
      loadSuggestions()
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
            <Button onClick={() => { loadMetrics(); loadSuggestions(); }} disabled={loading}>
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
                          <p className="text-sm"><strong>Resposta:</strong> {conv.reply.substring(0, 200)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
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

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-sm whitespace-pre-wrap">{suggestion.suggestion}</p>
                  </div>

                  {suggestion.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => alert('Sugestão aprovada! (Implementar lógica de aprovação)')}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => alert('Sugestão rejeitada! (Implementar lógica de rejeição)')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
