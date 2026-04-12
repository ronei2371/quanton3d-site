import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'

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

export default function CustomFormModal({ isOpen, onClose }) {
  const profile = readStoredProfile()
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    caracteristica: '',
    cor: '',
    complementos: ''
  })
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!isOpen) return
    const stored = readStoredProfile()
    setFormData((prev) => ({
      ...prev,
      name: stored?.name || prev.name,
      phone: stored?.phone || prev.phone,
      email: stored?.email || prev.email,
    }))
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.email || !formData.caracteristica || !formData.cor) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setStatus('sending')
    try {
      const response = await fetch(`${API_URL}/api/custom-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Falha ao enviar, tente novamente.')
      }

      setStatus('success')
      setFormData((prev) => ({ ...prev, caracteristica: '', cor: '', complementos: '' }))
    } catch (error) {
      console.error('Erro ao enviar formulação:', error)
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
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
            Formulação Customizada
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Descreva as características da resina especial que você precisa.</p>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
                <Check size={48} className="text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-700">Pedido Enviado com Sucesso!</h3>
                <p className="text-gray-600 mt-2">Agradecemos sua solicitação. Analisaremos as especificações e entraremos em contato.</p>
                <button onClick={handleClose} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold">Fechar</button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Nome Completo *</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Seu nome completo" className="w-full p-3 border rounded-lg focus:ring-blue-500" required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefone *</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full p-3 border rounded-lg focus:ring-blue-500" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail *</label>
                  <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" className="w-full p-3 border rounded-lg focus:ring-blue-500" required />
                </div>
                <div>
                  <label htmlFor="caracteristica" className="block text-sm font-medium mb-1">Característica Desejada *</label>
                  <input type="text" name="caracteristica" id="caracteristica" value={formData.caracteristica} onChange={handleChange} placeholder="Ex.: alta resistência ao impacto" className="w-full p-3 border rounded-lg focus:ring-blue-500" required />
                </div>
                <div>
                  <label htmlFor="cor" className="block text-sm font-medium mb-1">Cor *</label>
                  <input type="text" name="cor" id="cor" value={formData.cor} onChange={handleChange} placeholder="Ex.: cinza" className="w-full p-3 border rounded-lg focus:ring-blue-500" required />
                </div>
                <div>
                  <label htmlFor="complementos" className="block text-sm font-medium mb-1">Complementos/Detalhes</label>
                  <textarea name="complementos" id="complementos" value={formData.complementos} onChange={handleChange} rows={4} placeholder="Descreva mais detalhes sobre o projeto" className="w-full p-3 border rounded-lg focus:ring-blue-500" />
                </div>
                <button type="submit" disabled={status === 'sending'} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70">
                  {status === 'sending' ? 'Enviando...' : 'Enviar Pedido para Avaliação'}
                </button>
                {status === 'error' && <p className="text-center text-red-500">Ocorreu um erro ao enviar. Tente novamente mais tarde.</p>}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
