// Arquivo: quanton3d-site/src/App.jsx
// (Este é o código ATUALIZADO que TROCA a função dos botões)

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
  const [isModalOpen, setIsModalOpen] = useState(false) // <-- NOVO INTERRUPTOR (para o modal)
  const [chatMode, setChatMode] = useState('suporte')
  const [modalService, setModalService] = useState(null)

  // ===== INÍCIO DA CORREÇÃO =====
  // Esta função agora é chamada pelo MODAL
  const handleMenuSelect = (option) => {
    setIsModalOpen(false); // Fecha o modal
    
    if (option === 'suporte' || option === 'vendas') {
      // Abre o chat no modo correto
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
        {/* ... (O resto do seu código Header... não precisa mudar) ... */}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        {/* ... (O resto do seu código Hero... não precisa mudar) ... */}
      </section>

      {/* Resin Cards Section */}
      <ResinCards />

      {/* Produtos Section (OLD) */}
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

      {/* ===== LÓGICA TROCADA ===== */}
      
      {/* O Botão Roxo agora abre o MODAL */}
      <ChatBot 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
        mode={chatMode} 
        isModalOpen={isModalOpen} // Informa o chat sobre o modal
        onOpenModal={() => setIsModalOpen(true)} // <-- NOVA FUNÇÃO
      />
      
      {/* O Robozinho da Direita agora abre o CHAT (em modo suporte) */}
      <MenuSelector 
        onSelect={handleMenuSelect} // Continua controlando o modal
        isModalOpen={isModalOpen} // Passa o controle do modal
        setIsModalOpen={setIsModalOpen} // Passa o controle do modal
        onOpenChat={() => { // <-- NOVA FUNÇÃO
          setChatMode('suporte');
          setIsChatOpen(true);
        }}
      />
      
      {/* ===== FIM DA LÓGICA TROCADA ===== */}
      
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
