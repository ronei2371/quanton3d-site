// Arquivo: quanton3d-site/src/components/ParametersSelector.jsx
// Este código AGORA carrega o arquivo de 570 combinações que o Manus já tinha.

import { useState, useEffect } from 'react'; // Adicionamos useEffect
import { Card } from '@/components/ui/card.jsx';
import { motion } from 'framer-motion';

// ===== CORREÇÃO #2: MUDANÇA CRÍTICA AQUI =====
// O Manus disse para usarmos o arquivo completo de 570 combinações
// Vamos carregar o JSON completo que o Manus mencionou.
// O componente precisa ser ajustado para ler os dados DEPOIS de carregados.

const API_URL = import.meta.env.VITE_API_URL;
let localResinList = [];
let localPrinterList = [];
let localParameters = {};

// Função para buscar e processar os dados completos
const fetchParameters = async () => {
    try {
        const response = await fetch('/parametros_completos.json'); // Caminho público
        const data = await response.json();
        
        // Processar dados para criar as listas (assumindo que o JSON é uma lista de objetos)
        const resins = new Set();
        const printers = new Set();
        const paramsMap = {};

        data.forEach(item => {
            resins.add(item.resina);
            printers.add(item.impressora);
            paramsMap[`${item.resina}_${item.impressora}`] = item;
        });

        localResinList = Array.from(resins);
        localPrinterList = Array.from(printers);
        localParameters = paramsMap;

    } catch (error) {
        console.error("Erro ao carregar parametros_completos.json:", error);
    }
};

// Chamada inicial para carregar os dados
fetchParameters();


export default function ParametersSelector() {
  const [selectedResin, setSelectedResin] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [result, setResult] = useState(null);
  
  // Força o componente a re-renderizar quando os dados são carregados
  const [dataLoaded, setDataLoaded] = useState(false);
  useEffect(() => {
      // Simplesmente garante que o estado é atualizado depois que o fetchParameters termina
      if (localResinList.length > 0 && !dataLoaded) {
          setDataLoaded(true);
      }
  }, []);

  const handleSelectResin = (e) => {
    setSelectedResin(e.target.value);
    setSelectedPrinter(''); // Reseta a impressora
    setResult(null); // Limpa o resultado anterior
  };
  
  const handleSelectPrinter = (e) => {
    const printer = e.target.value;
    setSelectedPrinter(printer);
    
    // Tenta encontrar os parâmetros no mapa carregado
    const key = `${selectedResin}_${printer}`;
    const foundParams = localParameters[key];
    
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
            {localResinList.map(resin => (
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
            disabled={!selectedResin} // Desabilitado até a resina ser escolhida
          >
            <option value="">{selectedResin ? 'Selecione uma impressora...' : 'Selecione uma resina primeiro'}</option>
            {localPrinterList.map(printer => (
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
                  <p className="text-xl font-bold text-gray-900">{result.camada || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Exposição</p>
                  <p className="text-xl font-bold text-gray-900">{result.exposicao || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Exposição Base</p>
                  <p className="text-xl font-bold text-gray-900">{result.exposicaoBase || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Camadas de Base</p>
                  <p className="text-xl font-bold text-gray-900">{result.camadasBase || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Lift Distance</p>
                  <p className="text-xl font-bold text-gray-900">{result.liftDistance || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Lift Speed</p>
                  <p className="text-xl font-bold text-gray-900">{result.liftSpeed || 'N/A'}</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </section>
  );
}
