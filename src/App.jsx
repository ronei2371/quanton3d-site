// Arquivo: quanton3d-site/src/App.jsx
// (Este é o código ATUALIZADO que corrige o "Falar com Atendente")

import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'
import { ChatBot } from '@/components/ChatBotNew.jsx'
import { MenuSelector } from '@/components/MenuSelector.jsx'
import { TechnicalTabs } from '@/components/TechnicalTabs.jsx'
import { DocumentsSection } from '@/components/DocumentsSection.jsx'
import { ServiceModal } from '@/components/ServiceModal.jsx'
import { PrivacyModal } from '@/components/PrivacyModal.jsx'
import ResinCards from '@/components/ResinCards.jsx'
import ParametersSelector from '@/components/ParametersSelector.jsx'
import { Beaker, Cpu, Sparkles, Phone, Mail, MapPin, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import logo from './assets/logo.png'
import './App.css'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMode, setChatMode] = useState('suporte')
  const [modalService, setModalService] = useState(null)

  // ===== INÍCIO DA CORREÇÃO =====
  // Esta função agora sabe o que fazer com cada botão
  const handleMenuSelect = (option) => {
    if (option === 'suporte' || option === 'vendas') {
      // Abre o chat
      setChatMode(option);
      setIsChatOpen(true);
    } else if (option === 'atendente') {
      // Abre o WhatsApp (conforme a "LISTA DE TAREFAS")
      window.open('https://wa.me/553132716935', '_blank');
    }
  }
  // ===== FIM DA CORREÇÃO =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Quanton3D" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quanton3D
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Resinas UV SLA de Alta Performance</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#produtos" className="text-sm font-medium hover:text-blue-600 transition-colors">Produtos</a>
            <a href="#servicos" className="text-sm font-medium hover:text-blue-600 transition-colors">Serviços</a>
            <a href="#informacoes-tecnicas" className="text-sm font-medium hover:text-blue-600 transition-colors">Informações Técnicas</a>
            <a href="#contato" className="text-sm font-medium hover:text-blue-600 transition-colors">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        {/* ... (O resto do seu código Hero... não precisa mudar) ... */}
      </section>

      {/* Resin Cards Section */}
      <ResinCards />

      {/* Produtos Section (OLD - WILL BE REMOVED) */}
      <section id="produtos" style={{display: 'none'}} className="container mx-auto px-4 py-20">
         {/* ... (O resto do seu código de Produtos... não precisa mudar) ... */}
      </section>

      {/* Serviços Section */}
      <section id="servicos" className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 py-20">
         {/* ... (O resto do seu código de Serviços... não precisa mudar) ... */}
      </section>

      {/* Parameters Selector Section */}
      <ParametersSelector />

      {/* Technical Tabs Section */}
      <TechnicalTabs />

      {/* Documents Section */}
      <DocumentsSection />

      {/* Contato Section */}
      <section id="contato" className="container mx-auto px-4 py-20">
         {/* ... (O resto do seu código de Contato... não precisa mudar) ... */}
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-8">
         {/* ... (O resto do seu código de Footer... não precisa mudar) ... */}
      </footer>

      {/* ChatBot */}
      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} mode={chatMode} />
      
      {/* Menu Selector */}
      <MenuSelector onSelect={handleMenuSelect} isChatOpen={isChatOpen} />
      
      {/* Service Modal */}
      <ServiceModal 
        isOpen={modalService !== null} 
        onClose={() => setModalService(null)} 
        service={modalService} 
      />
      
      {/* Privacy Modal */}
      <PrivacyModal />
    </div>
  )
}

export default App
