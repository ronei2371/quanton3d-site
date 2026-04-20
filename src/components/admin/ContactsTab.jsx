import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Calendar, RefreshCw, Search } from 'lucide-react'

const normalizeOrigin = (value = '') => {
  const normalized = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  if (!normalized) return 'Outros'
  if (normalized.includes('instagram')) return 'Instagram'
  if (normalized.includes('youtube')) return 'YouTube'
  if (normalized.includes('google')) return 'Google / Pesquisa'
  if (normalized.includes('indic')) return 'Indicação de amigo'
  if (
    normalized.includes('mercado livre') ||
    normalized.includes('shopee') ||
    normalized.includes('marketplace')
  ) {
    return 'Mercado Livre / Shopee'
  }
  if (normalized.includes('ja sou cliente')) return 'Já sou cliente'
  return 'Outros'
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR')
}

const extractItems = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.contacts)) return data.contacts
  if (Array.isArray(data?.items)) return data.items
  return []
}

const normalizeContact = (item) => ({
  id: item?.id || item?._id || `${item?.email || ''}-${item?.phone || ''}-${item?.createdAt || ''}`,
  name: item?.name || item?.fullName || 'Sem nome',
  phone: item?.phone || item?.telefone || item?.whatsapp || '',
  email: item?.email || '',
  origin: normalizeOrigin(item?.origin || item?.source || item?.comoConheceu || ''),
  createdAt: item?.createdAt || item?.date || item?.updatedAt || null,
})

export function ContactsTab({
  isVisible = true,
  adminToken = '',
  buildAdminUrl,
  onCountChange,
  onContactsChange,
  refreshKey = 0,
}) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')

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

  const loadContacts = useCallback(async () => {
    if (!isVisible) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(buildAdminUrl('/contacts'), {
        headers: authHeaders(),
        cache: 'no-store',
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao carregar contatos')
      }

      const items = extractItems(data)
        .map(normalizeContact)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

      setContacts(items)
      onCountChange?.(items.length)
      onContactsChange?.(items)
    } catch (err) {
      console.error('[ContactsTab] Erro ao carregar contatos:', err)
      setError(err?.message || 'Erro ao carregar contatos')
      setContacts([])
      onCountChange?.(0)
      onContactsChange?.([])
    } finally {
      setLoading(false)
    }
  }, [authHeaders, buildAdminUrl, isVisible, onContactsChange, onCountChange])

  useEffect(() => {
    loadContacts()
  }, [loadContacts, refreshKey])

  const filteredContacts = useMemo(() => {
    return contacts.filter((item) => {
      const text = `${item.name} ${item.phone} ${item.email} ${item.origin}`
        .toLowerCase()
        .trim()

      const searchOk = search.trim()
        ? text.includes(search.trim().toLowerCase())
        : true

      const dateOk = (() => {
        if (!dateFilter) return true
        if (!item.createdAt) return false
        const date = new Date(item.createdAt)
        if (Number.isNaN(date.getTime())) return false
        const iso = date.toISOString().slice(0, 10)
        return iso === dateFilter
      })()

      return searchOk && dateOk
    })
  }, [contacts, dateFilter, search])

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-bold">Histórico de entradas</h3>
            <p className="text-sm text-gray-500 mt-1">
              Cada novo cadastro gera uma entrada com data e origem.
            </p>
          </div>

          <Button variant="outline" onClick={loadContacts} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50 text-red-700">
          {error}
        </Card>
      )}

      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar nome, contato ou origem"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="relative md:w-[160px]">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Carregando contatos...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Nenhum contato encontrado para este filtro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Nome</th>
                  <th className="pb-3 font-medium">Contato</th>
                  <th className="pb-3 font-medium">Como conheceu</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-4 pr-4 font-medium">{item.name}</td>
                    <td className="py-4 pr-4">
                      <div>{item.phone || '-'}</div>
                      <div className="text-xs text-gray-500">{item.email || '-'}</div>
                    </td>
                    <td className="py-4 pr-4">{item.origin}</td>
                    <td className="py-4">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}