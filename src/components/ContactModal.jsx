import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Phone, Mail, MessageSquare } from 'lucide-react'

const API_URL = (import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com').replace(/\/$/, '')

const readStoredProfile = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('quanton3d_user_profile')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function ContactModal({ isOpen, onClose }) {
  const storedProfile = readStoredProfile()
  const [formData, setFormData] = useState({
    name: storedProfile?.name || '',
    phone: storedProfile?.phone || '',
    email: storedProfile?.email || '',
    message: ''
  })
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!isOpen) return
    const profile = readStoredProfile()
    setFormData((prev) => ({
      ...prev,
      name: profile?.name || prev.name,
      phone: profile?.phone || prev.phone,
      email: profile?.email || prev.email,
    }))
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setStatus('sending')
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Falha ao enviar, tente novamente.')
      }

      setStatus('success')
      setFormData((prev) => ({ ...prev, message: '' }))
    } catch (error) {
      console.error('Erro ao enviar contato:', error)
      setStatus('error')
    }
  }

  const handleClose = () => {
    setStatus('idle')
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Fale Conosco</h2>
              <p className="text-blue-100">Entre em contato conosco. Estamos aqui para ajudar!</p>
            </div>
            <button onClick={handleClose} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
                <Check size={48} className="text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-700">Mensagem Enviada com Sucesso!</h3>
                <p className="text-gray-600 mt-2">Obrigado pelo contato! Responderemos em breve.</p>
                <button onClick={handleClose} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Fechar
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome Completo *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Seu nome completo" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Phone className="h-4 w-4" />Telefone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Mail className="h-4 w-4" />E-mail *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4" />Deixe seu recado *</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Como podemos ajudar?" required rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <button type="submit" disabled={status === 'sending'} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70">
                  {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
                {status === 'error' && <p className="text-center text-red-500">Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.</p>}
                <div className="text-center text-gray-500 pt-4 border-t mt-4 space-y-2">
                  <p>Ou entre em contato diretamente:</p>
                  <p className="flex items-center justify-center gap-2"><Phone className="h-4 w-4" /> (31) 3271-6935</p>
                  <p className="flex items-center justify-center gap-2"><Mail className="h-4 w-4" /> atendimento@quanton3d.com.br</p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
