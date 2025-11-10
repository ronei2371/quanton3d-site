// Arquivo: quanton3d-site/src/components/MenuSelector.jsx
// (Este é o código ATUALIZADO. O "Robozinho" agora abre o CHAT. O Modal é controlado pelo App.jsx)

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ShoppingBag, Phone } from 'lucide-react';
import robotAnimated from '../assets/robot-animated.gif'; // O robô animado

// ===== MUDANÇA IMPORTANTE =====
// O App.jsx agora controla o modal (isModalOpen, setIsModalOpen)
// E nos dá a função para ABRIR O CHAT (onOpenChat)
export function MenuSelector({ onSelect, isChatOpen, isModalOpen, setIsModalOpen, onOpenChat }) {
  const [showText, setShowText] = useState(false);

  // Mostra a mensagem "Estou aqui..." 3 segundos depois que a página carrega
  useEffect(() => {
    const timer = setTimeout(() => {
      // Só mostra o texto se o chat e o modal estiverem fechados
      if (!isChatOpen && !isModalOpen) {
        setShowText(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isChatOpen, isModalOpen]);

  // Esconde o robô e a mensagem se o chat OU o modal estiverem abertos
  if (isChatOpen || isModalOpen) {
    return null;
  }
  
  const handleSelect = (option) => {
    onSelect(option); // Envia o comando para o App.jsx ('suporte', 'vendas' ou 'atendente')
  };

  return (
    <>
      {/* ===== MELHORIA: ROBÔ MAIOR + MENSAGEM ===== */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
        
        {/* A Mensagem */}
        <AnimatePresence>
          {showText && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-5 right-[100px] w-max bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg"
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Estou aqui se precisar!</p>
              <div className="absolute right-[-5px] top-1/2 w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 -translate-y-1/2"></div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* O Robô (Maior) */}
        <button
          onClick={onOpenChat} // <-- MUDANÇA: AGORA CHAMA A FUNÇÃO PARA ABRIR O CHAT
          className="bg-transparent border-none p-0 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="Abrir chat de dúvidas"
          style={{ width: '80px', height: '80px' }} // Tamanho maior
        >
          <img src={robotAnimated} alt="Assistente" className="w-full h-full object-cover rounded-full" />
        </button>
      </div>
      {/* ===== FIM DA MELHORIA ===== */}


      {/* O Modal "SELECIONE UMA OPÇÃO" */}
      <AnimatePresence>
        {/* O modal agora só aparece se o "interruptor" (isModalOpen) do App.jsx estiver ligado */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-xl shadow-xl overflow-hidden"
              style={{ 
                backgroundImage: "url('/menu-bg.gif')",
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
              }}
            >
              <div className="relative bg-white/10 dark:bg-gray-900/50 backdrop-blur-2xl">
                
                {/* Botão de Fechar */}
                <button 
                  onClick={() => setIsModalOpen(false)} // <-- MUDANÇA: Agora usa o "interruptor" do App.jsx
                  className="absolute top-4 right-4 text-white/70 hover:text-white/100"
                >
                  <X size={24} />
                </button>

                <div className="p-8 md:p-12 text-center">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    SELECIONE UMA OPÇÃO
                  </h2>
                  <p className="text-lg text-white/80 mb-10">
                    Como podemos ajudá-lo hoje?
                  </p>

                  <div className="grid md:grid-cols-3 gap-6">
                    
                    {/* Botão 1: Suporte Técnico */}
                    <button
                      onClick={() => handleSelect('suporte')}
                      className="p-6 bg-white/20 dark:bg-gray-800/50 rounded-lg text-white text-left transition-all hover:bg-white/30 hover:scale-105 border border-white/20"
                    >
                      <MessageSquare size={32} className="mb-3 text-blue-300" />
                      <h3 className="text-xl font-semibold mb-1">Suporte Técnico</h3>
                      <p className="text-sm opacity-80">Assistência especializada em impressão 3D</p>
                    </button>
                    
                    {/* Botão 2: Vendas e Produtos */}
                    <button
                      onClick={() => handleSelect('vendas')}
                      className="p-6 bg-white/20 dark:bg-gray-800/50 rounded-lg text-white text-left transition-all hover:bg-white/30 hover:scale-105 border border-white/20"
                    >
                      <ShoppingBag size={32} className="mb-3 text-purple-300" />
                      <h3 className="text-xl font-semibold mb-1">Vendas e Produtos</h3>
                      <p className="text-sm opacity-80">Conheça nossas resinas UV SLA</p>
                    </button>
                    
                    {/* Botão 3: Falar com Atendente (WhatsApp) */}
                    <button
                      onClick={() => handleSelect('atendente')}
                      className="p-6 bg-white/20 dark:bg-gray-800/50 rounded-lg text-white text-left transition-all hover:bg-white/30 hover:scale-105 border border-white/20"
                    >
                      <Phone size={32} className="mb-3 text-green-300" />
                      <h3 className="text-xl font-semibold mb-1">Falar com Atendente</h3>
                      <p className="text-sm opacity-80">Atendimento humano personalizado</p>
                    </button>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
