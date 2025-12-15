// Arquivo: quanton3d-site/src/App.jsx
// (Código FINAL que conserta o cabeçalho, robô, lógica e a leitura de dados)

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
import { GalleryModal } from '@/components/GalleryModal.jsx'
import { Beaker, Cpu, Sparkles, ChevronRight, Shield, Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import './App.css'

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
                          className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors"
                          title="Painel Administrativo"
                        >
                          <Shield className="h-4 w-4" />
                          Admin
                        </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              Resinas UV SLA de
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Alta Performance
              </span>
            </h2>
            <p className="text-xl text-white drop-shadow-md mb-8">
              Fabricação especializada de resinas UV para impressão 3D SLA/DLP. 
              Soluções customizadas para odontologia, medicina, indústria e muito mais.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button 
                  className="neon-button text-lg flex items-center gap-2 flex-1"
                  onClick={handleOpenContact} 
                >
                  Fale Conosco
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
                <Button 
                  className="neon-button text-lg flex items-center gap-2 flex-1"
                  onClick={() => setIsAboutModalOpen(true)}
                >
                  Saiba Mais
                </Button>
              </div>
              <Button 
                className="neon-button text-lg flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                onClick={handleOpenCustomForm}
              >
                <Beaker className="h-5 w-5" />
                Formulação Customizada
              </Button>
              <Button 
                className="neon-button text-lg flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                onClick={() => setIsQualityModalOpen(true)}
              >
                <Sparkles className="h-5 w-5" />
                Alta Qualidade
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-30"></div>
            <img 
              src="/images/ai-robot.jpg" 
              alt="IA Quanton3D" 
              className="relative w-full max-w-md h-auto rounded-3xl shadow-2xl border-4 border-blue-400/50"
            />
          </motion.div>
        </div>
      </section>

      {/* Resin Cards Section (TAREFA 1) - REMOVIDO: Duplicidade com modal Alta Qualidade */}
      {/* <ResinCards /> */}

      {/* Technical Tabs Section (TAREFA 2) */}
      <TechnicalTabs /> 

      {/* Parameters Selector Section (TAREFA 3) */}
      <ParametersSelector />

      {/* Galeria de Fotos - Abaixo dos Parametros */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Colabore com sua experiência de configurações
          </h3>
          <Button 
            onClick={() => setIsGalleryModalOpen(true)}
            className="neon-button text-xl font-bold flex items-center gap-3"
          >
            <Camera className="h-7 w-7" />
            Galeria de Fotos
          </Button>
          <p className="text-base text-black text-center max-w-xl">
            Veja as impressões de outros clientes e compartilhe sua peça com os parâmetros que você utilizou.
          </p>
        </div>
      </section>

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
      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} mode={chatMode} onOpenModal={() => setIsModalOpen(true)} isModalOpen={isModalOpen} />
      <MenuSelector onSelect={handleMenuSelect} isChatOpen={isChatOpen} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} onOpenChat={() => { setChatMode('suporte'); setIsChatOpen(true); }} />
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
            />

            {/* Admin Panel Modal */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsAdminPanelOpen(false)} />
          <div className="relative h-full overflow-auto">
            <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
