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
