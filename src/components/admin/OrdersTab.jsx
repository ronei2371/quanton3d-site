import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Loader2, Mail, Phone, ShoppingBag, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

const getOrderId = (order) => order?._id || order?.id

const getStatusLabel = (status) => {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'resolved' || normalized === 'completed' || normalized === 'delivered') return 'Resolvido'
  if (normalized === 'in_progress' || normalized === 'processing' || normalized === 'production') return 'Em andamento'
  return 'Pendente'
}

const getStatusTone = (status) => {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'resolved' || normalized === 'completed' || normalized === 'delivered') return 'bg-green-100 text-green-800'
  if (normalized === 'in_progress' || normalized === 'processing' || normalized === 'production') return 'bg-blue-100 text-blue-800'
  return 'bg-yellow-100 text-yellow-800'
}

const normalizeFormulationAsOrder = (item = {}) => ({
  id: item.id || item._id,
  customerName: item.name,
  name: item.name,
  phone: item.phone,
  email: item.email,
  notes: [
    item.desiredFeature ? `Característica: ${item.desiredFeature}` : '',
    item.color ? `Cor desejada: ${item.color}` : '',
    item.details ? `Detalhes: ${item.details}` : ''
  ].filter(Boolean).join('\n\n'),
  status: item.status || 'pending',
  createdAt: item.createdAt
})

export function OrdersTab({ buildAdminUrl, isVisible, onCountChange, refreshKey, adminToken }) {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [sourceMode, setSourceMode] = useState('orders')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const primary = await fetch(buildAdminUrl('/orders'), {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      })

      if (primary.ok) {
        const data = await primary.json().catch(() => ({}))
        const fetchedOrders = data.orders || []
        setOrders(fetchedOrders)
        setSourceMode('orders')
        onCountChange?.(fetchedOrders.filter((item) => !['resolved', 'completed', 'delivered'].includes((item.status || '').toLowerCase())).length)
        setLoading(false)
        return
      }

      const fallback = await fetch(buildAdminUrl('/formulations'), {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      })
      const fallbackData = await fallback.json().catch(() => ({}))
      if (!fallback.ok || fallbackData.success === false) {
        throw new Error(fallbackData?.error || 'Não foi possível carregar pedidos')
      }

      const normalized = (fallbackData.formulations || []).map(normalizeFormulationAsOrder)
      setOrders(normalized)
      setSourceMode('formulations')
      onCountChange?.(normalized.filter((item) => !['resolved', 'completed', 'delivered'].includes((item.status || '').toLowerCase())).length)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      toast.error('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }, [adminToken, buildAdminUrl, onCountChange])

  useEffect(() => {
    if (!isVisible) return
    loadOrders()
  }, [isVisible, loadOrders, refreshKey])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = (order.status || '').toLowerCase()
      const rawDate = order.createdAt || order.updatedAt
      const parsed = rawDate ? new Date(rawDate) : null
      const iso = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : ''
      const statusOk = statusFilter === 'all' ? true : status === statusFilter
      const dateOk = dateFilter ? iso === dateFilter : true
      return statusOk && dateOk
    })
  }, [dateFilter, orders, statusFilter])

  const updateOrderStatus = useCallback(async (order, nextStatus) => {
    const orderId = getOrderId(order)
    if (!orderId) {
      toast.error('Pedido inválido')
      return
    }

    setUpdatingOrderId(orderId)
    try {
      const route = sourceMode === 'formulations' ? `/formulations/${orderId}` : `/orders/${orderId}`
      const response = await fetch(buildAdminUrl(route), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({ status: nextStatus })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Não foi possível atualizar o status')
      }

      setOrders((prev) => prev.map((item) => (getOrderId(item) === orderId ? { ...item, status: nextStatus } : item)))
      toast.success('Status atualizado')
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error)
      toast.error(error.message || 'Erro ao atualizar pedido')
    } finally {
      setUpdatingOrderId(null)
    }
  }, [adminToken, buildAdminUrl, sourceMode])

  return (
    <div className={`space-y-4 ${isVisible ? '' : 'hidden'}`}>
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Pedidos Recebidos
            </h3>
            <p className="text-sm text-gray-600">Exibindo formulações customizadas enquanto a rota de pedidos não está disponível.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="p-2 border rounded-lg bg-white text-sm"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em andamento</option>
              <option value="resolved">Resolvido</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="p-2 border rounded-lg bg-white text-sm"
            />
            <Button variant="outline" onClick={loadOrders} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Recarregar
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-blue-600">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando pedidos...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          Nenhum pedido encontrado para este filtro.
        </Card>
      ) : (
        filteredOrders.map((order) => {
          const orderId = getOrderId(order)
          const createdAt = order.createdAt ? new Date(order.createdAt) : null
          const isUpdating = updatingOrderId === orderId

          return (
            <Card key={orderId} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <p className="font-semibold text-lg">{order.customerName || order.name || 'Cliente'}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    {order.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{order.phone}</span>}
                    {order.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{order.email}</span>}
                    {createdAt && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{createdAt.toLocaleString('pt-BR')}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${getStatusTone(order.status)} px-3 py-1 text-xs font-semibold`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                  <select
                    value={(order.status || 'pending').toLowerCase()}
                    onChange={(e) => updateOrderStatus(order, e.target.value)}
                    disabled={isUpdating}
                    className="p-2 border rounded-lg bg-white text-sm"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="resolved">Resolvido</option>
                  </select>
                </div>
              </div>

              {order.notes && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">OBSERVAÇÕES</p>
                  <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {order.phone && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(`https://wa.me/55${String(order.phone).replace(/\D/g, '')}`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                {order.email && (
                  <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${order.email}`)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}
