import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { motion } from 'framer-motion';
import { parameters } from '@/data/parametersData';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com';

const normalizeValue = (value) => (
  value
    ?.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
);

const localEntries = Object.entries(parameters).map(([key, params]) => {
  const [resinName, ...printerParts] = key.split('_');
  return {
    resinName,
    printerName: printerParts.join('_'),
    params,
  };
});

const localResinNames = Array.from(new Set(localEntries.map((entry) => entry.resinName))).sort((a, b) => (
  a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
));

const getLocalPrintersForResin = (resinName) => {
  const normalizedResin = normalizeValue(resinName);
  const printers = localEntries
    .filter((entry) => normalizeValue(entry.resinName) === normalizedResin)
    .map((entry) => entry.printerName);

  return Array.from(new Set(printers)).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
};

const getLocalProfile = (resinName, printerName) => {
  const normalizedResin = normalizeValue(resinName);
  const normalizedPrinter = normalizeValue(printerName);
  const match = localEntries.find(
    (entry) =>
      normalizeValue(entry.resinName) === normalizedResin &&
      normalizeValue(entry.printerName) === normalizedPrinter,
  );

  if (!match) return null;

  return {
    params: {
      layerHeightMm: match.params.camada,
      exposureTimeS: match.params.exposicao,
      baseExposureTimeS: match.params.exposicaoBase,
      baseLayers: match.params.camadasBase,
      liftDistanceMm: match.params.liftDistance,
      liftSpeedMmMin: match.params.liftSpeed,
      retractSpeedMmMin: match.params.retractSpeed,
      uvOffDelayS: match.params.uvOffDelay,
    },
  };
};

const normalizeResins = (items = []) => (
  items.map((resin) => {
    if (typeof resin === 'string') {
      return { id: resin, name: resin };
    }
    const id = resin.id ?? resin._id ?? resin.name ?? resin.label;
    const name = resin.name ?? resin.label ?? resin.id ?? resin._id;
    return { ...resin, id, name };
  })
);

const normalizePrinters = (items = []) => (
  items.map((printer) => {
    if (typeof printer === 'string') {
      return { id: printer, name: printer, label: printer };
    }
    const label = printer.label ?? printer.name ?? [printer.brand, printer.model].filter(Boolean).join(' ').trim();
    const id = printer.id ?? printer._id ?? printer.name ?? printer.model ?? label;
    return { ...printer, id, label };
  })
);

export default function ParametersSelector() {
  const [resins, setResins] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [selectedResin, setSelectedResin] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('api');

  useEffect(() => {
    fetchResins();
  }, []);

  useEffect(() => {
    if (selectedResin) {
      fetchPrinters(selectedResin);
    } else {
      setPrinters([]);
    }
  }, [selectedResin]);

  const fetchResins = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/params/resins`);
      const data = await response.json();
      if (data.success) {
        const normalizedResins = normalizeResins(data.resins);
        if (normalizedResins.length > 0) {
          setResins(normalizedResins);
          setDataSource('api');
          return;
        }
      }
      setResins(normalizeResins(localResinNames));
      setDataSource('local');
    } catch (err) {
      console.error('Erro ao carregar resinas:', err);
      setError('Erro ao carregar resinas');
      setResins(normalizeResins(localResinNames));
      setDataSource('local');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrinters = async (resinId) => {
    if (dataSource === 'local') {
      setPrinters(normalizePrinters(getLocalPrintersForResin(resinId)));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/params/printers?resinId=${resinId}`);
      const data = await response.json();
      if (data.success) {
        setPrinters(normalizePrinters(data.printers));
      }
    } catch (err) {
      console.error('Erro ao carregar impressoras:', err);
      setError('Erro ao carregar impressoras');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (resinId, printerId) => {
    if (dataSource === 'local') {
      const localProfile = getLocalProfile(resinId, printerId);
      setResult(localProfile ?? 'not_found');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/params/profiles?resinId=${resinId}&printerId=${printerId}`);
      const data = await response.json();
      if (data.success && data.profiles.length > 0) {
        const profile = data.profiles[0];
        if (profile.status === 'coming_soon') {
          setResult('coming_soon');
        } else {
          setResult(profile);
        }
      } else {
        setResult('not_found');
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setResult('not_found');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResin = (e) => {
    const resinId = e.target.value;
    setSelectedResin(resinId);
    setSelectedPrinter('');
    setResult(null);
  };

  const handleSelectPrinter = (e) => {
    const printerId = e.target.value;
    setSelectedPrinter(printerId);

    if (selectedResin && printerId) {
      fetchProfile(selectedResin, printerId);
    } else {
      setResult(null);
    }
  };

  const getResinName = () => {
    const resin = resins.find(r => r.id === selectedResin);
    return resin?.name ?? resin?.label ?? selectedResin;
  };

  const getPrinterLabel = (printer) => (
    printer?.label ?? printer?.name ?? [printer?.brand, printer?.model].filter(Boolean).join(' ').trim()
  );

  const getPrinterName = () => {
    const printer = printers.find(p => p.id === selectedPrinter);
    return getPrinterLabel(printer) || selectedPrinter;
  };

  const formatValue = (value, unit = '') => {
    if (value === null || value === undefined) return '-';
    return `${value}${unit}`;
  };

  return (
    <section id="informacoes-tecnicas" className="container mx-auto px-4 py-8">
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
            disabled={loading && resins.length === 0}
          >
            <option value="">{loading && resins.length === 0 ? 'Carregando...' : 'Escolha uma resina...'}</option>
            {resins.map(resin => (
              <option key={resin.id} value={resin.id}>{resin.name ?? resin.label}</option>
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
            disabled={!selectedResin || loading}
          >
            <option value="">
              {!selectedResin ? 'Selecione uma resina primeiro' : loading ? 'Carregando...' : 'Escolha uma impressora...'}
            </option>
            {printers.map(printer => (
              <option key={printer.id} value={printer.id}>{getPrinterLabel(printer)}</option>
            ))}
          </select>
        </Card>
      </div>
      
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
          ) : result === 'coming_soon' ? (
            <Card className="p-8 text-center max-w-4xl mx-auto bg-yellow-500/10 backdrop-blur-md border-2 border-yellow-400/50 shadow-xl">
              <h3 className="text-xl font-bold text-yellow-300">Em Breve</h3>
              <p className="text-yellow-200 mt-2">
                Os parâmetros para esta combinação estão sendo calibrados.
                Em breve teremos as recomendações disponíveis.
              </p>
            </Card>
          ) : (
            <Card className="p-8 max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-2 border-cyan-400/50 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-lg">
                Parâmetros para: {getResinName()} + {getPrinterName()}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Altura de Camada</p>
                  <p className="text-xl font-bold text-white">{formatValue(result.params?.layerHeightMm, 'mm')}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Tempo de Exposição</p>
                  <p className="text-xl font-bold text-white">{formatValue(result.params?.exposureTimeS, 's')}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Exposição Base</p>
                  <p className="text-xl font-bold text-white">{formatValue(result.params?.baseExposureTimeS, 's')}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Camadas de Base</p>
                  <p className="text-xl font-bold text-white">{formatValue(result.params?.baseLayers)}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Retardo UV</p>
                  <p className="text-xl font-bold text-white">{formatValue(result.params?.uvOffDelayS, 's')}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Descanso Antes Elevação</p>
                  <p className="text-xl font-bold text-white">{formatValue(result.params?.restBeforeLiftS, 's')}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Descanso Após Elevação</p>
                  <p className="text-xl font-bold text-white">{formatValue(result.params?.restAfterLiftS, 's')}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <p className="text-sm text-cyan-300">Descanso Após Retração</p>
                  <p className="text-xl font-bold text-white">{formatValue(result.params?.restAfterRetractS, 's')}</p>
                </div>
                {result.params?.uvPower && (
                  <div className="text-center p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                    <p className="text-sm text-cyan-300">Potência UV</p>
                    <p className="text-xl font-bold text-white">{formatValue(result.params?.uvPower)}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {error && (
        <div className="mt-4 text-center text-red-400">
          {error}
        </div>
      )}
    </section>
  );
}
