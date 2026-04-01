import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Download, Shield, Award, CheckCircle2, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'

export function QualityModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('resinas') // 'resinas' | 'fispqs' | 'qualidade'

  const fispqs = [
    { name: 'Iron 7030', file: 'FISPQ001QUANTON3DIRON7030RESINAPARAIMPRESSÃO3DGREY.pdf' },
    { name: 'Spin+', file: 'FISPQ002QUANTON3DSPINRESINAPARAIMPRESSÃO3D.pdf' },
    { name: 'Iron Skin', file: 'FISPQ003QUANTON3DIRONSKINRESINAPARAIMPRESSÃO3D.pdf' },
    { name: 'LowSmell', file: 'FISPQ004QUANTON3DLOWSMELLRESINAPARAIMPRESSÃO3D.pdf' },
    { name: 'Poseidon', file: 'FISPQ006QUANTON3DPOSEIDON.pdf' },
    { name: 'Pyroblast+', file: 'FISPQ007QUANTON3DPYRO.pdf' },
    { name: 'Spark', file: 'FISPQ008QUANTON3DSPARKRESINAPARAIMPRESSÃO3DSPARKCLEAN.pdf' }
  ]

  const resinas = [
    {
      name: 'Alchemist',
      desc: 'Linha especialmente criada para efeitos especiais em colecionáveis e itens de decoração. Alta qualidade, rápida polimerização e durabilidade. Cores translúcidas e vibrantes garantem acabamento fosco após limpeza com álcool isopropílico.',
      indicacao: 'Reprodução de efeitos especiais em colecionáveis e itens de decoração',
      caracteristicas: [
        'Precisão e Rapidez: Impressões com alta definição e polimerização rápida',
        'Durabilidade: Peças robustas e resistentes, minimizando quebras e deformações',
        'Cores Vibrantes e Translúcidas: Efeito translúcido e cores vibrantes (exclusividade Quanton3D)'
      ]
    },
    {
      name: 'FlexForm',
      desc: 'Projetada para protótipos e peças que exigem alta flexibilidade e resistência. Destinada a aplicações industriais e projetos especiais, combina flexibilidade e durabilidade, adaptando-se a diversas formas sem comprometer integridade estrutural.',
      indicacao: 'Protótipos e peças que exigem resistência e alto nível de flexibilidade',
      caracteristicas: [
        'Alta Flexibilidade: Adaptação a diversas formas sem comprometer integridade estrutural',
        'Durabilidade Robusta: Resistência a desgastes, impactos e outros danos mecânicos',
        'Precisão Dimensional: Criação de peças com detalhes finos e complexos'
      ]
    },
    {
      name: 'Athom Dental',
      desc: 'Ideal para criar modelos de estudo, troquéis e protótipos de peças dentárias. Alta precisão e qualidade de impressão, facilita estudos detalhados e prototipagem eficiente na área odontológica.',
      indicacao: 'Modelos de estudo odontológicos, troquéis e protótipos',
      caracteristicas: [
        'Aplicações Odontológicas Específicas: Ideal para modelos de estudo, troquéis e protótipos dentários',
        'Alta Precisão e Qualidade: Desenvolvida especificamente para uso odontológico',
        'Facilita Estudos e Prototipagem: Permite estudos detalhados com eficiência'
      ],
      importante: 'Destinada apenas para uso externo, NÃO é biocompatível. Requer uso de EPIs.',
      dica: 'Para modelos com encaixe, prefira resina Spin - possui leve flexibilidade que não compromete precisão'
    },
    {
      name: 'Iron',
      desc: 'Adequada para projetos que exigem flexibilidade e resistência a impactos em peças acima de 2mm (abaixo pode gerar flexibilidade). Alta resistência ao impacto, dureza intermediária e flexibilidade.',
      indicacao: 'Projetos que requerem flexibilidade e resistência a impactos',
      caracteristicas: [
        'Alta Resistência ao Impacto: Ideal para peças que enfrentam condições adversas',
        'Dureza Intermediária: Versatilidade para diversas aplicações industriais',
        'Flexibilidade: Permite maior liberdade no design e funcionalidade'
      ],
      limitacoes: 'Não recomendada para peças inclinadas. Tem baixa resistência a água.',
      aplicacoes: 'Aplicações industriais, prototipagem funcional, peças finais, ferramentas, aplicações médicas e artísticas'
    },
    {
      name: 'Iron 7030',
      desc: 'Combinação equilibrada de flexibilidade e resistência, proporcionando detalhes precisos e acabamento de qualidade superior. Ideal para protótipos e peças que exigem durabilidade.',
      indicacao: 'Impressões que exigem maior resistência e elevado nível de detalhes',
      caracteristicas: [
        'Odor: Médio',
        'Viscosidade: Média',
        'pH: 6,0',
        'Densidade: 1,017 g/cm³',
        'Temperatura Específica: Não expor acima de 40°C'
      ],
      limitacoes: 'Não recomendada para peças com estruturas finas e suspensas (como asas de dragões)'
    },
    {
      name: 'Poseidon',
      desc: 'Dispensa álcool para limpeza (lavável em água). Rígida com leve flexibilidade, oferecendo detalhamento preciso, baixo odor e versatilidade.',
      indicacao: 'Impressões que requerem alto grau de detalhamento',
      caracteristicas: [
        'Detalhamento Impecável: Impressões com superfícies lisas e precisas',
        'Lavável com Água: Elimina uso de álcool, simplificando processo e economizando dinheiro',
        'Baixo Odor: Cheiro praticamente imperceptível'
      ],
      importante: 'Embora lavável em água, ainda apresenta toxicidade. Não é biocompatível. Requer uso de EPIs.',
      aplicacoes: 'Protótipos, miniaturas, peças funcionais e decoração'
    },
    {
      name: 'Spin',
      desc: 'Oferece maior rigidez e leve flexibilidade com alto nível de detalhes. Cores opacas e precisão, resistindo a deformações sob tensões.',
      indicacao: 'Peças de grande formato com alto nível de detalhes sem deformação',
      caracteristicas: [
        'Resistência e Flexibilidade: Combina rigidez com leve flexibilidade, suportando tensões sem deformar',
        'Cores Opacas: Disponível em diversas cores opacas para acabamento profissional',
        'Alta Precisão: Perfeita para protótipos funcionais e peças de uso final'
      ],
      aplicacoes: 'Protótipos funcionais, peças de uso final, modelos detalhados, objetos decorativos'
    },
    {
      name: 'Athom Alinhadores',
      desc: 'Alta resolução e precisão para visualização detalhada de modelos complexos. Baixa contração e boa resistência à temperatura.',
      indicacao: 'Produção de modelos para alinhadores e processos com plastificadoras a vácuo',
      caracteristicas: [
        'Alta resolução e precisão: Permite visualização detalhada de modelos complexos',
        'Baixa contração: Minimiza distorções, garantindo modelos precisos',
        'Boa resistência à temperatura: Suporta calor das plastificadoras a vácuo sem deformar'
      ],
      importante: 'Destinada apenas para uso externo, NÃO é biocompatível. Requer uso de EPIs.'
    },
    {
      name: 'Pyroblast+',
      desc: 'Resina de alta resistência térmica até 238°C (HDT). Alta rigidez e resistência mecânica.',
      indicacao: 'Moldes de injeção, peças expostas a calor',
      caracteristicas: [
        'Resistência térmica até 50°C (HDT)',
        'Alta rigidez e resistência mecânica',
        'Excelente estabilidade dimensional',
        'Ideal para moldes de fundição',
        'Baixa contração pós-cura'
      ],
      cor: 'Cinza escuro',
      observacoes: 'Resina viscosa, agite bem antes de usar. Pós-cura obrigatória em 60°C por 30min'
    },
    {
      name: 'Spark',
      desc: 'Resina de alta precisão e detalhamento',
      indicacao: 'Miniaturas, joias, modelos dentários',
      caracteristicas: [
        'Alta precisão e detalhamento',
        'Diversas cores disponíveis'
      ]
    },
    {
      name: 'LowSmell',
      desc: 'Resina com baixo odor, ideal para ambientes fechados',
      indicacao: 'Ambientes fechados, uso doméstico, escritórios',
      caracteristicas: [
        'Baixo odor',
        'Boa precisão',
        'Fácil pós-processamento'
      ],
      cor: 'Bege/Branco'
    }
  ]

  const qualityFeatures = [
    {
      icon: Shield,
      title: 'Controle de Qualidade Rigoroso',
      desc: 'Cada lote passa por testes de viscosidade, tempo de cura e resistência mecânica'
    },
    {
      icon: Award,
      title: 'Certificações e FISPQs',
      desc: 'Todas as resinas possuem FISPQ completa e certificados de conformidade'
    },
    {
      icon: CheckCircle2,
      title: 'Matéria-Prima Premium',
      desc: 'Utilizamos apenas fotoiniciadores e monômeros de fornecedores certificados'
    },
    {
      icon: Sparkles,
      title: 'Consistência entre Lotes',
      desc: 'Garantimos que cada lote tenha as mesmas propriedades e desempenho'
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
          <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8" />
                <div>
                  <h2 className="text-3xl font-bold">Alta Qualidade Quanton3D</h2>
                  <p className="text-pink-100">FISPQs, Resinas e Certificações</p>
                </div>
              </div>
              <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/20">
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-4 bg-gray-50 dark:bg-gray-800 border-b">
            <Button
              onClick={() => setActiveTab('resinas')}
              variant={activeTab === 'resinas' ? 'default' : 'outline'}
              className={activeTab === 'resinas' ? 'bg-gradient-to-r from-pink-500 to-red-500' : ''}
            >
              Nossas Resinas
            </Button>
            <Button
              onClick={() => setActiveTab('fispqs')}
              variant={activeTab === 'fispqs' ? 'default' : 'outline'}
              className={activeTab === 'fispqs' ? 'bg-gradient-to-r from-pink-500 to-red-500' : ''}
            >
              FISPQs
            </Button>
            <Button
              onClick={() => setActiveTab('qualidade')}
              variant={activeTab === 'qualidade' ? 'default' : 'outline'}
              className={activeTab === 'qualidade' ? 'bg-gradient-to-r from-pink-500 to-red-500' : ''}
            >
              Controle de Qualidade
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'resinas' && (
              <div className="grid md:grid-cols-2 gap-6">
                {resinas.map((resina, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                      {resina.name}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{resina.desc}</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mb-3">
                      <p className="text-sm"><strong className="text-blue-700 dark:text-blue-400">🎯 Indicação:</strong> {resina.indicacao}</p>
                    </div>
                    
                    {resina.caracteristicas && resina.caracteristicas.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">✨ Características:</p>
                        <ul className="space-y-1">
                          {resina.caracteristicas.map((caract, idx) => (
                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span>{caract}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {resina.importante && (
                      <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 mb-2">
                        <p className="text-xs text-red-700 dark:text-red-400"><strong>⚠️ IMPORTANTE:</strong> {resina.importante}</p>
                      </div>
                    )}

                    {resina.limitacoes && (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 mb-2">
                        <p className="text-xs text-yellow-700 dark:text-yellow-400"><strong>⚡ LIMITAÇÕES:</strong> {resina.limitacoes}</p>
                      </div>
                    )}

                    {resina.dica && (
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 mb-2">
                        <p className="text-xs text-green-700 dark:text-green-400"><strong>💡 DICA:</strong> {resina.dica}</p>
                      </div>
                    )}

                    {resina.aplicacoes && (
                      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 mb-2">
                        <p className="text-xs text-purple-700 dark:text-purple-400"><strong>🔧 Aplicações:</strong> {resina.aplicacoes}</p>
                      </div>
                    )}

                    {resina.cor && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400"><strong>🎨 Cor:</strong> {resina.cor}</p>
                      </div>
                    )}

                    {resina.observacoes && (
                      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 mt-2">
                        <p className="text-xs text-orange-700 dark:text-orange-400"><strong>📋 Observações:</strong> {resina.observacoes}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'fispqs' && (
              <div>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  Clique para baixar as Fichas de Informação de Segurança de Produtos Químicos
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fispqs.map((fispq, index) => (
                    <a
                      key={index}
                      href={`/docs/${fispq.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Card className="p-4 hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-red-400 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{fispq.name}</p>
                            <p className="text-xs text-gray-500">FISPQ</p>
                          </div>
                          <Download className="h-5 w-5 text-gray-400" />
                        </div>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'qualidade' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Compromisso com a Excelência</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Na Quanton3D, qualidade não é apenas um diferencial - é nossa prioridade absoluta
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {qualityFeatures.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <Card key={index} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold mb-2">{feature.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
