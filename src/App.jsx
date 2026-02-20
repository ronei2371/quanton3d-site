// Arquivo: quanton3d-site/src/App.jsx
// (Código FINAL que conserta o cabeçalho, robô, lógica e a leitura de dados)
// REDESIGN COMPLETO - Build: 2025-12-15 00:48 UTC

import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'
import { ChatBot } from '@/components/ChatBot.jsx'
import { MenuSelector } from '@/components/MenuSelector.jsx'
import TechnicalTabs from '@/components/TechnicalTabs.jsx'
import { DocumentsSection } from '@/components/DocumentsSection.jsx'
import { ServiceModal } from '@/components/ServiceModal.jsx'
import { PrivacyModal } from '@/components/PrivacyModal.jsx'
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
import { Beaker, Cpu, Sparkles, ChevronRight, Shield, Camera, Brain, Layers, RadioTower } from 'lucide-react'
import { motion } from 'framer-motion'
import './App.css'

const RAW_API_URL = (import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com/api')
const PUBLIC_API_BASE = RAW_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '')

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
      const response = await fetch(`${PUBLIC_API_BASE}/visual-knowledge?limit=50`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      const normalized = Array.isArray(data.items) ? data.items : []
      const formatted = normalized
        .map(item => ({
          url: item.imageUrl || item.image || '',
          desc: item.title || item.description || ''
        }))
        .filter(item => item.url)
      setGalleryImages(formatted)
      if (!formatted.length) {
        setGalleryError('Nenhuma foto enviada ainda. Seja o primeiro a compartilhar!')
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

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(/images/hero-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      
      <PrivacyModal />
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
              onClick={() => setIsAdminPanelOpen(true)} 
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
        <div className="hero-grid">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-visual"
            onClick={() => { setChatMode('suporte'); setIsChatOpen(true); }}
          >
            <div className="hero-visual__glow" />
            <div className="hero-visual__frame">
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
            <div className="hero-visual__tag">
              <span>Fale com o QuantonBot</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="hero-content glass-panel"
          >
            <p className="hero-pill">IA oficial Quanton3D • suporte em tempo real</p>
            <h2 className="hero-title">
              Inteligência aplicada a <span>resinas industriais</span> e produção 24/7.
            </h2>
            <p className="hero-description">
              Combine diagnósticos guiados, parâmetros oficiais e galerias colaborativas em uma plataforma única. O QuantonBot aprende com cada cliente para sugerir ajustes, prever falhas e acelerar a validação de presets.
            </p>

            <div className="hero-actions">
              <Button onClick={() => { setChatMode('suporte'); setIsChatOpen(true); }} className="hero-cta">
                Abrir QuantonBot
                <ChevronRight className="h-4 w-4" />
              </Button>
              <button className="hero-secondary" onClick={handleOpenGallerySubmit}>
                Compartilhar parâmetros
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Perfis ativos</span>
                <strong className="stat-value">459+</strong>
                <p className="stat-hint">Banco oficial de parâmetros homologados</p>
              </div>
              <div className="stat-card">
                <span className="stat-label">Diagnósticos/h</span>
                <strong className="stat-value">320</strong>
                <p className="stat-hint">Detecção automática de delaminação, adesão e suportes</p>
              </div>
              <div className="stat-card">
                <span className="stat-label">Galeria colaborativa</span>
                <strong className="stat-value">1.200+</strong>
                <p className="stat-hint">Fotos, presets e notas de clientes Quanton</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Destaques rápidos */}
      <section className="container mx-auto px-4 py-8">
        <div className="feature-grid">
          <div className="feature-card glass-panel">
            <Brain className="h-8 w-8 text-cyan-300" />
            <h3>Diagnósticos guiados</h3>
            <p>Motor de IA treinado com casos reais de impressão e biblioteca de defeitos específicos de resina.</p>
          </div>
          <div className="feature-card glass-panel">
            <Layers className="h-8 w-8 text-emerald-300" />
            <h3>Parametrização oficial</h3>
            <p>459 perfis homologados, compatíveis com as principais linhas Quanton e impressoras industriais.</p>
          </div>
          <div className="feature-card glass-panel">
            <RadioTower className="h-8 w-8 text-purple-300" />
            <h3>Monitoramento ativo</h3>
            <p>Alertas do QuantonBot, métricas em tempo real e painel admin com aprovação de conhecimento.</p>
          </div>
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
      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} mode={chatMode} />
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
              apiBaseUrl={PUBLIC_API_BASE}
              onSuccess={handleGallerySubmissionSuccess}
            />

            {/* Admin Panel Modal */}
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
