import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wrench, AlertTriangle, BookOpen, Settings, Zap, Thermometer, Droplets, Layers, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'

export function TechnicalSupportModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('problemas') // 'problemas' | 'nivelamento' | 'configuracoes' | 'calibracao' | 'manutencao'

  const problemasComuns = [
    {
      icon: Layers,
      problema: 'Peça não adere à plataforma',
      causas: [
        'Plataforma mal nivelada',
        'Tempo de exposição das camadas base insuficiente',
        'Plataforma suja ou com resina curada',
        'Temperatura ambiente muito baixa'
      ],
      solucoes: [
        'Refaça o nivelamento da plataforma com papel sulfite',
        'Aumente o tempo de exposição base para 40-60s',
        'Limpe a plataforma com IPA e lixe levemente',
        'Mantenha temperatura entre 25-30°C'
      ]
    },
    {
      icon: AlertTriangle,
      problema: 'Peça com falhas ou buracos',
      causas: [
        'Tempo de exposição muito baixo',
        'Resina contaminada ou vencida',
        'LCD/tela danificada',
        'Falta de suportes adequados'
      ],
      solucoes: [
        'Aumente tempo de exposição em 0.5-1s',
        'Filtre a resina e verifique validade',
        'Teste o LCD com arquivo de teste',
        'Adicione mais suportes em áreas críticas'
      ]
    },
    {
      icon: Droplets,
      problema: 'Resina grudando no FEP/filme',
      causas: [
        'FEP muito apertado ou frouxo',
        'Lift speed muito rápido',
        'Falta de lubrificação do FEP',
        'Tempo de exposição excessivo'
      ],
      solucoes: [
        'Ajuste tensão do FEP (som de tambor leve)',
        'Reduza lift speed para 60-80mm/min',
        'Aplique PTFE spray no FEP',
        'Reduza tempo de exposição em 0.5s'
      ]
    },
    {
      icon: Zap,
      problema: 'Peça super-curada (muito dura/quebradiça)',
      causas: [
        'Tempo de exposição muito alto',
        'Potência do LED muito alta',
        'Pós-cura excessiva'
      ],
      solucoes: [
        'Reduza tempo de exposição em 1-2s',
        'Diminua potência do LED para 70-80%',
        'Reduza tempo de pós-cura UV'
      ]
    },
    {
      icon: Clock,
      problema: 'Peça sub-curada (mole/pegajosa)',
      causas: [
        'Tempo de exposição muito baixo',
        'LED fraco ou envelhecido',
        'Resina vencida ou mal armazenada',
        'Falta de pós-cura'
      ],
      solucoes: [
        'Aumente tempo de exposição em 1-2s',
        'Verifique potência do LED',
        'Use resina dentro da validade',
        'Faça pós-cura UV por 5-10 minutos'
      ]
    },
    {
      icon: AlertTriangle,
      problema: 'Warping (empenamento da peça)',
      causas: [
        'Tensão interna durante a cura',
        'Resfriamento desigual',
        'Suportes insuficientes',
        'Orientação inadequada da peça'
      ],
      solucoes: [
        'Adicione mais suportes nas extremidades',
        'Oriente peça em ângulo de 30-45°',
        'Reduza temperatura de pós-cura',
        'Faça pós-cura gradual (começar frio)'
      ]
    },
    {
      icon: Layers,
      problema: 'Linhas de camada muito visíveis',
      causas: [
        'Altura de camada muito alta',
        'Anti-aliasing desativado',
        'Vibração durante impressão',
        'Eixo Z com folga'
      ],
      solucoes: [
        'Use camadas de 0.025mm ou 0.03mm',
        'Ative anti-aliasing no fatiador',
        'Coloque impressora em superfície estável',
        'Verifique e ajuste parafusos do eixo Z'
      ]
    },
    {
      icon: Zap,
      problema: 'Peças quebradiças demais',
      causas: [
        'Super-cura (exposição excessiva)',
        'Pós-cura muito longa',
        'Resina vencida ou oxidada',
        'Falta de plastificante na resina'
      ],
      solucoes: [
        'Reduza tempo de exposição em 1-2s',
        'Diminua tempo de pós-cura',
        'Use resina fresca e bem armazenada',
        'Considere resina com maior flexibilidade'
      ]
    },
    {
      icon: Wrench,
      problema: 'Suportes não removem facilmente',
      causas: [
        'Ponto de contato muito grande',
        'Tempo de exposição muito alto',
        'Suportes muito grossos',
        'Peça não foi lavada corretamente'
      ],
      solucoes: [
        'Use pontos de contato de 0.3-0.4mm',
        'Reduza exposição em 0.5s',
        'Configure suportes mais finos no fatiador',
        'Lave bem com IPA antes de remover suportes'
      ]
    },
    {
      icon: Droplets,
      problema: 'Delaminação (camadas se separando)',
      causas: [
        'Tempo de exposição muito baixo',
        'Lift speed muito rápido',
        'Resina contaminada com água/IPA',
        'Temperatura muito baixa'
      ],
      solucoes: [
        'Aumente tempo de exposição em 1s',
        'Reduza lift speed para 50-60mm/min',
        'Filtre e seque bem a resina',
        'Mantenha ambiente a 25-30°C'
      ]
    }
  ]

  const nivelamentoGuia = [
    {
      passo: 1,
      titulo: 'Preparação',
      descricao: 'Limpe a plataforma e o LCD com IPA. Remova qualquer resina curada.',
      dica: 'Use papel toalha sem fiapos'
    },
    {
      passo: 2,
      titulo: 'Posicionamento',
      descricao: 'Coloque uma folha de papel sulfite (75g) sobre o LCD limpo.',
      dica: 'Papel A4 comum funciona perfeitamente'
    },
    {
      passo: 3,
      titulo: 'Ajuste Inicial',
      descricao: 'Solte o parafuso de fixação da plataforma (não remova completamente).',
      dica: 'Deixe a plataforma livre para se mover'
    },
    {
      passo: 4,
      titulo: 'Nivelamento',
      descricao: 'Use o menu da impressora para mover a plataforma até o LCD (Z=0).',
      dica: 'A plataforma deve pressionar levemente o papel'
    },
    {
      passo: 5,
      titulo: 'Fixação',
      descricao: 'Aperte o parafuso de fixação enquanto mantém pressão para baixo.',
      dica: 'Não force demais, apenas firme'
    },
    {
      passo: 6,
      titulo: 'Teste',
      descricao: 'Puxe o papel - deve sair com resistência leve mas uniforme.',
      dica: 'Se estiver muito solto ou muito apertado, repita o processo'
    }
  ]

  const configuracoesPorResina = [
    {
      resina: 'Pyroblast+ (Alta Temperatura)',
      camada: '0.05mm',
      exposicao: '3-4s',
      exposicaoBase: '40-50s',
      camadasBase: '8-10',
      liftSpeed: '60mm/min',
      retractSpeed: '150mm/min',
      liftDistance: '6-8mm',
      temperatura: '28-32°C',
      observacoes: 'Resina viscosa, agite bem antes de usar. Pós-cura obrigatória em 60°C por 30min.'
    },
    {
      resina: 'Iron 7030 (Mecânica)',
      camada: '0.05mm',
      exposicao: '2.5-3.5s',
      exposicaoBase: '35-45s',
      camadasBase: '8-10',
      liftSpeed: '65mm/min',
      retractSpeed: '150mm/min',
      liftDistance: '6-8mm',
      temperatura: '25-28°C',
      observacoes: 'Boa fluidez. Ideal para peças funcionais. Pós-cura UV 10min.'
    },
    {
      resina: 'Spin+ (Castable)',
      camada: '0.025-0.05mm',
      exposicao: '2-3s',
      exposicaoBase: '30-40s',
      camadasBase: '6-8',
      liftSpeed: '70mm/min',
      retractSpeed: '150mm/min',
      liftDistance: '5-6mm',
      temperatura: '25-28°C',
      observacoes: 'Alta precisão. Use camadas finas. Lave bem com IPA. Pós-cura UV 5min.'
    },
    {
      resina: 'Poseidon (Water Washable)',
      camada: '0.05mm',
      exposicao: '2-3s',
      exposicaoBase: '30-40s',
      camadasBase: '6-8',
      liftSpeed: '70mm/min',
      retractSpeed: '150mm/min',
      liftDistance: '6-7mm',
      temperatura: '25-28°C',
      observacoes: 'Lave com água morna. Seque bem antes da pós-cura. Pós-cura UV 8min.'
    },
    {
      resina: 'LowSmell (Baixo Odor)',
      camada: '0.05mm',
      exposicao: '2.5-3.5s',
      exposicaoBase: '35-45s',
      camadasBase: '8-10',
      liftSpeed: '65mm/min',
      retractSpeed: '150mm/min',
      liftDistance: '6-8mm',
      temperatura: '25-28°C',
      observacoes: 'Ideal para ambientes fechados. Pós-cura UV 10min.'
    }
  ]

  const manutencaoPreventiva = [
    {
      item: 'FEP/nFEP (Filme)',
      frequencia: 'A cada 20-30 impressões',
      procedimento: [
        'Verifique arranhões e opacidade',
        'Limpe com IPA e microfibra',
        'Aplique PTFE spray levemente',
        'Troque se houver danos visíveis'
      ]
    },
    {
      item: 'LCD/Tela',
      frequencia: 'A cada 500-1000h de uso',
      procedimento: [
        'Teste com arquivo de exposição',
        'Limpe suavemente com IPA',
        'Verifique pixels mortos',
        'Troque se houver degradação'
      ]
    },
    {
      item: 'Guias Lineares (Eixo Z)',
      frequencia: 'Mensal',
      procedimento: [
        'Limpe com pano seco',
        'Aplique graxa PTFE nas guias',
        'Verifique folgas e ruídos',
        'Ajuste parafusos se necessário'
      ]
    },
    {
      item: 'Plataforma de Impressão',
      frequencia: 'Semanal (uso intenso)',
      procedimento: [
        'Limpe com IPA',
        'Lixe levemente com lixa 400',
        'Verifique nivelamento',
        'Remova resina curada'
      ]
    },
    {
      item: 'Resina no Tanque',
      frequencia: 'Após cada impressão',
      procedimento: [
        'Filtre com coador 190 microns',
        'Armazene em frasco escuro',
        'Não deixe resina parada >7 dias',
        'Misture antes de reutilizar'
      ]
    }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="h-8 w-8" />
                <div>
                  <h2 className="text-3xl font-bold">Suporte Técnico Especializado</h2>
                  <p className="text-purple-100">Guias completos para impressão 3D SLA/DLP</p>
                </div>
              </div>
              <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/20">
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-4 bg-gray-50 dark:bg-gray-800 border-b overflow-x-auto">
            <Button
              onClick={() => setActiveTab('problemas')}
              variant={activeTab === 'problemas' ? 'default' : 'outline'}
              className={activeTab === 'problemas' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Problemas Comuns
            </Button>
            <Button
              onClick={() => setActiveTab('nivelamento')}
              variant={activeTab === 'nivelamento' ? 'default' : 'outline'}
              className={activeTab === 'nivelamento' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
            >
              <Settings className="h-4 w-4 mr-2" />
              Nivelamento
            </Button>
            <Button
              onClick={() => setActiveTab('configuracoes')}
              variant={activeTab === 'configuracoes' ? 'default' : 'outline'}
              className={activeTab === 'configuracoes' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button
              onClick={() => setActiveTab('calibracao')}
              variant={activeTab === 'calibracao' ? 'default' : 'outline'}
              className={activeTab === 'calibracao' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
            >
              <Zap className="h-4 w-4 mr-2" />
              Calibração
            </Button>
            <Button
              onClick={() => setActiveTab('manutencao')}
              variant={activeTab === 'manutencao' ? 'default' : 'outline'}
              className={activeTab === 'manutencao' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Manutenção
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'problemas' && (
              <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  Soluções práticas para os problemas mais comuns em impressão 3D com resina
                </p>
                {problemasComuns.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <Card key={index} className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{item.problema}</h3>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                          <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">🔍 Causas Possíveis:</h4>
                          <ul className="space-y-1 text-sm">
                            {item.causas.map((causa, i) => (
                              <li key={i}>• {causa}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                          <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">✅ Soluções:</h4>
                          <ul className="space-y-1 text-sm">
                            {item.solucoes.map((solucao, i) => (
                              <li key={i}>• {solucao}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {activeTab === 'nivelamento' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Guia Completo de Nivelamento</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    O nivelamento correto é fundamental para o sucesso das impressões
                  </p>
                </div>
                
                {/* Diagrama Explicativo */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <h4 className="text-lg font-bold mb-4 text-center">Anatomia da Impressora SLA/DLP</h4>
                  <div className="flex justify-center mb-4">
                    <img 
                      src="/diagrama-dlp-setas.png" 
                      alt="Diagrama de impressora SLA/DLP com partes identificadas" 
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Entenda as partes principais da impressora para um nivelamento perfeito
                  </p>
                </Card>
                <div className="grid gap-4">
                  {nivelamentoGuia.map((item, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                          {item.passo}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold mb-2">{item.titulo}</h4>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">{item.descricao}</p>
                          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-sm">
                            <strong className="text-blue-700 dark:text-blue-400">💡 Dica:</strong> {item.dica}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-300 dark:border-yellow-700">
                  <h4 className="font-bold text-lg mb-3">⚠️ Avisos Importantes</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Nunca force a plataforma contra o LCD - pode quebrar a tela</li>
                    <li>• Faça o nivelamento com a impressora desligada ou em modo manual</li>
                    <li>• Repita o processo se a primeira camada não aderir bem</li>
                    <li>• Temperatura ambiente afeta o nivelamento - faça em ambiente estável</li>
                  </ul>
                </Card>
              </div>
            )}

            {activeTab === 'configuracoes' && (
              <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  Configurações recomendadas para cada tipo de resina Quanton3D
                </p>
                {configuracoesPorResina.map((config, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {config.resina}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-semibold">Altura de Camada:</span>
                          <span>{config.camada}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-semibold">Exposição Normal:</span>
                          <span>{config.exposicao}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-semibold">Exposição Base:</span>
                          <span>{config.exposicaoBase}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-semibold">Camadas Base:</span>
                          <span>{config.camadasBase}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-semibold">Lift Speed:</span>
                          <span>{config.liftSpeed}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-semibold">Retract Speed:</span>
                          <span>{config.retractSpeed}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-semibold">Lift Distance:</span>
                          <span>{config.liftDistance}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-semibold">Temperatura:</span>
                          <span>{config.temperatura}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 text-sm">
                      <strong className="text-purple-700 dark:text-purple-400">📝 Observações:</strong> {config.observacoes}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'calibracao' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Guia de Calibração e Testes</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ajuste fino dos parâmetros para obter a melhor qualidade possível
                  </p>
                </div>

                {/* Diagrama Completo da Impressora */}
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <h4 className="text-lg font-bold mb-4 text-center">Componentes da Impressora SLA</h4>
                  <div className="flex justify-center mb-4">
                    <img 
                      src="/diagrama-impressora-sla.jpg" 
                      alt="Diagrama completo de impressora SLA com todas as partes numeradas" 
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Conheça todos os componentes para entender melhor a calibração
                  </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-300 dark:border-yellow-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-600" />
                    Teste de Exposição (Exposure Test)
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      O teste de exposição é fundamental para encontrar o tempo ideal de cura para cada resina.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-bold mb-2">Como fazer:</h4>
                      <ol className="space-y-2 text-sm list-decimal list-inside">
                        <li>Baixe o arquivo de teste (R_E_R_F test ou similar)</li>
                        <li>Configure tempos variando de -1s a +1s do recomendado</li>
                        <li>Imprima o teste e analise qual coluna ficou melhor</li>
                        <li>Escolha o tempo onde os detalhes estão nítidos sem super-cura</li>
                      </ol>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-sm">
                      <strong className="text-blue-700 dark:text-blue-400">⚡ Dica:</strong> Faça este teste sempre que trocar de resina ou lote
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-purple-600" />
                    Matriz de Calibração XYZ
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      Teste de precisão dimensional para verificar se sua impressora está calibrada corretamente.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                        <h4 className="font-bold mb-2">O que testar:</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Cubo de 20x20x20mm</li>
                          <li>• Cilindro de 10mm diâmetro</li>
                          <li>• Furo passante de 5mm</li>
                          <li>• Detalhes finos (0.5mm)</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                        <h4 className="font-bold mb-2">Tolerâncias aceitáveis:</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• XY: ±0.1mm</li>
                          <li>• Z: ±0.05mm</li>
                          <li>• Furos: -0.1 a -0.2mm</li>
                          <li>• Pinos: +0.1 a +0.2mm</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Thermometer className="h-6 w-6 text-red-600" />
                    Ajuste Fino de Parâmetros
                  </h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-bold mb-3 text-blue-600 dark:text-blue-400">Para AUMENTAR qualidade:</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Reduza altura de camada (0.025mm)</li>
                          <li>• Ative anti-aliasing</li>
                          <li>• Reduza lift speed (50mm/min)</li>
                          <li>• Aumente tempo de exposição levemente</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-bold mb-3 text-green-600 dark:text-green-400">Para AUMENTAR velocidade:</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Use camadas de 0.05mm</li>
                          <li>• Aumente lift speed (80mm/min)</li>
                          <li>• Reduza lift distance (5mm)</li>
                          <li>• Use resinas rápidas (2-3s)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-2 border-red-300 dark:border-red-700">
                  <h4 className="font-bold text-lg mb-3">⚠️ Erros Comuns na Calibração</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Não fazer teste de exposição:</strong> Usar valores genéricos pode causar problemas</li>
                    <li>• <strong>Ignorar temperatura:</strong> Variações de 5°C afetam a cura</li>
                    <li>• <strong>Não documentar:</strong> Anote os parâmetros que funcionam bem</li>
                    <li>• <strong>Mudar vários parâmetros de uma vez:</strong> Mude um por vez para identificar o efeito</li>
                  </ul>
                </Card>
              </div>
            )}

            {activeTab === 'manutencao' && (
              <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  Mantenha sua impressora em perfeito estado com estas práticas preventivas
                </p>
                {manutencaoPreventiva.map((item, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{item.item}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Frequência: <strong>{item.frequencia}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                      <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">🔧 Procedimento:</h4>
                      <ol className="space-y-1 text-sm list-decimal list-inside">
                        {item.procedimento.map((passo, i) => (
                          <li key={i}>{passo}</li>
                        ))}
                      </ol>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
