import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { BarChart3, TrendingUp, Users, ShoppingBag, Loader2 } from 'lucide-react'

export function MetricsTab({ apiToken, buildAdminUrl, refreshKey }) {
  const [metrics, setMetrics] = useState({
    totalConversas: 0,
    totalSugestoes: 0,
    totalPedidos: 0,
    totalUsuarios: 0
  })

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
      const response = await fetch(buildAdminUrl('/admin/metrics/resin-details', { resin: resinName }), {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : undefined
      })
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
      const response = await fetch(buildAdminUrl('/admin/metrics/client-history', { clientKey }), {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : undefined
      })
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
      const response = await fetch(buildAdminUrl('/admin/metrics/topic-details', { topic }), {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : undefined
      })
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

  const [loading, setLoading] = useState(false)

  const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/metrics`, {
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {}
        })
        
        if (response.ok) {
            const data = await response.json()
            setMetrics(data)
        }
      } catch (err) {
        console.error("Erro métricas:", err)
      } finally {
        setLoading(false)
 main
      }
    }

    fetchMetrics()
  }, [apiToken, refreshKey])

  if (loading) return <div className="p-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Conversas</span>
          <BarChart3 className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold">{metrics.totalConversas || 0}</div>
      </Card>
      
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Sugestões</span>
          <Users className="h-4 w-4 text-purple-500" />
        </div>
        <div className="text-2xl font-bold">{metrics.totalSugestoes || 0}</div>
      </Card>

      <Card className="p-4 flex flex-col justify-between">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Pedidos</span>
          <ShoppingBag className="h-4 w-4 text-green-500" />
        </div>
        <div className="text-2xl font-bold">{metrics.totalPedidos || 0}</div>
      </Card>
    </div>
  )
}
