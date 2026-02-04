import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useAdminMetrics(adminToken, { refreshKey = 0, enabled = true, buildAdminUrl } = {}) {
  const [metrics, setMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMetrics = useCallback(async () => {
    if (!enabled) return

    const resolvedToken = adminToken || import.meta.env.VITE_ADMIN_API_TOKEN || ''

    if (!resolvedToken) {
      const message = 'Token de autenticação do admin não foi informado.'
      setError(new Error(message))
      setMetrics(null)
      toast.error(message)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const metricsUrl = buildAdminUrl ? buildAdminUrl('/api/admin/metrics') : '/api/admin/metrics'
      const response = await fetch(metricsUrl, {
        headers: {
          Authorization: `Bearer ${resolvedToken}`,
        },
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const message =
          errorBody?.error || errorBody?.message || 'Não foi possível carregar as métricas do admin.'
        throw new Error(message)
      }

      const data = await response.json()
      setMetrics(data?.metrics ?? data ?? null)
    } catch (err) {
      console.error('Erro ao buscar métricas do admin:', err)
      setError(err)
      toast.error(err.message || 'Erro ao buscar métricas do admin')
      setMetrics(null)
    } finally {
      setIsLoading(false)
    }
  }, [adminToken, buildAdminUrl, enabled])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  useEffect(() => {
    if (refreshKey > 0) {
      fetchMetrics()
    }
  }, [refreshKey, fetchMetrics])

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
  }
}
