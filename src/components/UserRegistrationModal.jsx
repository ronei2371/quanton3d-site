import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'
import { UserPlus, PhoneCall, Mail, ShieldAlert } from 'lucide-react'

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
  resin: '',
  problemType: ''
}

const resinOptions = [
  'Pyroblast+',
  'Iron',
  'Iron 7030',
  'Spin+',
  'Spark',
  'FlexForm',
  'Castable',
  'Low Smell',
  'Spare',
  'ALCHEMIST',
  'POSEIDON',
  'RPG',
  'Athon ALINHADORES',
  'Athon DENTAL',
  'Athon GENGIVA',
  'Athon WASHABLE'
]

const problemOptions = [
  'Adesão na plataforma',
  'Configuração de parâmetros',
  'Qualidade da impressão',
  'Problema de LCD / Tela',
  'Dúvida sobre resina',
  'Outro problema'
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
      console.warn('Erro ao ler cadastro salvo:', err)
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (event) => {
      if (event?.detail) {
        onComplete?.(event.detail)
        setIsOpen(false)
      }
    }
    window.addEventListener('quanton3d:user-registered', handler)
    return () => window.removeEventListener('quanton3d:user-registered', handler)
  }, [onComplete])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === 'phone') {
      setPhoneError('')
    }
  }

  const persistProfile = (profile) => {
    try {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile))
      const chatStateRaw = localStorage.getItem(CHAT_STORAGE_KEY)
      if (chatStateRaw) {
        const parsed = JSON.parse(chatStateRaw)
        const updated = {
          ...parsed,
          userData: { ...(parsed?.userData || {}), ...profile },
          userRegistered: true,
          showUserForm: false
        }
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated))
      }
    } catch (err) {
      console.warn('Não foi possível persistir o cadastro localmente:', err)
    }
    try {
      window.dispatchEvent(new CustomEvent('quanton3d:user-registered', { detail: profile }))
    } catch (err) {
      console.warn('Evento de cadastro não pôde ser disparado:', err)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!formData.name || !formData.phone || !formData.email || !formData.problemType || !formData.resin) {
      setSubmitError('Preencha todos os campos obrigatórios.')
      return
    }

    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      setPhoneError('Informe um telefone válido com DDD (mínimo 10 dígitos).')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        sessionId: `registration_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      }
      const response = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Não conseguimos registrar seus dados agora.')
      }

      const data = await response.json().catch(() => ({}))
      const profile = data?.user || formData
      persistProfile(profile)
      onComplete?.(profile)
      setIsOpen(false)
    } catch (err) {
      console.error('Erro ao registrar usuário global:', err)
      setSubmitError(err.message || 'Erro ao registrar seus dados. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || profileExists) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl px-4"
          >
            <Card className="bg-white dark:bg-gray-900 shadow-2xl border-4 border-blue-500 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <UserPlus className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-600">Passo 2 · Cadastro Quanton3D</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Precisamos dos seus dados para continuar
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Assim conseguimos salvar suas conversas, agilizar o suporte e evitar que você repita esse cadastro novamente.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Nome completo *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <PhoneCall className="h-4 w-4" /> Telefone com DDD *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`w-full mt-1 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white ${phoneError ? 'border-red-500' : ''}`}
                      placeholder="(31) 99999-0000"
                      required
                    />
                    {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Qual resina você utiliza? *</label>
                    <select
                      value={formData.resin}
                      onChange={(e) => handleChange('resin', e.target.value)}
                      className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Selecione</option>
                      {resinOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Qual o seu problema? *</label>
                    <select
                      value={formData.problemType}
                      onChange={(e) => handleChange('problemType', e.target.value)}
                      className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Selecione</option>
                      {problemOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 mt-0.5" />
                    <p>{submitError}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Seus dados ficam salvos e não precisará preencher novamente.
                  </p>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {isSubmitting ? 'Registrando...' : 'Salvar e continuar'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
