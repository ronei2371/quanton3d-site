import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Mail, Phone, RefreshCw, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_LABELS = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  resolved: 'Resolvido',
}

const normalizeStatus = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  if (
    normalized === 'resolved' ||
    normalized === 'completed' ||
    normalized === 'done' ||
    normalized === 'finalizado' ||
    normalized === 'resolvido'
  ) {
    return 'resolved'
  }

  if (
    normalized === 'in_progress' ||
    normalized === 'processing' ||
    normalized === 'em andamento' ||
    normalized === 'andamento'
  ) {
    return 'in_progress'
  }

  return 'pending'
}

const getStatusBadgeClass = (status) => {
  if (status === 'resolved') return 'bg-green-100 text-green-700 border-green-200'
  if (status === 'in_progress') return 'bg-blue-100 text-blue-700 border-blue-200'
  return 'bg-yellow-100 text-yellow-700 border-yellow-200'
}

const extractItems = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.orders)) return data.orders
  if (Array.isArray(data?.formulations)) return data.formulations
  if (Array.isArray(data?.requests)) return data.requests
  if (Array.isArray(data?.items)) return data.items
  return []
}

const toDigits = (value) => String(value || '').replace(/\D/g, '')

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR')
}

const normalizeOrder = (item, sourceHint = 'orders') => ({
  id: item?.id || item?._id || null,
  sourceHint,
  name: item?.name || item?.fullName || 'Cliente',
  phone: item?.phone || item?.telefone || item?.whatsapp || '',
  email: item?.email || '',
  status: normalizeStatus(item?.status),
  desiredFeature:
    item?.desiredFeature ||
    item?.caracteristica ||
    item?.feature ||
    item?.requestedFeature ||
    '',
  color: item?.color || item?.cor || item?.desiredColor || '',
  details:
    item?.details ||
    item?.complementos ||
    item?.description ||
    item?.observacoes ||
    item?.notes ||
    '',
  createdAt: item?.createdAt || item?.date || item?.updatedAt || null,
})

export function OrdersTab({
  isVisible = true,
  adminToken = '',
  buildAdminUrl,
  onCountChange,
  refreshKey = 0,
}) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [sourceMode, setSourceMode] = useState('orders')

  const authHeaders = useCallback(
    (extra = {}) => {
      if (!adminToken) return extra
      return {
        ...extra,
        Authorization: `Bearer ${adminToken}`,
      }
    },
    [adminToken]
  )

  const fetchEndpoint = useCallback(
    async (endpoint, sourceHint) => {
      const response = await fetch(buildAdminUrl(endpoint), {
        headers: authHeaders(),
        cache: 'no-store',
      })

      const data = await response.json().catch(() => ({}))

      return {
        ok: response.ok,
        status: response.status,
        items: extractItems(data).map((item) => normalizeOrder(item, sourceHint)),
        raw: data,
      }
    },
    [authHeaders, buildAdminUrl]
  )

  const loadOrders = useCallback(async () => {
    if (!isVisible) return

    setLoading(true)
    setError('')

    try {
      let items = []
      let currentMode = 'orders'

      const ordersResult = await fetchEndpoint('/orders', 'orders')

      if (ordersResult.ok && ordersResult.items.length > 0) {
        items = ordersResult.items
        currentMode = 'orders'
      } else {
        const formulationsResult = await fetchEndpoint('/formulations', 'formulations')

        if (formulationsResult.ok) {
          items = formulationsResult.items
          currentMode = 'formulations'
        } else if (!ordersResult.ok) {
          throw new Error(
            formulationsResult?.raw?.error ||
              ordersResult?.raw?.error ||
              'Não foi possível carregar pedidos'
          )
        }
      }

      setOrders(items)
      setSourceMode(currentMode)
      onCountChange?.(items.filter((item) => item.status === 'pending').length)
    } catch (err) {
      console.error('[OrdersTab] Erro ao carregar pedidos:', err)
      setError(err?.message || 'Erro ao carregar pedidos')
      setOrders([])
      onCountChange?.(0)
    } finally {
      setLoading(false)
    }
  }, [fetchEndpoint, isVisible, onCountChange])

  useEffect(() => {
    loadOrders()
  }, [loadOrders, refreshKey])

  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const text = `${item.name} ${item.phone} ${item.email} ${item.desiredFeature} ${item.color} ${item.details}`
        .toLowerCase()
        .trim()

      const searchOk = search.trim()
        ? text.includes(search.trim().toLowerCase())
        : true

      const statusOk = statusFilter === 'all' ? true : item.status === statusFilter

      const dateOk = (() => {
        if (!dateFilter) return true
        if (!item.createdAt) return false
        const date = new Date(item.createdAt)
        if (Number.isNaN(date.getTime())) return false
        const iso = date.toISOString().slice(0, 10)
        return iso === dateFilter
      })()

      return searchOk && statusOk && dateOk
    })
  }, [dateFilter, orders, search, statusFilter])

  const updateStatus = useCallback(
    async (item, nextStatus) => {
      if (!item?.id) {
        toast.error('Pedido inválido')
        return
      }

      setUpdatingId(item.id)

      try {
        const endpoints =
          item.sourceHint === 'formulations'
            ? [`/formulations/${item.id}`, `/orders/${item.id}`]
            : [`/orders/${item.id}`, `/formulations/${item.id}`]

        let updated = false
        let lastError = 'Não foi possível atualizar o status'

        for (const endpoint of endpoints) {
          const response = await fetch(buildAdminUrl(endpoint), {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ status: nextStatus }),
          })

          const data = await response.json().catch(() => ({}))

          if (response.ok && data?.success !== false) {
            updated = true
            break
          }

          if (data?.error) lastError = data.error
        }

        if (!updated) {
          throw new Error(lastError)
        }

        setOrders((prev) =>
          prev.map((current) =>
            current.id === item.id ? { ...current, status: nextStatus } : current
          )
        )

        toast.success('Status atualizado com sucesso')
      } catch (err) {
        console.error('[OrdersTab] Erro ao atualizar status:', err)
        toast.error(err?.message || 'Erro ao atualizar status')
      } finally {
        setUpdatingId(null)
      }
    },
    [authHeaders, buildAdminUrl]
  )

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Pedidos Recebidos
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {sourceMode === 'formulations'
                ? 'Exibindo pedidos a partir da base de formulações.'
                : 'Pedidos recebidos com status e filtros.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Buscar nome, contato ou pedido"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[240px]"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-gray-800"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="in_progress">Em andamento</option>
              <option value="resolved">Resolvidos</option>
            </select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[155px]"
            />

            <Button variant="outline" onClick={loadOrders} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50 text-red-700">
          {error}
        </Card>
      )}

      {loading ? (
        <Card className="p-8 text-center text-gray-500">Carregando pedidos...</Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          Nenhum pedido encontrado para este filtro.
        </Card>
      ) : (
        filteredOrders.map((item) => {
          const phoneDigits = toDigits(item.phone)

          return (
            <Card key={item.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div>
                    <h4 className="text-xl font-bold">{item.name || 'Cliente'}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      {item.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {item.phone}
                        </span>
                      )}

                      {item.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {item.email}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 text-sm">
                    <div>
                      <p className="font-semibold">Característica:</p>
                      <p className="text-gray-700">{item.desiredFeature || 'Não informado'}</p>
                    </div>

                    <div>
                      <p className="font-semibold">Cor desejada:</p>
                      <p className="text-gray-700">{item.color || 'Não informado'}</p>
                    </div>

                    <div>
                      <p className="font-semibold">Detalhes:</p>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {item.details || 'Não informado'}
                      </p>
                    </div>

                    {item.email && (
                      <p className="text-sm text-gray-500">Email: {item.email}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {phoneDigits && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(`https://wa.me/55${phoneDigits}`, '_blank')}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        WhatsApp
                      </Button>
                    )}

                    {item.email && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(`mailto:${item.email}`, '_blank')}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <Badge className={getStatusBadgeClass(item.status)}>
                    {STATUS_LABELS[item.status] || 'Pendente'}
                  </Badge>

                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item, e.target.value)}
                    disabled={updatingId === item.id}
                    className="h-10 min-w-[145px] rounded-md border bg-white px-3 text-sm dark:bg-gray-800"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="resolved">Resolvido</option>
                  </select>
                </div>
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}