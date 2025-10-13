import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card } from '@/components/ui/card.jsx'
import { Send, X, MessageCircle, User, Bot, History, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Olá! Sou o assistente virtual da Quanton3D. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [showContactForm, setShowContactForm] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    if (showContactForm && (!userName || !userPhone)) {
      alert('Por favor, preencha seu nome e telefone antes de enviar mensagens.')
      return
    }

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simular resposta do bot com base em palavras-chave
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue.toLowerCase())
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const generateBotResponse = (input) => {
    // Respostas baseadas em palavras-chave
    if (input.includes('resina') || input.includes('material')) {
      return 'Temos diversas opções de resinas UV SLA para impressão 3D! Nossas resinas são formuladas para diferentes aplicações: padrão, flexível, resistente, biocompatível e muito mais. Qual tipo de aplicação você precisa?'
    }
    
    if (input.includes('preço') || input.includes('valor') || input.includes('custo')) {
      return 'Para informações sobre preços e orçamentos, por favor entre em contato conosco pelo telefone (31) 3271-6935 ou email atendimento@quanton3d.com.br. Teremos prazer em preparar um orçamento personalizado!'
    }
    
    if (input.includes('impressora') || input.includes('equipamento')) {
      return 'Trabalhamos com diversas impressoras 3D SLA/DLP. Posso ajudá-lo com configurações, calibração, nivelamento de plataforma e otimização de parâmetros de impressão. Qual é sua dúvida específica?'
    }
    
    if (input.includes('suporte') || input.includes('problema') || input.includes('ajuda')) {
      return 'Oferecemos suporte técnico completo! Posso ajudá-lo com:\n\n• Nivelamento de plataforma\n• Calibração de resina\n• Configuração de fatiadores (Chitubox, etc.)\n• Posicionamento de suportes\n• Diagnóstico de problemas\n\nSobre qual desses tópicos você precisa de ajuda?'
    }
    
    if (input.includes('agendar') || input.includes('atendimento') || input.includes('chamada')) {
      return 'Posso agendar um atendimento técnico personalizado para você! Nossa equipe está disponível para chamadas de vídeo e suporte detalhado. Qual seria o melhor horário para você? (Segunda a Sexta, 8h às 18h)'
    }
    
    if (input.includes('olá') || input.includes('oi') || input.includes('bom dia') || input.includes('boa tarde') || input.includes('boa noite')) {
      return `Olá${userName ? ', ' + userName : ''}! Seja bem-vindo à Quanton3D. Estou aqui para ajudá-lo com informações sobre nossas resinas UV SLA, suporte técnico e muito mais. Como posso ajudá-lo?`
    }
    
    if (input.includes('horário') || input.includes('funcionamento')) {
      return 'Nosso horário de atendimento é de Segunda a Sexta-feira, das 8h às 18h. Você pode nos contatar por telefone (31) 3271-6935 ou email atendimento@quanton3d.com.br'
    }
    
    // Resposta padrão
    return 'Entendo sua pergunta. Para melhor atendê-lo, recomendo que entre em contato com nossa equipe técnica pelo telefone (31) 3271-6935 ou email atendimento@quanton3d.com.br. Também posso agendar um atendimento personalizado para você. Deseja agendar?'
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleContactSubmit = () => {
    if (userName && userPhone) {
      setShowContactForm(false)
      const welcomeMessage = {
        id: messages.length + 1,
        type: 'bot',
        text: `Olá ${userName}! Obrigado por entrar em contato. Seu número ${userPhone} foi registrado. Como posso ajudá-lo hoje?`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, welcomeMessage])
    }
  }

  return (
    <>
      {/* Botão flutuante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
            >
              <MessageCircle className="h-8 w-8 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Janela do chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]"
          >
            <Card className="h-full flex flex-col shadow-2xl border-2 border-blue-200 dark:border-blue-900 overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Quanton3D IA</h3>
                    <p className="text-white/80 text-xs">Assistente Virtual</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Formulário de contato */}
              {showContactForm && (
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border-b">
                  <p className="text-sm font-semibold mb-3 text-blue-900 dark:text-blue-100">
                    Para melhor atendê-lo, por favor informe:
                  </p>
                  <div className="space-y-2">
                    <Input
                      placeholder="Seu nome"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-white dark:bg-gray-800"
                    />
                    <Input
                      placeholder="Seu telefone"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="bg-white dark:bg-gray-800"
                    />
                    <Button
                      onClick={handleContactSubmit}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!userName || !userPhone}
                    >
                      Iniciar Conversa
                    </Button>
                  </div>
                </div>
              )}

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.type === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white dark:bg-gray-900">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={showContactForm}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || showContactForm}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

