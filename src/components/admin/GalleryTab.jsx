import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Camera, RefreshCw, AlertTriangle, Loader2, Image as ImageIcon } from 'lucide-react'

const FALLBACK_API_BASE = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '')

const formatSettings = (settings = {}) => {
  const entries = Object.entries(settings || {}).filter(([_, value]) => value !== null && value !== undefined && value !== '')
  if (!entries.length) return null
  return entries.map(([key, value]) => ({ key, value }))
}

export function GalleryTab({
  isAdmin,
  isVisible,
  adminToken,
  buildAdminUrl,
  onPendingCountChange,
  refreshKey = 0,
  onUnauthorized,
  apiBaseUrl
}) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const manualBase = useMemo(() => {
    if (buildAdminUrl) return null
    const fromProp = apiBaseUrl?.replace(/\/$/, '')
    return fromProp || FALLBACK_API_BASE
  }, [apiBaseUrl, buildAdminUrl])

  const resolveUrl = useCallback((path, params = {}) => {
    if (buildAdminUrl) {
      return buildAdminUrl(path, params)
    }
    const finalPath = path.startsWith('/') ? path : `/${path}`
    const url = new URL(finalPath, `${manualBase}/`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
    return url.toString()
  }, [buildAdminUrl, manualBase])

  const loadEntries = useCallback(async () => {
    if (!isVisible) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(resolveUrl('/api/gallery/all', { limit: 100 }), {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      })
      if (response.status === 401) {
        onUnauthorized?.()
        setLoading(false)
        return
      }
      const data = await response.json()
      const list = data.images || data.entries || []
      setEntries(list)
      onPendingCountChange?.(list.filter((item) => (item.status || '').toLowerCase() !== 'approved').length)
    } catch (err) {
      console.error('Erro ao carregar galeria:', err)
      setError('Não foi possível carregar as fotos enviadas pelos clientes.')
    } finally {
      setLoading(false)
    }
  }, [adminToken, isVisible, onPendingCountChange, onUnauthorized, resolveUrl])

  useEffect(() => {
    loadEntries()
  }, [loadEntries, refreshKey])

  if (!isVisible) {
    return null
  }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Camera className="h-6 w-6 text-blue-600" />
          Entradas enviadas por clientes ({entries.length})
        </h2>
        <Button onClick={loadEntries} disabled={loading} size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-3" />
          <p>Buscando fotos enviadas pelos clientes...</p>
        </div>
      ) : entries.length === 0 ? (
        <Card className="p-10 text-center bg-gray-50 flex flex-col items-center gap-3">
          <ImageIcon className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Nenhuma configuração compartilhada ainda.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => {
            const firstImage = Array.isArray(entry.images) ? entry.images[0] : entry.imageUrl
            const settings = formatSettings(entry.settings)

            return (
              <Card key={entry.id || entry._id} className="p-4 flex flex-col gap-3">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {firstImage ? (
                    <img src={firstImage} alt={entry.resin || 'Foto enviada'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Resina / Impressora</p>
                  <p className="font-semibold">{entry.resin || '—'} • {entry.printer || '—'}</p>
                  {entry.name && <p className="text-gray-600">Cliente: {entry.name}</p>}
                  {entry.note && <p className="text-gray-600">Nota: {entry.note}</p>}
                  <p className="text-xs text-gray-500">Status: {entry.status || 'pending'}</p>
                </div>

                {settings && (
                  <div className="bg-gray-50 rounded-lg p-3 text-xs">
                    <p className="font-semibold text-gray-600 mb-2">Parâmetros informados</p>
                    <dl className="space-y-1">
                      {settings.map(({ key, value }) => (
                        <div key={key} className="flex justify-between gap-2">
                          <dt className="text-gray-500 capitalize">{key}</dt>
                          <dd className="text-gray-800 font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {Array.isArray(entry.images) && entry.images.length > 1 && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer text-blue-600">Ver todas as imagens ({entry.images.length})</summary>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {entry.images.map((imageUrl, index) => (
                        <img key={index} src={imageUrl} alt={`Extra ${index + 1}`} className="w-full h-16 object-cover rounded" />
                      ))}
                    </div>
                  </details>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
