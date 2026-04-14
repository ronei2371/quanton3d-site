import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Ban, Phone, Trash2, RefreshCw, Search, CalendarDays, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

const ORIGIN_CARDS = [
  { key: 'instagram', label: 'Instagram', icon: '📱', gradient: 'from-pink-500 to-purple-600' },
  { key: 'youtube', label: 'YouTube', icon: '🎥', gradient: 'from-red-500 to-red-700' },
  { key: 'google', label: 'Google / Pesquisa', icon: '🔎', gradient: 'from-sky-500 to-emerald-500' },
  { key: 'indicacao', label: 'Indicação de amigo', icon: '🤝', gradient: 'from-amber-500 to-orange-600' },
  { key: 'marketplace', label: 'Mercado Livre / Shopee', icon: '🛒', gradient: 'from-orange-500 to-yellow-600' },
  { key: 'cliente', label: 'Já sou cliente', icon: '💙', gradient: 'from-indigo-500 to-violet-700' },
  { key: 'outros', label: 'Outros', icon: '🌐', gradient: 'from-cyan-500 to-blue-700' }
]

const normalizeText = (value = '') => value.toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const normalizeOriginKey = (value = '') => {
  const normalized = normalizeText(value)
  if (!normalized) return 'outros'
  if (normalized.includes('instagram')) return 'instagram'
  if (normalized.includes('youtube')) return 'youtube'
  if (normalized.includes('google')) return 'google'
  if (normalized.includes('indic')) return 'indicacao'
  if (normalized.includes('mercado livre') || normalized.includes('shopee') || normalized.includes('marketplace')) return 'marketplace'
  if (normalized.includes('ja sou cliente')) return 'cliente'
  return 'outros'
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR')
}

const matchesDate = (value, selectedDate) => {
  if (!selectedDate) return true
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const iso = date.toISOString().slice(0, 10)
  return iso === selectedDate
}

export function ContactsTab({ buildAdminUrl, isVisible, onCountChange, onContactsChange, refreshKey, adminToken }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  const loadContacts = useCallback(async () => {
    if (!isVisible) return
    setLoading(true)
    try {
      const response = await fetch(buildAdminUrl('/contacts'), {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      })
      const data = await response.json().catch(() => ({}))
      const items = data.contacts || []
      setContacts(items)
      onCountChange?.(items.length)
      onContactsChange?.(items)
    } catch (error) {
      console.error('Erro ao carregar clientes cadastrados:', error)
      toast.error('Erro ao carregar clientes cadastrados')
    } finally {
      setLoading(false)
    }
  }, [adminToken, buildAdminUrl, isVisible, onCountChange, onContactsChange])

  useEffect(() => {
    loadContacts()
  }, [loadContacts, refreshKey])

  const filteredContacts = useMemo(() => {
    const term = normalizeText(search)
    return contacts.filter((contact) => {
      const haystack = [contact.name, contact.phone, contact.email, contact.origin].map(normalizeText).join(' ')
      return (!term || haystack.includes(term)) && matchesDate(contact.createdAt, selectedDate)
    })
  }, [contacts, search, selectedDate])

  const metrics = useMemo(() => {
    const summary = Object.fromEntries(ORIGIN_CARDS.map((item) => [item.key, 0]))
    contacts.forEach((contact) => {
      summary[normalizeOriginKey(contact.origin)] += 1
    })
    return summary
  }, [contacts])

  const updateContact = async (contactId, payload, successMessage) => {
    try {
      const response = await fetch(buildAdminUrl(`/contacts/${contactId}/block`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify(payload)
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Falha ao atualizar contato')
      }
      toast.success(successMessage)
      loadContacts()
    } catch (error) {
      console.error('Erro ao atualizar contato:', error)
      toast.error(error.message || 'Falha ao atualizar contato')
    }
  }

  const deleteContact = async (contactId) => {
    if (!window.confirm('Deseja excluir este cadastro?')) return
    try {
      const response = await fetch(buildAdminUrl(`/contacts/${contactId}`), {
        method: 'DELETE',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Falha ao excluir cadastro')
      }
      toast.success('Cadastro excluído com sucesso')
      loadContacts()
    } catch (error) {
      console.error('Erro ao excluir contato:', error)
      toast.error(error.message || 'Falha ao excluir cadastro')
    }
  }

  return (
    <div className={isVisible ? 'space-y-6' : 'hidden'}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">Origem dos Clientes</h3>
        <Button size="sm" variant="outline" onClick={loadContacts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {ORIGIN_CARDS.map((card) => (
          <Card key={card.key} className={`p-6 bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">{card.icon} {card.label}</span>
            </div>
            <div className="text-4xl font-bold">{metrics[card.key] || 0}</div>
            <p className="text-xs mt-2 opacity-80">Total de clientes</p>
          </Card>
        ))}
      </div>

      <Card className="p-5 space-y-4">
        <div>
          <h4 className="text-2xl font-bold">Clientes cadastrados</h4>
          <p className="text-sm text-gray-500">Nome, data e como conheceu a Quanton3D.</p>
        </div>

        <div className="grid md:grid-cols-[1fr_180px] gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nome, contato ou origem"
              className="w-full rounded-lg border bg-white px-10 py-3"
            />
          </div>
          <div className="relative">
            <CalendarDays className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-3"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 pr-4">Nome</th>
                <th className="py-3 pr-4">Contato</th>
                <th className="py-3 pr-4">Como conheceu</th>
                <th className="py-3 pr-4">Data</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500">Nenhum cadastro encontrado.</td>
                </tr>
              ) : filteredContacts.map((contact) => (
                <tr key={contact.id} className={`border-b last:border-0 ${contact.blocked ? 'opacity-60' : ''}`}>
                  <td className="py-3 pr-4 font-medium">{contact.name || '-'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span>{contact.phone || '-'}</span>
                      {contact.email && <span className="text-xs text-gray-500">{contact.email}</span>}
                    </div>
                  </td>
                  <td className="py-3 pr-4">{contact.origin || 'Outros'}</td>
                  <td className="py-3 pr-4">{formatDate(contact.createdAt)}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${contact.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {contact.blocked ? 'Bloqueado' : 'Ativo'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      {contact.phone && (
                        <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/55${String(contact.phone).replace(/\D/g, '')}`, '_blank')}>
                          <Phone className="h-4 w-4 mr-1" /> WhatsApp
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className={contact.blocked ? 'border-green-200 text-green-700' : 'border-amber-200 text-amber-700'}
                        onClick={() => updateContact(contact.id, { blocked: !contact.blocked }, contact.blocked ? 'Cadastro desbloqueado' : 'Cadastro bloqueado')}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        {contact.blocked ? 'Desbloquear' : 'Bloquear'}
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-700" onClick={() => deleteContact(contact.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
