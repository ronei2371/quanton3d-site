import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card } from '@/components/ui/card.jsx'
import { X, Send, Bot, User, Image as ImageIcon, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatBot({ isOpen, setIsOpen, mode }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [showContactForm, setShowContactForm] = useState(true)
  const [showTerms, setShowTerms] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showSuggestionForm, setShowSuggestionForm] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const sessionId = useRef(`session-${Date.now()}`).current

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !showContactForm && messages.length === 0) {
      const modeMessages = {
        suporte: 'Olá! Sou o QuantonBot3D, seu assistente técnico especializado em impressão 3D com resinas Quanton3D. Como posso ajudá-lo hoje?',
        vendas: 'Olá! Sou o QuantonBot3D. Estou aqui para ajudá-lo a escolher a resina Quanton3D perfeita para seu projeto. Qual tipo de aplicação você tem em mente?',
        atendente: 'Olá! Sou o QuantonBot3D. Vou conectá-lo com nossa equipe de atendimento. Enquanto isso, em que posso ajudar?'
      }

      setMessages([{
        id: Date.now(),
        type: 'bot',
        text: modeMessages[mode] || modeMessages.suporte,
        timestamp: new Date()
      }])
    }
  }, [isOpen, showContactForm, mode])

  const handleSetIsOpen = (value) => {
    setIsOpen(value)
  }

  const handleContactSubmit = () => {
    if (userName && userPhone) {
      setShowContactForm(false)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue || '[Imagem enviada]',
      timestamp: new Date(),
      image: imagePreview
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      let response
      
      if (selectedImage) {
        // Enviar com imagem
        const formData = new FormData()
        formData.append('image', selectedImage)
        formData.append('message', inputValue || 'Analise esta imagem')
        formData.append('sessionId', sessionId)
        formData.append('userName', userName)

        response = await fetch('https://quanton3d-bot-v2.onrender.com/ask-with-image', {
          method: 'POST',
          body: formData
        })
      } else {
        // Enviar apenas texto
        response = await fetch('https://quanton3d-bot-v2.onrender.com/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: inputValue,
            sessionId,
            userName
          })
        })
      }

      const data = await response.json()

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.reply,
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, botMessage])
      handleRemoveImage()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: '⚠️ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendSuggestion = async () => {
    if (!suggestion.trim()) return

    try {
      const response = await fetch('https://quanton3d-bot-v2.onrender.com/suggest-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestion,
          userName,
          userPhone,
          sessionId
        })
      })

      const data = await response.json()

      if (data.success) {
        const confirmMessage = {
          id: Date.now(),
          type: 'bot',
          text: '✅ Obrigado pela sugestão! Ela foi enviada para análise da equipe Quanton3D e poderá ser incorporada à base de conhecimento.',
          timestamp: new Date()
        }
        setMessages((prev) => [...prev, confirmMessage])
        setSuggestion('')
        setShowSuggestionForm(false)
      }
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
              onClick={() => handleSetIsOpen(true)}
              className="h-20 w-20 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 p-0 overflow-hidden relative group"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <img 
                src="/robot-icon.png" 
                alt="QuantonBot3D" 
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
            className="fixed bottom-6 right-6 z-50 w-[500px] h-[700px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]"
          >
            <Card className="h-full flex flex-col shadow-2xl border-2 border-blue-200 dark:border-blue-900 overflow-hidden" style={{backgroundImage: 'url(/chat-bg.gif)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    <img src="/robot-logo.png" alt="Bot" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Quanton3D IA</h3>
                    <p className="text-white/80 text-xs">Assistente Virtual GPT</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSetIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {showTerms && !termsAccepted && (
                <div className="p-6 bg-white dark:bg-gray-900 flex-1 overflow-y-auto">
                  <h3 className="text-lg font-bold mb-4 text-blue-900 dark:text-blue-100">Termos de Uso</h3>
                  <div className="text-sm space-y-3 text-gray-700 dark:text-gray-300 mb-4">
                    <p>Ao usar este assistente virtual, você concorda com os seguintes termos:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>As informações fornecidas são para fins informativos e de suporte técnico.</li>
                      <li>Seus dados (nome e telefone) serão usados apenas para atendimento e não serão compartilhados.</li>
                      <li>O assistente utiliza inteligência artificial e pode não ter todas as respostas.</li>
                      <li>Para questões complexas, recomendamos contato direto com nossa equipe.</li>
                      <li>O bot fornece suporte APENAS para resinas Quanton3D.</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSetIsOpen(false)} variant="outline" className="flex-1">
                      Não aceito
                    </Button>
                    <Button onClick={() => { setTermsAccepted(true); setShowTerms(false); }} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Aceito
                    </Button>
                  </div>
                </div>
              )}

              {showContactForm && termsAccepted && (
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
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src="/robot-logo.png" alt="Bot" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.type === 'user' ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
                      {msg.image && (
                        <img src={msg.image} alt="Enviada" className="rounded-lg mb-2 max-w-full" />
                      )}
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
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                      <img src="/robot-thinking.png" alt="Pensando" className="h-full w-full object-cover animate-pulse" />
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

              {showSuggestionForm && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-t">
                  <p className="text-sm font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                    💡 Sugerir Conhecimento
                  </p>
                  <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="Descreva a informação que você gostaria que fosse adicionada..."
                    className="w-full p-2 border rounded-lg text-sm mb-2 min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => setShowSuggestionForm(false)} variant="outline" size="sm" className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleSendSuggestion} size="sm" className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                      Enviar Sugestão
                    </Button>
                  </div>
                </div>
              )}

              {imagePreview && (
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 border-t">
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 border-t bg-white dark:bg-gray-900">
                <div className="flex gap-2 mb-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                    className="flex-shrink-0"
                  >
                    <Lightbulb className="h-4 w-4" />
                  </Button>
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
                    disabled={(!inputValue.trim() && !selectedImage) || showContactForm}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
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
