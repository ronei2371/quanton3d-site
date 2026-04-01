import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Sparkles } from 'lucide-react'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Verificar se já viu a tela de boas-vindas
    const hasSeenWelcome = localStorage.getItem('quanton3d_welcome_seen')
    const hasAcceptedTerms = localStorage.getItem('quanton3d_privacy_accepted')
    
    if (hasAcceptedTerms && !hasSeenWelcome) {
      // Pequeno delay para transição suave após fechar PrivacyModal
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleStart = () => {
    localStorage.setItem('quanton3d_welcome_seen', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        style={{ pointerEvents: 'all' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-1 shadow-2xl">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8">
              {/* Imagem Linda */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <img 
                      src="/robot-welcome-quanton.png" 
                      alt="Bem-vindo à Quanton3D" 
                      className="w-full max-w-md h-auto rounded-2xl shadow-2xl"
                    />
                  </motion.div>
                  
                  {/* Efeito de brilho */}
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30"
                    animate={{ 
                      opacity: [0.2, 0.4, 0.2],
                      scale: [0.95, 1.05, 0.95]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>

              {/* Texto de Boas-vindas */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-8"
              >
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                  Bem-vindo(a) à Quanton3D!
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                  Obrigado por escolher a <strong className="text-purple-600">Quanton3D</strong>!
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Estamos aqui para te ajudar com tudo sobre impressão 3D e resinas UV.
                </p>
              </motion.div>

              {/* Dicas Rápidas */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-6 mb-8"
              >
                <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  💡 Dica:
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pergunte sobre resinas, troubleshooting, parâmetros de impressão ou qualquer dúvida técnica!
                  Nosso assistente virtual está disponível <strong>24/7</strong> para te ajudar.
                </p>
              </motion.div>

              {/* Botão Começar */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center"
              >
                <Button
                  onClick={handleStart}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  🚀 Começar Agora!
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
