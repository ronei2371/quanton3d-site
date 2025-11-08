import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'
import { ChatBot } from '@/components/ChatBotNew.jsx'
import { MenuSelector } from '@/components/MenuSelector.jsx'
import { TechnicalTabs } from '@/components/TechnicalTabs.jsx'
import { DocumentsSection } from '@/components/DocumentsSection.jsx'
import { ServiceModal } from '@/components/ServiceModal.jsx'
import { PrivacyModal } from '@/components/PrivacyModal.jsx'
import { Beaker, Cpu, Sparkles, Phone, Mail, MapPin, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import logo from './assets/logo.png'
import './App.css'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMode, setChatMode] = useState('suporte')
  const [modalService, setModalService] = useState(null)

  const handleMenuSelect = (option) => {
    setChatMode(option)
    setIsChatOpen(true)
  }

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
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
                Fale Conosco
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg">
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
                <div className="flex items-start gap-4">
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
                <div className="flex items-start gap-4">
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
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Alta Qualidade</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Matérias-primas premium e controle rigoroso de qualidade
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Produtos Section */}
      <section id="produtos" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Nossas Resinas</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Soluções especializadas para cada aplicação
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              title: 'Resina Padrão',
              description: 'Ideal para protótipos e modelos gerais',
              features: ['Alta precisão', 'Ótimo acabamento', 'Custo-benefício', 'Versátil']
            },
            {
              title: 'Resina Flexível',
              description: 'Para aplicações que exigem elasticidade',
              features: ['Resistente a rasgos', 'Mantém flexibilidade', 'Durável', 'Ideal para borrachas']
            }
          ].map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-300 dark:hover:border-blue-700">
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {product.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{product.description}</p>
                <ul className="space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Serviços Section */}
      <section id="servicos" className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Suporte Técnico Especializado</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Assistência completa para sua impressão 3D
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Nivelamento de Plataforma', key: 'nivelamento' },
              { name: 'Calibração de Resina', key: 'calibracao' },
              { name: 'Configuração de Fatiadores', key: 'configuracao' },
              { name: 'Posicionamento de Suportes', key: 'posicionamento' },
              { name: 'Diagnóstico de Problemas', key: 'diagnostico' },
              { name: 'Otimização de Parâmetros', key: 'otimizacao' },
              { name: 'Chamadas de Vídeo', key: 'chamadas' },
              { name: 'Atendimento Prioritário', key: 'prioritario' }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card 
                  className="p-4 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 border-2"
                  onClick={() => setModalService(service.key)}
                >
                  <p className="font-semibold">{service.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Tabs Section */}
      <TechnicalTabs />

      {/* Documents Section */}
      <DocumentsSection />

      {/* Contato Section */}
      <section id="contato" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Entre em Contato</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Estamos prontos para atendê-lo
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold mb-2">Telefone</h3>
            <p className="text-gray-600 dark:text-gray-400">(31) 3271-6935</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold mb-2">Email</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">atendimento@quanton3d.com.br</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold mb-2">Horário</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Seg-Sex: 8h às 18h</p>
          </Card>
        </div>
      </section>

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

