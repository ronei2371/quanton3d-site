import { Card } from '@/components/ui/card.jsx'
import { useAdminMetrics } from '@/hooks/use-admin-metrics.js'
import { Activity, Loader2, MessageSquare, Users } from 'lucide-react'

export function AdminDashboardMetricsExample({ apiToken }) {
  const { metrics, isLoading, error } = useAdminMetrics(apiToken)

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Carregando métricas do dashboard...</span>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-600 dark:text-red-400">
          Não foi possível carregar as métricas. Verifique o token e tente novamente.
        </p>
      </Card>
    )
  }

  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-5 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">Conversas</p>
          <MessageSquare className="h-4 w-4 text-blue-500" />
        </div>
        <p className="text-3xl font-semibold text-blue-700 dark:text-blue-300">
          {metrics.conversations?.total ?? 0}
        </p>
        <p className="text-xs text-gray-500">Total registrado pelo bot</p>
      </Card>

      <Card className="p-5 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">Clientes cadastrados</p>
          <Users className="h-4 w-4 text-green-500" />
        </div>
        <p className="text-3xl font-semibold text-green-700 dark:text-green-300">
          {metrics.registrations?.total ?? 0}
        </p>
        <p className="text-xs text-gray-500">Contas únicas com registro</p>
      </Card>

      <Card className="p-5 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sessões únicas</p>
          <Activity className="h-4 w-4 text-purple-500" />
        </div>
        <p className="text-3xl font-semibold text-purple-700 dark:text-purple-300">
          {metrics.conversations?.uniqueSessions ?? 0}
        </p>
        <p className="text-xs text-gray-500">Visão rápida para o dashboard</p>
      </Card>
    </div>
  )
}
