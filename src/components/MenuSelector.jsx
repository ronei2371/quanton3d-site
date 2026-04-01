import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Phone, ShoppingBag, X } from 'lucide-react';

export function MenuSelector({ onSelect, isChatOpen, isModalOpen, setIsModalOpen }) {
  if (isChatOpen || isModalOpen) {
    return null;
  }

  const handleSelect = (option) => {
    onSelect(option);
  };

  return (
    <AnimatePresence>
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
              backgroundPosition: 'center',
            }}
          >
            <div className="relative bg-white/10 dark:bg-gray-900/50 backdrop-blur-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white/100"
              >
                <X size={24} />
              </button>

              <div className="p-8 md:p-12 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">SELECIONE UMA OPÇÃO</h2>
                <p className="text-lg text-white/80 mb-10">Como podemos ajudá-lo hoje?</p>

                <div className="grid md:grid-cols-3 gap-6">
                  <button
                    onClick={() => handleSelect('suporte')}
                    className="p-6 bg-white/20 dark:bg-gray-800/50 rounded-lg text-white text-left transition-all hover:bg-white/30 hover:scale-105 border border-white/20"
                  >
                    <MessageSquare size={32} className="mb-3 text-blue-300" />
                    <h3 className="text-xl font-semibold mb-1">Suporte Técnico</h3>
                    <p className="text-sm opacity-80">Assistência especializada em impressão 3D</p>
                  </button>

                  <button
                    onClick={() => handleSelect('vendas')}
                    className="p-6 bg-white/20 dark:bg-gray-800/50 rounded-lg text-white text-left transition-all hover:bg-white/30 hover:scale-105 border border-white/20"
                  >
                    <ShoppingBag size={32} className="mb-3 text-purple-300" />
                    <h3 className="text-xl font-semibold mb-1">Vendas e Produtos</h3>
                    <p className="text-sm opacity-80">Conheça nossas resinas UV SLA</p>
                  </button>

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
  );
}
