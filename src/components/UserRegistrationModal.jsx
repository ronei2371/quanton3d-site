import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'
import { UserPlus, PhoneCall, Mail, ShieldAlert, Instagram, Youtube, Share2 } from 'lucide-react'

const normalizeApiUrl = (rawUrl) => {
  const trimmed = (rawUrl || '').trim().replace(/\/$/, '')
  if (!trimmed) return 'https://quanton3d-bot-v2.onrender.com/api'
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`
}

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com/api')
const REGISTER_ENDPOINT = `${API_BASE_URL}/register-user`
const USER_PROFILE_STORAGE_KEY = 'quanton3d_user_profile'
const CHAT_STORAGE_KEY = 'quanton3d-chat-state'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  origin: '' // Novo campo: Como nos conheceu
}

const originOptions = [
  'Instagram',
  'YouTube',
  'Google / Pesquisa',
  'Indicação de amigo',
  'Mercado Livre / Shopee',
  'Já sou cliente'
]

export function UserRegistrationModal({ isPrivacyAccepted, onComplete }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [phoneError, setPhoneError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadStoredProfile = useCallback(() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(USER_PROFILE_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (err) {
      return null
    }
  }, [])

  const profileExists = useMemo(() => Boolean(loadStoredProfile()), [loadStoredProfile])

  useEffect(() => {
    if (!isPrivacyAccepted) return
    const stored = loadStoredProfile()
    if (stored) {
      onComplete?.(stored)
      setIsOpen(false)
      return
    }
    setIsOpen(true)
  }, [isPrivacyAccepted, loadStoredProfile, onComplete])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === 'phone') setPhoneError('')
  }

  const persistProfile = (profile) => {
    try {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile))
    } catch (err) {
      console.warn('Erro ao salvar localmente')
    }
    window.dispatchEvent(new CustomEvent('quanton3d:user-registered', { detail: profile }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!formData.name || !formData.phone || !formData.email || !formData.origin) {
      setSubmitError('Preencha todos os campos para continuarmos.')
      return
    }

    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      setPhoneError('Informe um telefone válido com DDD.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = { ...formData, resin: 'Redes Sociais', problemType: 'Novo Cadastro' }
      const response = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Erro ao registrar.')

      const data = await response.json().catch(() => ({}))
      const profile = data?.user || formData
      persistProfile(profile)
      onComplete?.(profile)
      setIsOpen(false)
    } catch (err) {
      setSubmitError('Erro ao salvar seus dados. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || profileExists) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-2xl px-4"
        >
          <Card className="bg-white dark:bg-gray-900 shadow-2xl border-4 border-blue-600 p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <UserPlus className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600">Comunidade Quanton3D</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seja bem-vindo!</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Identifique-se para liberar o suporte técnico especializado.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Seu Nome *</label>
                  <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800" placeholder="Nome completo" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium flex gap-2"><PhoneCall className="h-4 w-4"/> WhatsApp *</label>
                  <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800" placeholder="(31) 99999-0000" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium flex gap-2"><Mail className="h-4 w-4"/> E-mail *</label>
                  <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium flex gap-2"><Share2 className="h-4 w-4"/> Como nos conheceu? *</label>
                  <select value={formData.origin} onChange={(e) => handleChange('origin', e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800" required>
                    <option value="">Selecione...</option>
                    {originOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              {submitError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><ShieldAlert className="h-4 w-4"/>{submitError}</div>}

              <div className="pt-4 border-t mt-6">
                <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Siga a Quanton3D nas redes</p>
                <div className="flex justify-center gap-4">
                  <Button type="button" variant="outline" onClick={() => window.open('https://instagram.com/quanton3d')} className="flex gap-2 border-pink-200 hover:bg-pink-50 text-pink-600">
                    <Instagram className="h-4 w-4" /> Instagram
                  </Button>
                  <Button type="button" variant="outline" onClick={() => window.open('https://youtube.com/@quanton3d')} className="flex gap-2 border-red-200 hover:bg-red-50 text-red-600">
                    <Youtube className="h-4 w-4" /> YouTube
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 mt-4">
                {isSubmitting ? 'Registrando...' : 'Entrar no Suporte Técnico'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
