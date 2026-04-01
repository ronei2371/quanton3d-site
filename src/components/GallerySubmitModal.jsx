import { useState } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'

const initialForm = {
  name: '',
  contact: '',
  printer: '',
  resin: '',
  layerHeight: '',
  normalExposure: '',
  baseExposure: '',
  note: ''
}

const MAX_FILE_SIZE_MB = 8
const MAX_ERROR_PREVIEW = 180

const sanitizeNumber = (value) => {
  const trimmed = value?.toString().trim()
  if (!trimmed) return null
  return trimmed.replace(',', '.')
}

const buildSettingsPayload = (form) => {
  const payload = {}
  const layerHeight = sanitizeNumber(form.layerHeight)
  const normalExposure = sanitizeNumber(form.normalExposure)
  const baseExposure = sanitizeNumber(form.baseExposure)
  if (layerHeight) payload.layerHeightMm = layerHeight
  if (normalExposure) payload.exposureTimeS = normalExposure
  if (baseExposure) payload.baseExposureTimeS = baseExposure
  if (Object.keys(payload).length === 0) return null
  return payload
}

const extractReadableError = (rawText) => {
  if (!rawText) return 'O servidor não respondeu como esperado. Tente novamente.'
  const cleaned = rawText
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return 'O servidor não respondeu como esperado. Tente novamente.'
  return cleaned.slice(0, MAX_ERROR_PREVIEW)
}

export function GallerySubmitModal({ isOpen, onClose, apiBaseUrl, onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0]
    if (!selected) {
      setFile(null)
      setPreview(null)
      return
    }

    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. Limite: ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    setError(null)
    setFile(selected)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(selected)
  }

  const resetState = () => {
    setForm(initialForm)
    setFile(null)
    setPreview(null)
    setError(null)
    setSuccessMessage('')
    setIsSubmitting(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    if (!form.resin.trim() || !form.printer.trim()) {
      setError('Informe a resina e a impressora utilizadas.')
      return
    }
    if (!file) {
      setError('Envie pelo menos uma foto da peça pronta.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage('')

      const formData = new FormData()
      formData.append('resin', form.resin.trim())
      formData.append('printer', form.printer.trim())
      if (form.name) formData.append('name', form.name.trim())
      if (form.contact) {
        formData.append('contact', form.contact.trim())
      }
      if (form.note) {
        formData.append('note', form.note.trim())
      }

      const settingsPayload = buildSettingsPayload(form)
      if (settingsPayload) {
        formData.append('settings', JSON.stringify(settingsPayload))
      }

      formData.append('image', file)

      const response = await fetch(`${apiBaseUrl}/gallery`, {
        method: 'POST',
        body: formData
      })

      const text = await response.text()
      const contentType = response.headers.get('content-type') || ''
      let data
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.warn('Falha ao interpretar JSON da galeria:', parseError)
        }
      }

      if (!response.ok || !data?.success) {
        const readable = data?.error || extractReadableError(text)
        throw new Error(readable || 'Não foi possível enviar agora. Tente novamente mais tarde.')
      }

      const message = data?.message || 'Recebemos sua peça! Ela entra na fila de revisão do time.'
      setSuccessMessage(message)
      onSuccess?.(data)
      setTimeout(() => {
        resetState()
        onClose?.()
      }, 1500)
    } catch (err) {
      console.error('Erro ao enviar galeria:', err)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    resetState()
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-900" onClick={handleClose}>
          <X className="h-6 w-6" />
        </button>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Compartilhe sua impressão</h3>
            <p className="text-sm text-gray-500">Envie uma foto da peça e os parâmetros que você usou (Chitubox ou outro fatiador). Nosso time valida e publica na galeria pública após revisão.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Seu nome (opcional)</label>
                <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Como gostaria de aparecer" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Contato (WhatsApp ou e-mail)</label>
                <Input value={form.contact} onChange={(e) => handleChange('contact', e.target.value)} placeholder="ex: 31 99999-0000" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Resina utilizada *</label>
                <Input required value={form.resin} onChange={(e) => handleChange('resin', e.target.value)} placeholder="Quanton3D Spark, ABS, etc." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Impressora *</label>
                <Input required value={form.printer} onChange={(e) => handleChange('printer', e.target.value)} placeholder="Elegoo Saturn 3, Anycubic, etc." />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Altura de camada (mm)</label>
                <Input value={form.layerHeight} onChange={(e) => handleChange('layerHeight', e.target.value)} placeholder="0.05" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Exposição normal (s)</label>
                <Input value={form.normalExposure} onChange={(e) => handleChange('normalExposure', e.target.value)} placeholder="2.8" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Exposição de base (s)</label>
                <Input value={form.baseExposure} onChange={(e) => handleChange('baseExposure', e.target.value)} placeholder="30" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Observações adicionais</label>
              <textarea className="w-full border rounded-lg p-3 text-sm shadow-inner focus:ring-2 focus:ring-blue-200" rows="3" value={form.note} onChange={(e) => handleChange('note', e.target.value)} placeholder="Cole aqui detalhes do preset do Chitubox ou dicas importantes." />
            </div>

            <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50">
              <input type="file" accept="image/*" className="hidden" id="gallery-upload-input" onChange={handleFileChange} />
              {preview ? (
                <img src={preview} alt="Pré-visualização" className="max-h-48 rounded-lg object-contain mb-3" />
              ) : (
                <Upload className="h-10 w-10 text-blue-500 mb-2" />
              )}
              <p className="text-sm text-gray-600">Envie uma imagem da sua peça finalizada ({MAX_FILE_SIZE_MB}MB máx).</p>
              <Button type="button" variant="outline" className="mt-3" onClick={() => document.getElementById('gallery-upload-input').click()}>
                Selecionar arquivo
              </Button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <p className="text-xs text-gray-500">Ao enviar você concorda em compartilhar a imagem e parâmetros no site Quanton3D após revisão.</p>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6">
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</span>
                ) : (
                  'Enviar para revisão'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
