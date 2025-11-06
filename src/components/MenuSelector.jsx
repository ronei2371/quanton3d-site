import { useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, ShoppingCart, MessageSquare, X } from 'lucide-react'

export function MenuSelector({ onSelect, isChatOpen }) {
  const [isOpen, setIsOpen] = useState(false)

  const menuOptions = [
    {
      id: 'suporte',
      title: 'Suporte Técnico',
      description: 'Assistência especializada em impressão 3D',
      icon: Headphones,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'vendas',
      title: 'Vendas e Produtos',
      description: 'Conheça nossas resinas UV SLA',
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'atendente',
      title: 'Falar com Atendente',
      description: 'Atendimento humano personalizado',
      icon: MessageSquare,
      gradient: 'from-green-500 to-emerald-500'
    }
  ]

  const handleOptionClick = (optionId) => {
    onSelect(optionId)
    setIsOpen(false)
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && !isChatOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <MessageSquare className="h-8 w-8 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <Card 
              className="relative w-full max-w-4xl h-[600px] shadow-2xl border-4 border-blue-400 dark:border-blue-600 overflow-hidden"
              style={{
                backgroundImage: 'url(/menu-bg.gif)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-[2px]" />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 h-12 w-12 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                    SELECIONE UMA OPÇÃO
                  </h2>
                  <p className="text-xl text-blue-100 drop-shadow-lg">
                    Como podemos ajudá-lo hoje?
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
                  {menuOptions.map((option, index) => {
                    const Icon = option.icon
                    return (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <button
                          onClick={() => handleOptionClick(option.id)}
                          className="group relative w-full p-6 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 hover:border-white/40 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        >
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                                {option.title}
                              </h3>
                              <p className="text-sm text-blue-100 drop-shadow">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
