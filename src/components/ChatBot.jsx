import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card } from '@/components/ui/card.jsx'
import { Send, X, MessageCircle, User, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Olá! Sou o assistente virtual da Quanton3D IA. Diga o que está acontecendo com sua impressão 3D e vou tentar ajudar.',
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

    try {
      const response = await fetch("https://quanton3d-bot-v2.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Você é o QuantonBot3D IA, um especialista em impressão 3D SLA/DLP que responde de forma técnica, educada e detalhada." },
            ...messages.map(msg => ({
              role: msg.type === "user" ? "user" : "assistant",
              content: msg.text
            })),
            { role: "user", content: inputValue }
          ]
        }),
      })

      const data = await response.json()

      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: data.reply || "⚠️ Erro: IA não respondeu corretamente.",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "⚠️ Ocorreu um erro ao conectar com a IA. Tente novamente em instantes.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
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
        text: `Olá ${userName}! Seu número ${userPhone} foi registrado. Como posso ajudá-lo hoje?`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, welcomeMessage])
    }
  }

  return (
    <>
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
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Quanton3D IA</h3>
                    <p className="text-white/80 text-xs">Assistente Virtual GPT</p>
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

              {showContactForm && (
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border-b">
                  <p className="text-sm font-semibold mb-3 text-blue-900 dark:text-blue-100">
                    Para começar, por favor informe:
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="Seu nome" value={userName} onChange={(e) => setUserName(e.target.value)} />
                    <Input placeholder="Seu telefone" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} />
                    <Button onClick={handleContactSubmit} disabled={!userName || !userPhone} className="w-full bg-blue-600 hover:bg-blue-700">
                      Iniciar conversa
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.type === 'bot' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.type === 'user' ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.type === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
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

              <div className="p-4 border-t bg-white dark:bg-gray-900">
                <div className="flex gap-2">
                  <Input placeholder="Digite sua mensagem..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} disabled={showContactForm} className="flex-1" />
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim() || showContactForm} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
