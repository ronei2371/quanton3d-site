import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { BarChart3, TrendingUp, Users, ShoppingBag, Loader2 } from 'lucide-react'

export function MetricsTab({ apiToken, buildAdminUrl, refreshKey }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/metrics`, {
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {}
        })
        
        if (!response.ok) {
            // Se der erro 404/500, a gente finge que não viu e mostra dados zerados
            // para não quebrar a tela com erro HTML
            console.warn("Métricas não disponíveis ou erro na API.")
            setMetrics({
                totalConversas: 0,
                totalSugestoes: 0,
                totalPedidos: 0,
                totalUsuarios: 0
            })
            return
        }

        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        console.error("Erro ao carregar métricas:", err)
        setError("Não foi possível carregar os dados.")
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [apiToken, refreshKey])

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  if (!metrics) {
      return <div className="text-center p-10 text-gray-500">Dados indisponíveis no momento.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Conversas Totais</h3>
          <MessageIcon className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-gray-800">{metrics.totalConversas || 0}</div>
        <p className="text-xs text-green-600 flex items-center mt-1">
          <TrendingUp className="h-3 w-3 mr-1" /> Ativas
        </p>
      </Card>

      <Card className="p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Sugestões</h3>
          <Users className="h-4 w-4 text-purple-500" />
        </div>
        <div className="text-2xl font-bold text-gray-800">{metrics.totalSugestoes || 0}</div>
      </Card>

      <Card className="p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Pedidos</h3>
          <ShoppingBag className="h-4 w-4 text-green-500" />
        </div>
        <div className="text-2xl font-bold text-gray-800">{metrics.totalPedidos || 0}</div>
      </Card>

      <Card className="p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Métricas Gerais</h3>
          <BarChart3 className="h-4 w-4 text-orange-500" />
        </div>
        <div className="text-2xl font-bold text-gray-800">--</div>
      </Card>
    </div>
  )
}

function MessageIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
      </svg>
    )
}
