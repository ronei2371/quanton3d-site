import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, UploadCloud, MessageSquarePlus, X, Copy } from 'lucide-react'

const STORAGE_KEY = 'quanton3d-improve-knowledge'

const initialForm = {
  summary: '',
  question: '',
  missingInfo: '',
  desiredAnswer: '',
  image: null
}

export function ImproveKnowledgeModal({ isOpen, onClose, lastUserMessage = '', lastBotReply = '' }) {
  const [formData, setFormData] = useState(initialForm)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!isOpen) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setFormData({ ...initialForm, ...parsed })
        return
      }
    } catch (err) {
      console.warn('Não foi possível restaurar rascunho do CTA de conhecimento:', err)
    }
    setFormData({
      summary: '',
      question: lastUserMessage || '',
      missingInfo: '',
      desiredAnswer: lastBotReply || '',
      image: null
    })
  }, [isOpen, lastUserMessage, lastBotReply])

  useEffect(() => {
    if (!isOpen) return
    const payload = { ...formData }
    delete payload.image
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [formData, isOpen])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFile = (file) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, image: null }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }))
    }
    reader.onerror = () => {
      setError('Não consegui ler este arquivo. Tente outra imagem.')
    }
    reader.readAsDataURL(file)
  }

  const copyLastMessages = () => {
    const textToCopy = `Pergunta do cliente:\n${lastUserMessage}\n\nResposta do bot:\n${lastBotReply}`.trim()
    navigator.clipboard.writeText(textToCopy).then(() => {
      setSuccessMessage('Contexto copiado! Cole no campo “Resumo rápido”.')
      setTimeout(() => setSuccessMessage(''), 3000)
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!formData.summary.trim() || !formData.missingInfo.trim()) {
      setError('Resumo e “O que faltou” são obrigatórios.')
      return
    }

    setIsSending(true)
    try {
      const payload = {
        suggestion: formData.summary,
        missingInfo: formData.missingInfo,
        desiredAnswer: formData.desiredAnswer,
        question: formData.question,
        attachment: formData.image
      }
      const response = await fetch('/api/suggest-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error('Falha ao enviar. Tente novamente em instantes.')
      const data = await response.json()
      setSuccessMessage(data.message || 'Enviado! Já vai para revisão do Ronei.')
      setFormData(initialForm)
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/40"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/40">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase text-purple-500 font-bold tracking-wide">CTA interno · Quanton3D</p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Complementar Conhecimento do Cliente</h2>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-900/60 rounded-full p-2">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Resumo rápido do que aconteceu
                    <button type="button" onClick={copyLastMessages} className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 flex items-center gap-1">
                      <Copy size={12} /> Copiar pergunta/resposta
                    </button>
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    rows={3}
                    className="w-full mt-1 p-3 rounded-lg border bg-white/80 dark:bg-gray-800"
                    placeholder="Ex: Cliente pediu parâmetros da Spark na Photon Mono 4K, bot respondeu com outra resina."
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pergunta do cliente (opcional)</label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => handleChange('question', e.target.value)}
                    rows={3}
                    className="w-full mt-1 p-3 rounded-lg border bg-white/80 dark:bg-gray-800"
                    placeholder="Cole a pergunta aqui se quiser salvar para referência."
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">O que faltou / Qual verdade técnica?</label>
                  <textarea
                    value={formData.missingInfo}
                    onChange={(e) => handleChange('missingInfo', e.target.value)}
                    rows={3}
                    className="w-full mt-1 p-3 rounded-lg border bg-white/80 dark:bg-gray-800"
                    placeholder="Ex: Tabela oficial Spark + Photon Mono 4K."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Como deveria responder (opcional)</label>
                  <textarea
                    value={formData.desiredAnswer}
                    onChange={(e) => handleChange('desiredAnswer', e.target.value)}
                    rows={3}
                    className="w-full mt-1 p-3 rounded-lg border bg-white/80 dark:bg-gray-800"
                    placeholder="Escreva a resposta perfeita ou paste uma referência."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  Prova visual (opcional)
                  <span className="text-xs text-gray-500">Screenshot, foto ou gráfico</span>
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="px-4 py-2 rounded-lg border border-dashed border-purple-400 text-purple-600 text-sm cursor-pointer flex items-center gap-2">
                    <UploadCloud size={16} /> Selecionar arquivo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                  </label>
                  {formData.image && (
                    <span className="text-xs text-gray-500">
                      Imagem anexada ({Math.round(formData.image.length / 1024)} KB)
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
              )}
              {successMessage && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{successMessage}</div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tudo que você enviar vem direto para o meu pipeline de atualização do bot.
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm text-gray-600 dark:text-gray-200">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg disabled:opacity-60"
                  >
                    {isSending ? 'Enviando...' : 'Enviar agora'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
