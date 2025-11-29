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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      
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
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Resinas UV SLA de
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Alta Performance
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Fabricação especializada de resinas UV para impressão 3D SLA/DLP. 
              Soluções customizadas para odontologia, medicina, indústria e muito mais.
            </p>
            <div className="flex gap-4">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                onClick={handleOpenContact} 
              >
                Fale Conosco
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-6 text-lg"
                onClick={() => setIsAboutModalOpen(true)}
              >
                Saiba Mais
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>
            <Card className="relative p-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-2 border-blue-200 dark:border-blue-900">
              <div className="space-y-6">
                <div className="flex items-start gap-4 cursor-pointer" onClick={handleOpenCustomForm}>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Beaker className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Formulação Customizada</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Desenvolvemos resinas específicas para sua aplicação
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors" onClick={() => setIsTechSupportModalOpen(true)}>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Cpu className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Suporte Técnico Completo</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Assistência especializada em impressão 3D SLA/DLP
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors" onClick={() => setIsQualityModalOpen(true)}>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Alta Qualidade</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      FISPQs, certificados e controle rigoroso de qualidade
                    </p>
                  </div>
                </div>
              </div>
            </Card>
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
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-3">
          <Button 
            onClick={() => setIsGalleryModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg flex items-center gap-2"
          >
            <Camera className="h-5 w-5" />
            Galeria de Fotos
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center max-w-xl">
            Veja as impressoes de outros clientes e compartilhe sua peca com os parametros que voce utilizou.
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
