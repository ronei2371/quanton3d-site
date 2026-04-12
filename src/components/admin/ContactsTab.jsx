import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Check, Mail, Phone, Users, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'

const normalizeOrigin = (value) => {
  const raw = String(value || '').trim()
  const normalized = raw.toLowerCase()
  if (!normalized) return 'Outros'
  if (normalized.includes('insta')) return 'Instagram'
  if (normalized.includes('you')) return 'YouTube'
  if (normalized.includes('google')) return 'Google'
  if (normalized.includes('indica')) return 'Indicação'
  if (normalized.includes('cliente')) return 'Já sou cliente'
  if (normalized.includes('mercado livre') || normalized.includes('shopee') || normalized.includes('marketplace')) return 'Marketplace'
  return raw
}

const formatDate = (value) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString('pt-BR')
}

const toDateInput = (value) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

export function ContactsTab({ buildAdminUrl, isVisible, onCountChange, refreshKey, adminToken, onContactsChange }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(buildAdminUrl('/clients'), {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      })
      const data = await response.json()
      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Erro ao carregar clientes')
      }
      const list = Array.isArray(data.clients) ? data.clients : []
      setClients(list)
      onCountChange?.(list.length)
      onContactsChange?.(list)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast.error(error.message || 'Erro ao carregar clientes')
      setClients([])
      onCountChange?.(0)
      onContactsChange?.([])
    } finally {
      setLoading(false)
    }
  }, [adminToken, buildAdminUrl, onContactsChange, onCountChange])

  useEffect(() => {
    loadClients()
  }, [loadClients, refreshKey])

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const origin = normalizeOrigin(client.origin || client.howDidYouHear)
      const haystack = [client.name, client.email, client.phone, origin, client.howDidYouHear]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase())
      const matchesDate = !dateFilter || toDateInput(client.createdAt) === dateFilter
      return matchesSearch && matchesDate
    })
  }, [clients, dateFilter, search])

  const stats = useMemo(() => {
    const summary = {
      Instagram: 0,
      YouTube: 0,
      Google: 0,
      Outros: 0
    }
    for (const client of clients) {
      const origin = normalizeOrigin(client.origin || client.howDidYouHear)
      if (origin === 'Instagram') summary.Instagram += 1
      else if (origin === 'YouTube') summary.YouTube += 1
      else if (origin === 'Google') summary.Google += 1
      else summary.Outros += 1
    }
    return summary
  }, [clients])

  if (!isVisible) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-pink-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Instagram</p>
          <p className="text-3xl font-bold mt-2">{stats.Instagram}</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-red-500 to-red-700 text-white">
          <p className="text-sm opacity-90">YouTube</p>
          <p className="text-3xl font-bold mt-2">{stats.YouTube}</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-blue-500 to-green-500 text-white">
          <p className="text-sm opacity-90">Google</p>
          <p className="text-3xl font-bold mt-2">{stats.Google}</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-indigo-500 to-purple-700 text-white">
          <p className="text-sm opacity-90">Outros</p>
          <p className="text-3xl font-bold mt-2">{stats.Outros}</p>
        </Card>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5" /> Clientes cadastrados
            </h3>
            <p className="text-sm text-gray-500">Nome, contato, origem e data de cadastro.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, e-mail, telefone ou origem"
              className="md:w-80"
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="md:w-48"
            />
            <Button variant="outline" onClick={loadClients} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <Card className="p-10 text-center bg-gray-50">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600">Nenhum cliente encontrado para este filtro.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => {
              const digits = String(client.phone || '').replace(/\D/g, '')
              const origin = normalizeOrigin(client.origin || client.howDidYouHear)
              return (
                <Card key={client.id} className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">{client.name || 'Cliente'}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</span>}
                        {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>}
                      </div>
                      <p className="text-sm"><strong>Como conheceu:</strong> {origin}</p>
                      <p className="text-sm text-gray-500"><strong>Data:</strong> {formatDate(client.createdAt)}</p>
                      {client.sourceLabel && <p className="text-xs text-gray-500">Origem do registro: {client.sourceLabel}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {digits && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => window.open(`https://wa.me/55${digits}`, '_blank')}
                        >
                          <Phone className="h-4 w-4 mr-2" /> WhatsApp
                        </Button>
                      )}
                      {client.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`mailto:${client.email}`, '_blank')}
                        >
                          <Mail className="h-4 w-4 mr-2" /> E-mail
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
