import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Camera, Check, Edit3, Image, Loader2, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

export function GalleryTab({ isAdmin, isVisible, refreshKey, onPendingCountChange, buildUrl }) {
  const API_BASE_URL = useMemo(
    () => (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, ''),
    []
  )

  const buildGalleryUrl = useCallback(
    (path) => (buildUrl ? buildUrl(path) : new URL(path, `${API_BASE_URL}/`).toString()),
    [API_BASE_URL, buildUrl]
  )

  const [galleryEntries, setGalleryEntries] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [editingGalleryEntry, setEditingGalleryEntry] = useState(null)
  const [editGalleryData, setEditGalleryData] = useState({})
  const [savingGalleryEdit, setSavingGalleryEdit] = useState(false)

  const loadGalleryEntries = useCallback(async () => {
    setGalleryLoading(true)
    try {
      const response = await fetch(buildGalleryUrl('/api/gallery/all'))
      const data = await response.json()
      const entries = data.entries || []
      setGalleryEntries(entries)
      onPendingCountChange?.(entries.filter((entry) => entry.status === 'pending').length)
    } catch (error) {
      console.error('Erro ao carregar galeria:', error)
      toast.error('Erro ao carregar galeria')
    } finally {
      setGalleryLoading(false)
    }
  }, [buildGalleryUrl, onPendingCountChange])

  useEffect(() => {
    loadGalleryEntries()
  }, [isVisible, refreshKey, loadGalleryEntries])

  const approveGalleryEntry = async (id) => {
    try {
      const response = await fetch(buildGalleryUrl(`/api/gallery/${id}/approve`), {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.success) {
        loadGalleryEntries()
      } else {
        toast.error('Erro ao aprovar: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      toast.error('Erro ao aprovar foto')
    }
  }

  const rejectGalleryEntry = async (id) => {
    if (!isAdmin) {
      toast.warning('Seu nivel de acesso nao permite rejeitar/excluir dados.')
      return
    }
    if (!confirm('Tem certeza que deseja rejeitar esta foto? As imagens serao deletadas.')) return
    try {
      const response = await fetch(buildGalleryUrl(`/api/gallery/${id}/reject`), {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.success) {
        loadGalleryEntries()
      } else {
        toast.error('Erro ao rejeitar: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
      toast.error('Erro ao rejeitar foto')
    }
  }

  const openEditGallery = (entry) => {
    setEditingGalleryEntry(entry)
    const params = entry.params || {}
    const lowerLiftDist = params.lowerLiftDistance || {}
    const liftDist = params.liftDistance || {}
    const liftSpd = params.liftSpeed || {}
    const lowerRetractSpd = params.lowerRetractSpeed || {}
    const retractSpd = params.retractSpeed || {}

    setEditGalleryData({
      name: entry.name || '',
      resin: entry.resin || '',
      printer: entry.printer || '',
      comment: entry.comment || '',
      layerHeight: params.layerHeight || entry.layerHeight || '',
      baseLayers: params.baseLayers || entry.baseLayers || '',
      exposureTime: params.exposureTime || entry.exposureTime || '',
      baseExposureTime: params.baseExposureTime || entry.baseExposureTime || '',
      transitionLayers: params.transitionLayers || entry.transitionLayers || '',
      uvOffDelay: params.uvOffDelay || entry.uvOffDelay || '',
      lowerLiftDistance1: lowerLiftDist.value1 || entry.lowerLiftDistance1 || '',
      lowerLiftDistance2: lowerLiftDist.value2 || entry.lowerLiftDistance2 || '',
      liftDistance1: liftDist.value1 || entry.liftDistance1 || '',
      liftDistance2: liftDist.value2 || entry.liftDistance2 || '',
      liftSpeed1: liftSpd.value1 || entry.liftSpeed1 || '',
      liftSpeed2: liftSpd.value2 || entry.liftSpeed2 || '',
      lowerRetractSpeed1: lowerRetractSpd.value1 || entry.lowerRetractSpeed1 || '',
      lowerRetractSpeed2: lowerRetractSpd.value2 || entry.lowerRetractSpeed2 || '',
      retractSpeed1: retractSpd.value1 || entry.retractSpeed1 || '',
      retractSpeed2: retractSpd.value2 || entry.retractSpeed2 || ''
    })
  }

  const saveGalleryEdit = async () => {
    if (!editingGalleryEntry) return
    setSavingGalleryEdit(true)
    try {
      const response = await fetch(buildGalleryUrl(`/api/gallery/${editingGalleryEntry._id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editGalleryData)
      })
      const data = await response.json()
      if (data.success) {
        setEditingGalleryEntry(null)
        setEditGalleryData({})
        loadGalleryEntries()
        toast.success('Entrada atualizada com sucesso!')
      } else {
        toast.error('Erro ao atualizar: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast.error('Erro ao atualizar entrada da galeria')
    } finally {
      setSavingGalleryEdit(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Galeria de Fotos - Aprovacao
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Aprove ou rejeite as fotos enviadas pelos clientes antes de aparecerem na galeria publica.
        </p>
      </Card>

      {galleryLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : galleryEntries.filter((entry) => entry.status !== 'rejected').length === 0 ? (
        <Card className="p-8 text-center">
          <Image className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-gray-500">Nenhuma foto na galeria ainda.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {galleryEntries
            .filter((entry) => entry.status !== 'rejected')
            .map((entry) => (
              <Card key={entry._id} className="p-4">
                <div className="flex gap-4">
                  <div className="flex gap-2 flex-shrink-0">
                    {entry.images && entry.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`Foto ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{entry.name || 'Anonimo'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          entry.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {entry.status === 'pending'
                          ? 'Pendente'
                          : entry.status === 'approved'
                          ? 'Aprovado'
                          : 'Rejeitado'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Resina:</span>
                        <span className="ml-1 font-medium">{entry.resin}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Impressora:</span>
                        <span className="ml-1 font-medium">{entry.printer}</span>
                      </div>
                    </div>

                    {entry.comment && (
                      <p className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 p-2 rounded mb-3">
                        {entry.comment}
                      </p>
                    )}

                    {(() => {
                      const params = entry.params || {}
                      const lowerLiftDist = params.lowerLiftDistance || {}
                      const liftDist = params.liftDistance || {}
                      const liftSpd = params.liftSpeed || {}
                      const retractSpd = params.retractSpeed || {}
                      return (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            Configuracoes de Impressao
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Altura Camada:</span>{' '}
                              <span className="font-medium">{params.layerHeight || entry.layerHeight || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Camadas Base:</span>{' '}
                              <span className="font-medium">{params.baseLayers || entry.baseLayers || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tempo Exp.:</span>{' '}
                              <span className="font-medium">{params.exposureTime || entry.exposureTime || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tempo Exp. Base:</span>{' '}
                              <span className="font-medium">{params.baseExposureTime || entry.baseExposureTime || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Camadas Trans.:</span>{' '}
                              <span className="font-medium">{params.transitionLayers || entry.transitionLayers || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Atraso UV:</span>{' '}
                              <span className="font-medium">{params.uvOffDelay || entry.uvOffDelay || 'N/A'}</span>
                            </div>
                          </div>

                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mt-3 mb-1">
                            Distancias de Elevacao (mm)
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Inferior:</span>{' '}
                              <span className="font-medium">
                                {lowerLiftDist.value1 || entry.lowerLiftDistance1 || 'N/A'} /{' '}
                                {lowerLiftDist.value2 || entry.lowerLiftDistance2 || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Normal:</span>{' '}
                              <span className="font-medium">
                                {liftDist.value1 || entry.liftDistance1 || 'N/A'} / {liftDist.value2 || entry.liftDistance2 || 'N/A'}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mt-3 mb-1">
                            Velocidades (mm/s)
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Elevacao:</span>{' '}
                              <span className="font-medium">
                                {liftSpd.value1 || entry.liftSpeed1 || 'N/A'} / {liftSpd.value2 || entry.liftSpeed2 || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Retracao:</span>{' '}
                              <span className="font-medium">
                                {retractSpd.value1 || entry.retractSpeed1 || 'N/A'} / {retractSpd.value2 || entry.retractSpeed2 || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {entry.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveGalleryEntry(entry._id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => rejectGalleryEntry(entry._id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        )}
                      </div>
                    )}

                    {entry.status === 'approved' && isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => openEditGallery(entry)}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => rejectGalleryEntry(entry._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Apagar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {editingGalleryEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Editar Entrada da Galeria</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingGalleryEntry(null)
                  setEditGalleryData({})
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-2 mb-4">
              {editingGalleryEntry.images &&
                editingGalleryEntry.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Foto ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                ))}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input
                    value={editGalleryData.name || ''}
                    onChange={(e) => setEditGalleryData({ ...editGalleryData, name: e.target.value })}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Resina</label>
                  <Input
                    value={editGalleryData.resin || ''}
                    onChange={(e) => setEditGalleryData({ ...editGalleryData, resin: e.target.value })}
                    placeholder="Resina utilizada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Impressora</label>
                  <Input
                    value={editGalleryData.printer || ''}
                    onChange={(e) => setEditGalleryData({ ...editGalleryData, printer: e.target.value })}
                    placeholder="Modelo da impressora"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Comentario</label>
                  <Input
                    value={editGalleryData.comment || ''}
                    onChange={(e) => setEditGalleryData({ ...editGalleryData, comment: e.target.value })}
                    placeholder="Comentario opcional"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Configuracoes de Impressao</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Altura Camada (mm)</label>
                    <Input
                      value={editGalleryData.layerHeight || ''}
                      onChange={(e) => setEditGalleryData({ ...editGalleryData, layerHeight: e.target.value })}
                      placeholder="0.05"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Camadas Base</label>
                    <Input
                      value={editGalleryData.baseLayers || ''}
                      onChange={(e) => setEditGalleryData({ ...editGalleryData, baseLayers: e.target.value })}
                      placeholder="6"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tempo Exposicao (s)</label>
                    <Input
                      value={editGalleryData.exposureTime || ''}
                      onChange={(e) => setEditGalleryData({ ...editGalleryData, exposureTime: e.target.value })}
                      placeholder="2.5"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tempo Exp. Base (s)</label>
                    <Input
                      value={editGalleryData.baseExposureTime || ''}
                      onChange={(e) => setEditGalleryData({ ...editGalleryData, baseExposureTime: e.target.value })}
                      placeholder="30"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Camadas Transicao</label>
                    <Input
                      value={editGalleryData.transitionLayers || ''}
                      onChange={(e) => setEditGalleryData({ ...editGalleryData, transitionLayers: e.target.value })}
                      placeholder="5"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Atraso UV (s)</label>
                    <Input
                      value={editGalleryData.uvOffDelay || ''}
                      onChange={(e) => setEditGalleryData({ ...editGalleryData, uvOffDelay: e.target.value })}
                      placeholder="0.5"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Distancias (mm)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Elevacao Inferior (1/2)</label>
                    <div className="flex gap-2">
                      <Input
                        value={editGalleryData.lowerLiftDistance1 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, lowerLiftDistance1: e.target.value })}
                        placeholder="Valor 1"
                        className="text-sm"
                      />
                      <Input
                        value={editGalleryData.lowerLiftDistance2 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, lowerLiftDistance2: e.target.value })}
                        placeholder="Valor 2"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Elevacao Normal (1/2)</label>
                    <div className="flex gap-2">
                      <Input
                        value={editGalleryData.liftDistance1 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, liftDistance1: e.target.value })}
                        placeholder="Valor 1"
                        className="text-sm"
                      />
                      <Input
                        value={editGalleryData.liftDistance2 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, liftDistance2: e.target.value })}
                        placeholder="Valor 2"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Retracao Inferior (1/2)</label>
                    <div className="flex gap-2">
                      <Input
                        value={editGalleryData.lowerRetractDistance1 || ''}
                        onChange={(e) =>
                          setEditGalleryData({ ...editGalleryData, lowerRetractDistance1: e.target.value })
                        }
                        placeholder="Valor 1"
                        className="text-sm"
                      />
                      <Input
                        value={editGalleryData.lowerRetractDistance2 || ''}
                        onChange={(e) =>
                          setEditGalleryData({ ...editGalleryData, lowerRetractDistance2: e.target.value })
                        }
                        placeholder="Valor 2"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Retracao Normal (1/2)</label>
                    <div className="flex gap-2">
                      <Input
                        value={editGalleryData.retractDistance1 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, retractDistance1: e.target.value })}
                        placeholder="Valor 1"
                        className="text-sm"
                      />
                      <Input
                        value={editGalleryData.retractDistance2 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, retractDistance2: e.target.value })}
                        placeholder="Valor 2"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Velocidades (mm/s)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Elevacao Inferior (1/2)</label>
                    <div className="flex gap-2">
                      <Input
                        value={editGalleryData.lowerLiftSpeed1 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, lowerLiftSpeed1: e.target.value })}
                        placeholder="Valor 1"
                        className="text-sm"
                      />
                      <Input
                        value={editGalleryData.lowerLiftSpeed2 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, lowerLiftSpeed2: e.target.value })}
                        placeholder="Valor 2"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Elevacao Normal (1/2)</label>
                    <div className="flex gap-2">
                      <Input
                        value={editGalleryData.liftSpeed1 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, liftSpeed1: e.target.value })}
                        placeholder="Valor 1"
                        className="text-sm"
                      />
                      <Input
                        value={editGalleryData.liftSpeed2 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, liftSpeed2: e.target.value })}
                        placeholder="Valor 2"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Retracao Inferior (1/2)</label>
                    <div className="flex gap-2">
                      <Input
                        value={editGalleryData.lowerRetractSpeed1 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, lowerRetractSpeed1: e.target.value })}
                        placeholder="Valor 1"
                        className="text-sm"
                      />
                      <Input
                        value={editGalleryData.lowerRetractSpeed2 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, lowerRetractSpeed2: e.target.value })}
                        placeholder="Valor 2"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Retracao Normal (1/2)</label>
                    <div className="flex gap-2">
                      <Input
                        value={editGalleryData.retractSpeed1 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, retractSpeed1: e.target.value })}
                        placeholder="Valor 1"
                        className="text-sm"
                      />
                      <Input
                        value={editGalleryData.retractSpeed2 || ''}
                        onChange={(e) => setEditGalleryData({ ...editGalleryData, retractSpeed2: e.target.value })}
                        placeholder="Valor 2"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingGalleryEntry(null)
                    setEditGalleryData({})
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={saveGalleryEdit} disabled={savingGalleryEdit} className="bg-blue-600 hover:bg-blue-700">
                  {savingGalleryEdit ? 'Salvando...' : 'Salvar Alteracoes'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
