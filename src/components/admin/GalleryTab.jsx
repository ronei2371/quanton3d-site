import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Camera, RefreshCw, AlertTriangle, Loader2, Image as ImageIcon, Check, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

const formatDate = (value) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString('pt-BR')
}

const settingsRows = (settings = {}) => {
  return [
    ['Altura de camada', settings.layerHeight],
    ['Exposição normal', settings.exposureNormal],
    ['Exposição base', settings.exposureBase],
    ['Camadas base', settings.baseLayers]
  ].filter(([, value]) => value !== null && value !== undefined && value !== '')
}

function GalleryEntryCard({ entry, isAdmin, onApprove, onDelete, busyId }) {
  const rows = settingsRows(entry.settings)
  const isBusy = busyId === entry.id
  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt={entry.resin || 'Foto enviada'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="space-y-1 text-sm">
        <p className="font-semibold text-base">{entry.name || 'Cliente'}</p>
        <p><strong>Contato:</strong> {entry.contact || 'Não informado'}</p>
        <p><strong>Resina:</strong> {entry.resin || '—'}</p>
        <p><strong>Impressora:</strong> {entry.printer || '—'}</p>
        <p><strong>Enviado em:</strong> {formatDate(entry.createdAt)}</p>
        <p><strong>Exibir para outros clientes:</strong> {entry.allowPublic === false ? 'Não' : 'Sim'}</p>
        {entry.note && <p><strong>Observações:</strong> {entry.note}</p>}
      </div>

      {rows.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
          <p className="font-semibold text-gray-700">Parâmetros usados</p>
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="flex gap-2 mt-auto">
          {entry.status !== 'approved' && (
            <Button className="flex-1 bg-green-600 hover:bg-green-700" size="sm" onClick={() => onApprove(entry)} disabled={isBusy}>
              <Check className="h-4 w-4 mr-2" /> Aprovar
            </Button>
          )}
          <Button variant="outline" className="flex-1" size="sm" onClick={() => onDelete(entry)} disabled={isBusy}>
            <Trash2 className="h-4 w-4 mr-2" /> Excluir
          </Button>
        </div>
      )}
    </Card>
  )
}

export function GalleryTab({
  isAdmin,
  isVisible,
  adminToken,
  buildAdminUrl,
  onPendingCountChange,
  refreshKey = 0,
  onUnauthorized
}) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState('')

  const loadEntries = useCallback(async () => {
    if (!isVisible) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(buildAdminUrl('/gallery/all', { limit: 12 }), {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
        cache: 'no-store'
      })
      if (response.status === 401) {
        onUnauthorized?.()
        setLoading(false)
        return
      }
      const data = await response.json()
      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Não foi possível carregar a galeria')
      }
      const list = Array.isArray(data.entries) ? data.entries : Array.isArray(data.images) ? data.images : []
      setEntries(list)
      onPendingCountChange?.(list.filter((item) => (item.status || '').toLowerCase() !== 'approved').length)
    } catch (err) {
      console.error('Erro ao carregar galeria:', err)
      setError(err.message || 'Não foi possível carregar as fotos enviadas pelos clientes.')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [adminToken, buildAdminUrl, isVisible, onPendingCountChange, onUnauthorized])

  useEffect(() => {
    loadEntries()
  }, [loadEntries, refreshKey])

  const pendingEntries = useMemo(
    () => entries.filter((item) => (item.status || '').toLowerCase() !== 'approved'),
    [entries]
  )
  const approvedEntries = useMemo(
    () => entries.filter((item) => (item.status || '').toLowerCase() === 'approved'),
    [entries]
  )

  const handleApprove = async (entry) => {
    setBusyId(entry.id)
    try {
      const response = await fetch(buildAdminUrl(`/gallery/${entry.id}/approve`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({ allowPublic: entry.allowPublic !== false })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Não foi possível aprovar o item')
      }
      toast.success('Item aprovado com sucesso')
      await loadEntries()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Erro ao aprovar item')
    } finally {
      setBusyId('')
    }
  }

  const handleDelete = async (entry) => {
    if (!window.confirm(`Deseja excluir o envio de ${entry.name || 'Cliente'}?`)) return
    setBusyId(entry.id)
    try {
      const response = await fetch(buildAdminUrl(`/gallery/${entry.id}`), {
        method: 'DELETE',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Não foi possível excluir o item')
      }
      toast.success('Item removido com sucesso')
      await loadEntries()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Erro ao excluir item')
    } finally {
      setBusyId('')
    }
  }

  if (!isVisible) return null

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <h3 className="font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Erro ao carregar galeria
        </h3>
        <p className="mt-2 text-sm">{error}</p>
        <Button onClick={loadEntries} variant="outline" className="mt-4 bg-white">
          <RefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Camera className="h-6 w-6 text-blue-600" />
          Galeria de configurações enviadas
        </h2>
        <Button onClick={loadEntries} disabled={loading} size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-3" />
          <p>Buscando envios da galeria...</p>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-bold">Pendentes ({pendingEntries.length})</h3>
            </div>
            {pendingEntries.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">Nenhum envio pendente no momento.</Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pendingEntries.map((entry) => (
                  <GalleryEntryCard key={entry.id} entry={entry} isAdmin={isAdmin} onApprove={handleApprove} onDelete={handleDelete} busyId={busyId} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-bold">Aprovadas ({approvedEntries.length})</h3>
            </div>
            {approvedEntries.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">Nenhum envio aprovado ainda.</Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {approvedEntries.map((entry) => (
                  <GalleryEntryCard key={entry.id} entry={entry} isAdmin={isAdmin} onApprove={handleApprove} onDelete={handleDelete} busyId={busyId} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
