// Arquivo: quanton3d-site/src/App.jsx
// (Código FINAL que conserta o cabeçalho, robô, lógica e a leitura de dados)
// REDESIGN COMPLETO - Build: 2025-12-15 00:48 UTC
// CORREÇÃO: Isolamento completo da autenticação administrativa (não interfere mais no cadastro de clientes)

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'
import { ChatBot } from '@/components/ChatBot.jsx'
import { MenuSelector } from '@/components/MenuSelector.jsx'
import TechnicalTabs from '@/components/TechnicalTabs.jsx'
import { DocumentsSection } from '@/components/DocumentsSection.jsx'
import { ServiceModal } from '@/components/ServiceModal.jsx'
import { PrivacyModal } from '@/components/PrivacyModal.jsx'
import { UserRegistrationModal } from '@/components/UserRegistrationModal.jsx'
import { WelcomeModal } from '@/components/WelcomeModal.jsx'
import { QualityModal } from '@/components/QualityModal.jsx'
import { TechnicalSupportModal } from '@/components/TechnicalSupportModal.jsx'
import { AboutModal } from '@/components/AboutModal.jsx'
import ResinCards from '@/components/ResinCards.jsx'
import ParametersSelector from '@/components/ParametersSelector.jsx'
import CustomFormModal from '@/components/CustomFormModal.jsx'
import ContactModal from '@/components/ContactModal.jsx'
import { AdminPanel } from '@/components/AdminPanel.jsx'
import { AuthWrapper } from '@/components/AuthWrapper.jsx'
import { GalleryModal } from '@/components/GalleryModal.jsx'
import { GallerySubmitModal } from '@/components/GallerySubmitModal.jsx'
import { ImproveKnowledgeModal } from '@/components/ImproveKnowledgeModal.jsx'
import { Beaker, Cpu, Sparkles, ChevronRight, Shield, Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import './App.css'

const RAW_API_URL = (import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com/api')
const normalizeApiBaseUrl = (rawUrl) => {
  if (!rawUrl) return 'https://quanton3d-bot-v2.onrender.com/api'
  const trimmed = rawUrl.trim().replace(/\/$/, '')
  if (/\/api$/i.test(trimmed)) {
    return trimmed
  }
  return `${trimmed}/api`
}
const API_BASE_URL = normalizeApiBaseUrl(RAW_API_URL)
const PUBLIC_API_BASE = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '')

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false)
  const [chatMode, setChatMode] = useState('suporte')
  const [modalService, setModalService] = useState(null)
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false)
  const [isTechSupportModalOpen, setIsTechSupportModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [isGallerySubmitOpen, setIsGallerySubmitOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryError, setGalleryError] = useState(null)
  const [gallerySuccessMessage, setGallerySuccessMessage] = useState('')
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false)
  const [lastBotContext, setLastBotContext] = useState({ user: '', bot: '' })
  const [isAdminSession, setIsAdminSession] = useState(false)

  // ==================== USEEFFECT PÚBLICO (CORRIGIDO) ====================
  useEffect(() => {
    if (typeof window === 'undefined') return
    const accepted = localStorage.getItem('quanton3d_privacy_accepted') === 'true'
    setIsPrivacyAccepted(accepted)
    const storedProfile = localStorage.getItem('quanton3d_user_profile')
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile))
      } catch (err) {
        console.warn('Não foi possível ler o cadastro salvo:', err)
      }
    }
    // REMOVIDO: setIsAdminSession automático para não interferir no cadastro público
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (event) => {
      if (event?.detail) {
        setUserProfile(event.detail)
      }
    }
    window.addEventListener('quanton3d:user-registered', handler)
    const handleAdminLogin = () => setIsAdminSession(true)
    const handleAdminLogout = () => setIsAdminSession(false)
    window.addEventListener('quanton3d:admin-login', handleAdminLogin)
    window.addEventListener('quanton3d:admin-logout', handleAdminLogout)
    return () => {
      window.removeEventListener('quanton3d:user-registered', handler)
      window.removeEventListener('quanton3d:admin-login', handleAdminLogin)
      window.removeEventListener('quanton3d:admin-logout', handleAdminLogout)
    }
  }, [])

  useEffect(() => {
    if (!isAdminSession) {
      setIsImproveModalOpen(false)
    }
  }, [isAdminSession])

  const handleMenuSelect = (option) => {
    setIsModalOpen(false); 
    
    if (option === 'suporte' || option === 'vendas') {
      setChatMode(option);
      setIsChatOpen(true);
    } else if (option === 'atendente') {
      window.open('https://wa.me/553132716935', '_blank'); // WhatsApp
    }
  }

  const handleOpenCustomForm = () => {
    setIsFormModalOpen(true);
  }

  const handleOpenContact = () => {
    setIsContactModalOpen(true);
  }

  const handleOpenGallerySubmit = () => {
    setGallerySuccessMessage('')
    setIsGallerySubmitOpen(true)
  }

  const handleGallerySubmissionSuccess = () => {
    setGallerySuccessMessage('Recebemos sua peça! Ela entra na fila de revisão do time.')
  }

  const fetchGalleryImages = async () => {
    if (galleryLoading) return
    setGalleryLoading(true)
    setGalleryError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/gallery?limit=50`)
      const text = await response.text()
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Resposta inesperada do servidor ao carregar a galeria.')
      }
      const normalized = Array.isArray(data.gallery) ? data.gallery : Array.isArray(data.images) ? data.images : []
      const formatted = normalized
        .map(item => ({
          url: item.imageUrl || item.image || '',
          desc: item.note || item.description || '',
          resin: item.resin || '',
          printer: item.printer || '',
          name: item.name || '',
          settings: item.settings || {}
        }))
        .filter(item => item.url)
      setGalleryImages(formatted)
      if (!formatted.length) {
        setGalleryError('Nenhuma foto aprovada ainda. Assim que a revisão liberar, elas aparecem aqui.')
      }
    } catch (error) {
      console.error('Erro ao carregar galeria pública:', error)
      setGalleryError('Não foi possível carregar as fotos agora.')
    } finally {
      setGalleryLoading(false)
    }
  }

  const handleOpenGallery = () => {
    if (!galleryImages.length && !galleryLoading) {
      fetchGalleryImages()
    }
    setIsGalleryModalOpen(true)
  }

  // ==================== FUNÇÃO CORRIGIDA PARA ABRIR PAINEL ADM ====================
  const openAdminPanel = () => {
    setIsAdminPanelOpen(true)
  }

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(/images/hero-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      
      <PrivacyModal onAccepted={() => setIsPrivacyAccepted(true)} />
      <UserRegistrationModal 
        isPrivacyAccepted={isPrivacyAccepted}
        onComplete={(profile) => setUserProfile(profile)}
      />
      <ImproveKnowledgeModal 
        isOpen={isAdminSession && isImproveModalOpen}
        onClose={() => setIsImproveModalOpen(false)}
        lastUserMessage={lastBotContext.user}
        lastBotReply={lastBotContext.bot}
      />
      <WelcomeModal />
      <QualityModal isOpen={isQualityModalOpen} onClose={() => setIsQualityModalOpen(false)} />
      <TechnicalSupportModal isOpen={isTechSupportModalOpen} onClose={() => setIsTechSupportModalOpen(false)} />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />

      {/* Header (RESTAURADO e Funcional) */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo-quanton3d.png" alt="Quanton3D" className="h-20 w-auto" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quanton3D
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resinas UV SLA de Alta Performance</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#produtos" className="text-sm font-medium hover:text-blue-600 transition-colors">Produtos</a>
            <a href="#servicos" className="text-sm font-medium hover:text-blue-600 transition-colors">Serviços</a>
            <a href="#informacoes-tecnicas" className="text-sm font-medium hover:text-blue-600 transition-colors">Informações Técnicas</a>
            <button
              onClick={openAdminPanel} 
              className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-blue-600 transition-colors"
              title="Painel Administrativo"
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-start gap-8">
          {/* Novo Robô - POSICIONADO À ESQUERDA */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex-shrink-0 ml-8"
            onClick={() => { setChatMode('suporte'); setIsChatOpen(true); }}
            style={{ cursor: 'pointer' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-30"></div>
            <div className="relative w-64 rounded-3xl shadow-2xl border-4 border-blue-400/50 overflow-hidden hover:scale-105 transition-transform duration-300">
              <video
                src="/images/ai-robot-animated.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-auto block"
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-2xl shadow-xl border-2 border-blue-300/50 animate-pulse whitespace-nowrap text-sm">
              <p className="text-center font-bold">
                Clique para falar comigo! 🤖
              </p>
            </div>
          </motion.div>

          {/* Área de conteúdo à direita */}
          <div className="flex-1"></div>
        </div>
      </section>

      {/* Seção de Botões */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-6xl mx-auto"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {/* Botões do Hero */}
            <Button 
              className="neon-button text-base px-6 py-3"
              onClick={handleOpenContact} 
            >
              Fale Conosco
            </Button>
            <Button 
              className="neon-button text-base px-6 py-3"
              onClick={() => setIsAboutModalOpen(true)}
            >
              Saiba Mais
            </Button>
            <Button 
              className="neon-button text-base px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={handleOpenCustomForm}
            >
              <Beaker className="h-5 w-5 mr-2" />
              Formulação Customizada
            </Button>
            <Button 
              className="neon-button text-base px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
              onClick={() => setIsQualityModalOpen(true)}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Alta Qualidade
            </Button>
            
            {/* Botões de Suporte Técnico (integrados aqui) */}
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('/guias/guia-nivelamento.html', '_blank')}>Nivelamento de Plataforma</Button>
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('/guias/guia-configuracao-fatiadores.html', '_blank')}>Configuração de Fatiadores</Button>
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('/guias/guia-diagnostico-problemas.html', '_blank')}>Diagnóstico de Problemas</Button>
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('https://wa.me/553132716935', '_blank')}>Atendimento Prioritário</Button>
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('/guias/guia-calibracao-quanton3d.html', '_blank')}>Calibração de Resina</Button>
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('/guias/guia-posicionamento-suportes.html', '_blank')}>Posicionamento de Suportes</Button>
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('/guias/guia-manutencao-impressora.html', '_blank')}>Manutenção de Máquina</Button>
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('/guias/guia-otimizacao-parametros.html', '_blank')}>Otimização de Parâmetros</Button>
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('/guias/parceiros-quanton3d.html', '_blank')}>Parceiros</Button>
            <Button className="neon-button text-base px-6 py-3" onClick={() => window.open('https://wa.me/553132716935', '_blank')}>Chamadas de Vídeo</Button>
          </div>
        </motion.div>
      </section>

      {/* Resin Cards Section (TAREFA 1) - REMOVIDO: Duplicidade com modal Alta Qualidade */}
      {/* <ResinCards /> */}

      {/* Technical Tabs Section (TAREFA 2) - REMOVIDO: Botões unificados na seção hero */}
      {/* <TechnicalTabs /> */} 

      {/* Galeria de Fotos - Movida para cima */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-2xl font-bold text-center text-white drop-shadow-lg">
            Colabore com sua experiência de configurações
          </h3>
          <Button 
            onClick={handleOpenGallerySubmit}
            className="neon-button text-xl font-bold flex items-center gap-3"
          >
            <Camera className="h-7 w-7" />
            Compartilhar minhas configurações
          </Button>
          <p className="text-base text-white drop-shadow-md text-center max-w-xl">
            Envie uma foto da sua peça e os tempos que usou no Chitubox. Após revisão, publicamos na galeria pública para ajudar outros clientes.
          </p>
          {gallerySuccessMessage && (
            <p className="text-sm text-emerald-300 drop-shadow text-center">
              {gallerySuccessMessage}
            </p>
          )}
          <button
            type="button"
            onClick={handleOpenGallery}
            className="text-sm text-white/80 underline-offset-4 hover:underline"
            disabled={galleryLoading}
          >
            {galleryLoading ? 'Carregando galeria...' : 'Ver galeria pública (fotos aprovadas)'}
          </button>
          {galleryError && (
            <p className="text-sm text-red-300 drop-shadow text-center">
              {galleryError}
            </p>
          )}
          {!galleryError && galleryImages.length > 0 && (
            <p className="text-sm text-white/80 drop-shadow text-center">
              {galleryImages.length} registros disponíveis na galeria.
            </p>
          )}
        </div>
      </section>

      {/* Parameters Selector Section (TAREFA 3) */}
      <ParametersSelector />

      {/* Documents Section */}
      <DocumentsSection />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-80">
            © 2025 Quanton3D. Todos os direitos reservados.
          </p>
          <p className="text-xs opacity-60 mt-2">
            Fabricação especializada de resinas UV SLA
          </p>
        </div>
      </footer>

      {/* ChatBot, Menu Selector, Service Modal, Privacy Modal */}
      <ChatBot 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
        mode={chatMode}
        userProfile={userProfile}
        showInternalActions={isAdminSession}
        onImproveKnowledge={isAdminSession ? () => setIsImproveModalOpen(true) : undefined}
        onConversationSnapshot={(snapshot) => setLastBotContext(snapshot)}
      />
      <MenuSelector onSelect={handleMenuSelect} isChatOpen={isChatOpen} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      <ServiceModal 
        isOpen={modalService !== null} 
        onClose={() => setModalService(null)} 
        service={modalService} 
      />
      <CustomFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
      />
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <GalleryModal 
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        images={galleryImages}
      />
      <GallerySubmitModal 
        isOpen={isGallerySubmitOpen}
        onClose={() => setIsGallerySubmitOpen(false)}
        apiBaseUrl={API_BASE_URL}
        onSuccess={handleGallerySubmissionSuccess}
      />

      {/* Admin Panel Modal - ISOLADO */}
      {isAdminPanelOpen && (
        <AuthWrapper>
          {({ onLogout }) => (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
              <div className="absolute inset-0" onClick={() => setIsAdminPanelOpen(false)} />
              <div className="relative h-full overflow-auto">
                <AdminPanel 
                  onClose={() => setIsAdminPanelOpen(false)} 
                  onLogout={() => {
                    onLogout();
                    setIsAdminPanelOpen(false);
                    setIsAdminSession(false);   // Garantia de limpeza do estado admin
                  }}
                />
              </div>
            </div>
          )}
        </AuthWrapper>
      )}
    </div>
  )
}

export default App
