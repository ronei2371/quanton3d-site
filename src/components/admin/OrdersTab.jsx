import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Check, Clock, Loader2, Mail, Phone, ShoppingBag, X } from 'lucide-react'
import { toast } from 'sonner'

const getOrderId = (order) => order?._id || order?.id

const getStatusLabel = (status) => {
  const normalized = (status || '').toLowerCase()

  switch (normalized) {
    case 'pending':
      return 'Pendente'
    case 'processing':
    case 'in_progress':
    case 'production':
      return 'Em Produção'
    case 'approved':
      return 'Aprovado'
    case 'shipped':
      return 'Enviado'
    case 'delivered':
    case 'completed':
      return 'Concluído'
    case 'cancelled':
    case 'canceled':
      return 'Cancelado'
    default:
      return status || 'Sem status'
  }
}

const getStatusTone = (status) => {
  const normalized = (status || '').toLowerCase()

  if (normalized === 'pending' || normalized === 'approved') return 'bg-yellow-100 text-yellow-800'
  if (['processing', 'in_progress', 'production', 'shipped'].includes(normalized)) return 'bg-blue-100 text-blue-800'
  if (['delivered', 'completed'].includes(normalized)) return 'bg-green-100 text-green-800'
  if (['cancelled', 'canceled', 'rejected'].includes(normalized)) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

export function OrdersTab({ buildAdminUrl, isAdmin, isVisible, onCountChange, refreshKey }) {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(buildAdminUrl('/orders'))
      const data = await response.json()
      const fetchedOrders = data.orders || []
      setOrders(fetchedOrders)

      const pendingCount = fetchedOrders.filter((order) => {
        const status = (order.status || '').toLowerCase()
        return status !== 'completed' && status !== 'delivered' && status !== 'cancelled' && status !== 'canceled'
      }).length

      onCountChange?.(pendingCount)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      toast.error('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }, [buildAdminUrl, onCountChange])

  useEffect(() => {
    loadOrders()
  }, [loadOrders, refreshKey])

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders
    return orders.filter((order) => (order.status || '').toLowerCase() === statusFilter)
  }, [orders, statusFilter])

  const availableStatuses = useMemo(() => {
    const defaultStatuses = ['pending', 'processing', 'in_progress', 'production', 'approved', 'shipped', 'delivered', 'completed', 'cancelled']
    const fromOrders = orders
      .map((order) => (order.status || '').toLowerCase())
      .filter(Boolean)
    return Array.from(new Set([...defaultStatuses, ...fromOrders]))
  }, [orders])

  const updateOrderStatus = useCallback(async (order, nextStatus) => {
    const orderId = getOrderId(order)
    if (!orderId) {
      toast.error('Pedido inválido')
      return
    }

    setUpdatingOrderId(orderId)
    try {
      const response = await fetch(buildAdminUrl(`/orders/${orderId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })

      const data = await response.json()

      if (data.success) {
        setOrders((prev) => prev.map((item) => (getOrderId(item) === orderId ? { ...item, status: nextStatus } : item)))
        toast.success('Status do pedido atualizado!')
        return
      }

      toast.error('Erro ao atualizar pedido: ' + (data.error || data.message || ''))
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error)
      toast.error('Erro ao atualizar pedido')
    } finally {
      setUpdatingOrderId(null)
    }
  }, [buildAdminUrl])

  const cancelOrder = useCallback(async (order) => {
    await updateOrderStatus(order, 'cancelled')
  }, [updateOrderStatus])

  const markCompleted = useCallback(async (order) => {
    await updateOrderStatus(order, 'completed')
  }, [updateOrderStatus])

  return (
    <div className={`space-y-4 ${isVisible ? '' : 'hidden'}`}>
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Pedidos Recebidos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Acompanhe o status dos pedidos enviados pelos clientes.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">Todos os status</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={loadOrders} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Recarregar'
              )}
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
        <Card className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Nenhum pedido encontrado para este filtro.</p>
        </Card>
      ) : (
        filteredOrders.map((order) => {
          const orderId = getOrderId(order)
          const isUpdating = updatingOrderId === orderId
          const createdAt = order.createdAt ? new Date(order.createdAt) : null

          return (
            <Card key={orderId} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <p className="font-semibold text-lg">{order.customerName || order.name || 'Cliente'}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    {order.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {order.phone}
                      </span>
                    )}
                    {order.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {order.email}
                      </span>
                    )}
                    {createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {createdAt.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={`${getStatusTone(order.status)} px-3 py-1 text-xs font-semibold`}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>

              {order.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">OBSERVAÇÕES</p>
                  <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}

              {Array.isArray(order.items) && order.items.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">ITENS</p>
                  <div className="grid gap-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.name || item.description || `Item ${index + 1}`}</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {item.quantity ? `${item.quantity}x` : ''} {item.price ? `• R$ ${Number(item.price).toFixed(2)}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {order.phone && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(`https://wa.me/55${order.phone.replace(/\D/g, '')}?text=Olá ${order.customerName || order.name}, estamos atualizando seu pedido.`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                {order.email && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`mailto:${order.email}?subject=Atualização do pedido&body=Olá ${order.customerName || order.name || ''},%0A%0AEstamos acompanhando seu pedido.`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => updateOrderStatus(order, 'in_progress')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Atualizando...' : 'Em produção'}
                </Button>

                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isUpdating}
                  onClick={() => updateOrderStatus(order, 'approved')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Atualizando...' : 'Aprovar'}
                </Button>

                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isUpdating}
                  onClick={() => markCompleted(order)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Atualizando...' : 'Concluir'}
                </Button>

                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    disabled={isUpdating}
                    onClick={() => cancelOrder(order)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Atualizando...' : 'Cancelar'}
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
