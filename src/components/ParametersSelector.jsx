import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { motion } from 'framer-motion'
import { Settings, Printer, Droplet, Clock, Layers, ArrowUp, ArrowDown, Zap } from 'lucide-react'

export function ParametersSelector() {
  const [resinas, setResinas] = useState([])
  const [impressoras, setImpressoras] = useState([])
  const [selectedResina, setSelectedResina] = useState('')
  const [selectedImpressora, setSelectedImpressora] = useState('')
  const [parametros, setParametros] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carregar dados dos parâmetros
    fetch('/parametros_completos.json')
      .then(res => res.json())
      .then(data => {
        const resinasUnicas = [...new Set(data.map(item => item.Resina))].filter(Boolean).sort()
        setResinas(resinasUnicas)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar parâmetros:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedResina) {
      // Carregar impressoras disponíveis para a resina selecionada
      fetch('/parametros_completos.json')
        .then(res => res.json())
        .then(data => {
          const impressorasDisponiveis = data
            .filter(item => item.Resina === selectedResina)
            .map(item => item.Impressora)
            .filter(Boolean)
            .sort()
          setImpressoras(impressorasDisponiveis)
          setSelectedImpressora('')
          setParametros(null)
        })
    }
  }, [selectedResina])

  useEffect(() => {
    if (selectedResina && selectedImpressora) {
      // Carregar parâmetros específicos
      fetch('/parametros_completos.json')
        .then(res => res.json())
        .then(data => {
          const params = data.find(
            item => item.Resina === selectedResina && item.Impressora === selectedImpressora
          )
          setParametros(params)
        })
    }
  }, [selectedResina, selectedImpressora])

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando parâmetros...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="parametros" className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Settings className="h-10 w-10 text-blue-600" />
            <h2 className="text-4xl font-bold">Parâmetros de Impressão</h2>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Selecione a resina e impressora para ver os parâmetros recomendados
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Seletores */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Seletor de Resina */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 hover:border-blue-400 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Droplet className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Selecione a Resina</h3>
                </div>
                <select
                  value={selectedResina}
                  onChange={(e) => setSelectedResina(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Escolha uma resina...</option>
                  {resinas.map((resina) => (
                    <option key={resina} value={resina}>
                      {resina}
                    </option>
                  ))}
                </select>
              </Card>
            </motion.div>

            {/* Seletor de Impressora */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 hover:border-purple-400 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Printer className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Selecione a Impressora</h3>
                </div>
                <select
                  value={selectedImpressora}
                  onChange={(e) => setSelectedImpressora(e.target.value)}
                  disabled={!selectedResina}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedResina ? 'Escolha uma impressora...' : 'Selecione uma resina primeiro'}
                  </option>
                  {impressoras.map((impressora) => (
                    <option key={impressora} value={impressora}>
                      {impressora}
                    </option>
                  ))}
                </select>
              </Card>
            </motion.div>
          </div>

          {/* Parâmetros */}
          {parametros && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/30 border-2 border-blue-300 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-bold">Parâmetros Recomendados</h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Altura de Camada */}
                  {parametros.Altura && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-5 w-5 text-blue-600" />
                        <h4 className="font-bold text-sm text-gray-600 dark:text-gray-400">Altura de Camada</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{parametros.Altura}</p>
                    </div>
                  )}

                  {/* Tempo de Exposição */}
                  {parametros.Exposicao && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <h4 className="font-bold text-sm text-gray-600 dark:text-gray-400">Tempo de Exposição</h4>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{parametros.Exposicao}</p>
                    </div>
                  )}

                  {/* Base */}
                  {parametros.Base && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-pink-200 dark:border-pink-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-5 w-5 text-pink-600" />
                        <h4 className="font-bold text-sm text-gray-600 dark:text-gray-400">Camadas de Base</h4>
                      </div>
                      <p className="text-2xl font-bold text-pink-600">{parametros.Base}</p>
                    </div>
                  )}

                  {/* Lift Distance */}
                  {parametros['Lift Distance'] && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUp className="h-5 w-5 text-green-600" />
                        <h4 className="font-bold text-sm text-gray-600 dark:text-gray-400">Lift Distance</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{parametros['Lift Distance']}</p>
                    </div>
                  )}

                  {/* Lift Speed */}
                  {parametros['Lift Speed'] && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUp className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-bold text-sm text-gray-600 dark:text-gray-400">Lift Speed</h4>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">{parametros['Lift Speed']}</p>
                    </div>
                  )}

                  {/* Retract Speed */}
                  {parametros['Retract Speed'] && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowDown className="h-5 w-5 text-red-600" />
                        <h4 className="font-bold text-sm text-gray-600 dark:text-gray-400">Retract Speed</h4>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{parametros['Retract Speed']}</p>
                    </div>
                  )}
                </div>

                {/* Aplicações */}
                {parametros.Aplicacoes && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold mb-2 text-blue-900 dark:text-blue-100">Aplicações:</h4>
                    <p className="text-gray-700 dark:text-gray-300">{parametros.Aplicacoes}</p>
                  </div>
                )}

                {/* Aviso */}
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    ⚠️ <strong>Importante:</strong> Estes são parâmetros recomendados como ponto de partida. 
                    Ajustes podem ser necessários dependendo da temperatura ambiente, idade da resina e condições da impressora.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Mensagem quando nenhum parâmetro está selecionado */}
          {!parametros && selectedResina && selectedImpressora && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando parâmetros...</p>
            </motion.div>
          )}

          {!selectedResina && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Selecione uma resina e impressora para ver os parâmetros recomendados
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ParametersSelector
