import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card } from '@/components/ui/card.jsx'
import { X, Camera, Loader2, Upload, CheckCircle2 } from 'lucide-react'

function normalizeApiBase(apiBaseUrl) {
  const raw = (apiBaseUrl || 'https://quanton3d-bot-v2.onrender.com/api').trim().replace(/\/$/, '')
  return /\/api$/i.test(raw) ? raw : `${raw}/api`
}

export function GallerySubmitModal({ isOpen, onClose, apiBaseUrl, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    resin: '',
    printer: '',
    layerHeight: '',
    exposureNormal: '',
    exposureBase: '',
    baseLayers: '',
    notes: '',
    allowPublic: true
  })
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const endpoint = useMemo(() => `${normalizeApiBase(apiBaseUrl)}/gallery`, [apiBaseUrl])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      resin: '',
      printer: '',
      layerHeight: '',
      exposureNormal: '',
      exposureBase: '',
      baseLayers: '',
      notes: '',
      allowPublic: true
    })
    setImageFile(null)
    setPreviewUrl('')
    setError('')
  }

  const handleClose = () => {
    setError('')
    setSuccessMessage('')
    onClose?.()
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImageFile(null)
      setPreviewUrl('')
      return
    }

    setImageFile(file)
    const fileReader = new FileReader()
    fileReader.onload = () => setPreviewUrl(String(fileReader.result || ''))
    fileReader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!formData.resin.trim() || !formData.printer.trim()) {
      setError('Informe pelo menos a resina e a impressora.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('contact', formData.contact)
      payload.append('resin', formData.resin)
      payload.append('printer', formData.printer)
      payload.append('layerHeight', formData.layerHeight)
      payload.append('exposureNormal', formData.exposureNormal)
      payload.append('exposureBase', formData.exposureBase)
      payload.append('baseLayers', formData.baseLayers)
      payload.append('notes', formData.notes)
      payload.append('allowPublic', String(formData.allowPublic))
      if (imageFile) {
        payload.append('image', imageFile)
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: payload
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Não foi possível enviar sua configuração.')
      }

      setSuccessMessage('Recebemos sua peça! Ela entrou na fila de revisão da Quanton3D.')
      onSuccess?.()
      resetForm()
    } catch (submitError) {
      setError(submitError.message || 'Erro ao enviar sua configuração.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={handleClose} />

      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl border border-white/10">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Compartilhar minhas configurações</h2>
              <p className="text-sm text-gray-500">Envie uma foto da peça e os parâmetros usados no Chitubox.</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <label className="text-sm font-medium">Contato</label>
              <Input value={formData.contact} onChange={(e) => handleChange('contact', e.target.value)} placeholder="WhatsApp ou e-mail" />
            </div>
            <div>
              <label className="text-sm font-medium">Resina *</label>
              <Input value={formData.resin} onChange={(e) => handleChange('resin', e.target.value)} placeholder="Ex: Iron, Athom Dental, Poseidon" />
            </div>
            <div>
              <label className="text-sm font-medium">Impressora *</label>
              <Input value={formData.printer} onChange={(e) => handleChange('printer', e.target.value)} placeholder="Ex: Elegoo Saturn 4 Ultra" />
            </div>
            <div>
              <label className="text-sm font-medium">Altura de camada</label>
              <Input value={formData.layerHeight} onChange={(e) => handleChange('layerHeight', e.target.value)} placeholder="Ex: 0.05 mm" />
            </div>
            <div>
              <label className="text-sm font-medium">Exposição normal</label>
              <Input value={formData.exposureNormal} onChange={(e) => handleChange('exposureNormal', e.target.value)} placeholder="Ex: 2.3 s" />
            </div>
            <div>
              <label className="text-sm font-medium">Exposição base</label>
              <Input value={formData.exposureBase} onChange={(e) => handleChange('exposureBase', e.target.value)} placeholder="Ex: 28 s" />
            </div>
            <div>
              <label className="text-sm font-medium">Camadas base</label>
              <Input value={formData.baseLayers} onChange={(e) => handleChange('baseLayers', e.target.value)} placeholder="Ex: 5" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Foto da peça</label>
            <div className="mt-2 rounded-xl border border-dashed p-4 bg-gray-50 dark:bg-gray-800">
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <p className="text-xs text-gray-500 mt-2">Pode enviar uma foto da peça ou print da configuração.</p>
              {previewUrl && (
                <img src={previewUrl} alt="Prévia" className="mt-4 max-h-64 rounded-lg border" />
              )}
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-lg border p-3 bg-gray-50 dark:bg-gray-800">
            <input
              type="checkbox"
              checked={formData.allowPublic}
              onChange={(e) => handleChange('allowPublic', e.target.checked)}
              className="mt-1"
            />
            <div>
              <p className="text-sm font-medium">Permito que outros clientes vejam minha foto e as configurações usadas após aprovação da Quanton3D.</p>
              <p className="text-xs text-gray-500">Você continua enviando para revisão mesmo se desmarcar esta opção.</p>
            </div>
          </label>

          <div>
            <label className="text-sm font-medium">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Descreva qualquer detalhe importante da impressão."
              className="mt-1 w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 p-3 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Fechar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar configuração
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default GallerySubmitModal
