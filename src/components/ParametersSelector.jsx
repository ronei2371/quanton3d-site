// Arquivo: quanton3d-site/src/components/ParametersSelector.jsx
// Este é o componente ATUALIZADO que faz os dropdowns funcionarem.

import { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { motion } from 'framer-motion';
// ===== MUDANÇA CRÍTICA: Corrigindo o caminho de importação =====
// Isso deve forçar o Netlify a ler o arquivo de dados
import { resinList, printerList, parameters } from '../data/parametersData.js'; 

export default function ParametersSelector() {
  const [selectedResin, setSelectedResin] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [result, setResult] = useState(null);
  
  const handleSelectResin = (e) => {
    setSelectedResin(e.target.value);
    setSelectedPrinter('');
    setResult(null); 
  };
  
  const handleSelectPrinter = (e) => {
    const printer = e.target.value;
    setSelectedPrinter(printer);
    
    const key = `${selectedResin}_${printer}`;
    const foundParams = parameters[key];
    
    if (foundParams) {
      setResult(foundParams);
    } else if (selectedResin && printer) {
      setResult('not_found');
    } else {
      setResult(null);
    }
  };

  return (
    <section id="informacoes-tecnicas" className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Parâmetros de Impressão</h2>
        <p className="text-xl text-white drop-shadow-md">
          Selecione a resina e impressora para ver os parâmetros recomendados
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Dropdown de Resina */}
        <Card className="p-6 bg-white/10 backdrop-blur-md border-2 border-blue-400/50 shadow-xl hover:border-blue-400 transition-all">
          <label className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"></path><path d="M12 12.04V21.8"></path></svg>
            Selecione a Resina
          </label>
          <select 
            onChange={handleSelectResin}
            value={selectedResin}
            className="w-full p-3 border-2 border-blue-400/30 rounded-lg bg-white/90 dark:bg-gray-800/90 dark:text-white font-semibold focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
          >
            <option value="">Escolha uma resina...</option>
            {resinList.map(resin => (
              <option key={resin} value={resin}>{resin}</option>
            ))}
          </select>
        </Card>
        
        {/* Dropdown de Impressora */}
        <Card className="p-6 bg-white/10 backdrop-blur-md border-2 border-purple-400/50 shadow-xl hover:border-purple-400 transition-all">
          <label className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            Selecione a Impressora
          </label>
          <select 
            onChange={handleSelectPrinter}
            value={selectedPrinter}
            className="w-full p-3 border-2 border-purple-400/30 rounded-lg bg-white/90 dark:bg-gray-800/90 dark:text-white font-semibold focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all"
            disabled={!selectedResin} // Desabilitado até a resina ser escolhida
          >
            <option value="">{selectedResin ? 'Escolha uma impressora...' : 'Selecione uma resina primeiro'}</option>
            {printerList.map(printer => (
              <option key={printer} value={printer}>{printer}</option>
            ))}
          </select>
        </Card>
      </div>
      
      {/* --- Resultados (Continua o mesmo código) --- */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          {result === 'not_found' ? (
            <Card className="p-8 text-center max-w-4xl mx-auto bg-red-500/10 backdrop-blur-md border-2 border-red-400/50 shadow-xl">
              <h3 className="text-xl font-bold text-red-300">Parâmetros Não Encontrados</h3>
              <p className="text-red-200 mt-2">
                Ainda não temos uma recomendação específica para esta combinação. 
                Por favor, use os parâmetros gerais ou entre em contato com nosso suporte técnico.
              </p>
            </Card>
          ) : (
            <Card className="p-8 max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-2 border-cyan-400/50 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-lg">
                Parâmetros para: {selectedResin} + {selectedPrinter}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Altura de Camada</p>
                  <p className="text-xl font-bold text-white">{result.camada}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Exposição</p>
                  <p className="text-xl font-bold text-white">{result.exposicao}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Exposição Base</p>
                  <p className="text-xl font-bold text-white">{result.exposicaoBase}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Camadas de Base</p>
                  <p className="text-xl font-bold text-white">{result.camadasBase}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Lift Distance</p>
                  <p className="text-xl font-bold text-white">{result.liftDistance}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Lift Speed</p>
                  <p className="text-xl font-bold text-white">{result.liftSpeed}</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </section>
  );
}
