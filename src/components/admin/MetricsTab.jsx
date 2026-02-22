import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { BarChart3, TrendingUp, Users, ShoppingBag, Loader2 } from 'lucide-react'

export function MetricsTab({ apiToken, buildAdminUrl, refreshKey }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true)
      setError(null)
      try {
        const url = buildAdminUrl('/health/metrics')
        const response = await fetch(url, {
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : undefined
        })

        if (!response.ok) {
          throw new Error(`Erro ao carregar métricas (${response.status})`)
        }

        const payload = await response.json()
        setMetrics(payload.metrics || payload)
      } catch (err) {
        console.error('Erro métricas:', err)
        setError(err.message || 'Falha ao carregar métricas do backend')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [apiToken, buildAdminUrl, refreshKey])

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-sm text-red-600 bg-red-50 border border-red-200">
        {error}
      </Card>
    )
  }

  const totalRequests = metrics?.totalRequests ?? 0
  const totalErrors = metrics?.totalErrors ?? 0
  const ragSearches = metrics?.totalRAGSearches ?? 0
  const ragHitRate = metrics?.ragHitRate ?? 'N/A'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Requisições</span>
          <BarChart3 className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold">{totalRequests}</div>
      </Card>

      <Card className="p-4 flex flex-col justify-between">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Erros</span>
          <TrendingUp className="h-4 w-4 text-red-500" />
        </div>
        <div className="text-2xl font-bold">{totalErrors}</div>
      </Card>

      <Card className="p-4 flex flex-col justify-between">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Buscas RAG</span>
          <Users className="h-4 w-4 text-purple-500" />
        </div>
        <div className="text-2xl font-bold">{ragSearches}</div>
      </Card>

      <Card className="p-4 flex flex-col justify-between">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Precisão RAG</span>
          <ShoppingBag className="h-4 w-4 text-green-500" />
        </div>
        <div className="text-2xl font-bold">{ragHitRate}</div>
      </Card>
    </div>
  )
}
