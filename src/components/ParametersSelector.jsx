// Arquivo: quanton3d-site/src/components/ParametersSelector.jsx
// Este é o componente ATUALIZADO que faz os dropdowns funcionarem.

import { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { motion } from 'framer-motion';
// Corrigido: Agora usa a importação relativa
import { resinList, printerList, parameters } from '../data/parametersData.js'; 

export default function ParametersSelector() {
  const [selectedResin, setSelectedResin] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [result, setResult] = useState(null);
  
  // A lista de impressoras disponíveis depende da resina selecionada.
  // MUDANÇA CRÍTICA: Filtra as impressoras que TEM dados para a resina selecionada
  const availablePrinters = selectedResin 
    ? printerList.filter(printer => parameters[`${selectedResin}_${printer}`])
    : printerList; // Se nenhuma resina for selecionada, mostra todas (opcional)


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
        <h2 className="text-4xl font-bold mb-4">Parâmetros de Impressão</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Selecione a resina e impressora para ver os parâmetros recomendados
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Dropdown de Resina */}
        <Card className="p-6">
          <label className="text-lg font-semibold mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"></path><path d="M12 12.04V21.8"></path></svg>
            Selecione a Resina
          </label>
          <select 
            onChange={handleSelectResin}
            value={selectedResin}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Escolha uma resina...</option>
            {resinList.map(resin => (
              <option key={resin} value={resin}>{resin}</option>
            ))}
          </select>
        </Card>
        
        {/* Dropdown de Impressora */}
        <Card className="p-6">
          <label className="text-lg font-semibold mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            Selecione a Impressora
          </label>
          <select 
            onChange={handleSelectPrinter}
            value={selectedPrinter}
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={!selectedResin || availablePrinters.length === 0} 
          >
            <option value="">{selectedResin ? (availablePrinters.length > 0 ? 'Escolha uma impressora...' : 'Sem parâmetros para esta resina') : 'Selecione uma resina primeiro'}</option>
            {availablePrinters.map(printer => (
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
            <Card className="p-8 text-center max-w-4xl mx-auto border-red-200 bg-red-50">
              <h3 className="text-xl font-bold text-red-700">Parâmetros Não Encontrados</h3>
              <p class="text-red-600 mt-2">
                Ainda não temos uma recomendação específica para esta combinação. 
                Por favor, use os parâmetros gerais ou entre em contato com nosso suporte técnico.
              </p>
            </Card>
          ) : (
            <Card className="p-8 max-w-4xl mx-auto border-blue-200 bg-blue-50">
              <h3 className="text-2xl font-bold mb-6 text-center text-blue-800">
                Parâmetros para: {selectedResin} + {selectedPrinter}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Altura de Camada</p>
                  <p className="text-xl font-bold text-gray-900">{result.camada}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Exposição</p>
                  <p className="text-xl font-bold text-gray-900">{result.exposicao}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Exposição Base</p>
                  <p className="text-xl font-bold text-gray-900">{result.exposicaoBase}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Camadas de Base</p>
                  <p className="text-xl font-bold text-gray-900">{result.camadasBase}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Lift Distance</p>
                  <p className="text-xl font-bold text-gray-900">{result.liftDistance}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Lift Speed</p>
                  <p className="text-xl font-bold text-gray-900">{result.liftSpeed}</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </section>
  );
}
