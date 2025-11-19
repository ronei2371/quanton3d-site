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
      name: 'Pyroblast+',
      desc: 'Resina de alta resistência térmica até 238°C (HDT)',
      color: 'Cinza escuro',
      applications: 'Moldes de injeção, peças expostas a calor'
    },
    {
      name: 'Iron 7030',
      desc: 'Resina rígida de alta resistência mecânica',
      color: 'Cinza',
      applications: 'Peças funcionais, protótipos mecânicos'
    },
    {
      name: 'Spin+',
      desc: 'Resina para fundição (castable) - queima limpa',
      color: 'Azul translúcido',
      applications: 'Joalheria, odontologia (fundição por cera perdida)'
    },
    {
      name: 'Spark',
      desc: 'Resina de alta precisão e detalhamento',
      color: 'Diversas cores',
      applications: 'Miniaturas, joias, modelos dentários'
    },
    {
      name: 'FlexForm',
      desc: 'Resina flexível tipo borracha',
      color: 'Preto/Transparente',
      applications: 'Vedações, juntas, peças flexíveis'
    },
    {
      name: 'Alchemist',
      desc: 'Resina de uso geral balanceada',
      color: 'Cinza claro',
      applications: 'Prototipagem geral, modelos conceituais'
    },
    {
      name: 'Poseidon',
      desc: 'Resina lavável em água (sem IPA)',
      color: 'Diversas cores',
      applications: 'Prototipagem geral, modelos conceituais'
    },
    {
      name: 'LowSmell',
      desc: 'Resina com baixo odor',
      color: 'Bege/Branco',
      applications: 'Ambientes fechados, escritórios'
    },
    {
      name: 'Castable',
      desc: 'Resina para fundição profissional',
      color: 'Azul',
      applications: 'Joalheria de precisão, odontologia'
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
                      <div className="space-y-2">
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
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
                <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-300 dark:border-red-700">
                  <h4 className="font-bold text-lg mb-3 text-center text-red-700 dark:text-red-400">⚠️ ALERTA: Resinas Chinesas sem Registro</h4>
                  <div className="space-y-3 text-sm">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold">
                      🚨 Cuidado ao usar produtos químicos sem registro no Brasil!
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
                      <p className="text-red-600 dark:text-red-400 font-semibold">❌ Riscos de resinas não registradas:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• <strong>Saúde:</strong> Composição desconhecida pode causar alergias, irritações ou intoxicação</li>
                        <li>• <strong>Legal:</strong> Uso de produtos não regulamentados pode gerar responsabilidade civil e criminal</li>
                        <li>• <strong>Qualidade:</strong> Sem controle de qualidade, resultados imprevisíveis e inconsistências entre lotes</li>
                        <li>• <strong>Meio Ambiente:</strong> Descarte inadequado de produtos não registrados pode contaminar solo e água</li>
                        <li>• <strong>Segurança:</strong> Ausência de FISPQ e instruções adequadas de manuseio</li>
                      </ul>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
                      <p className="text-green-700 dark:text-green-400 font-semibold">✅ Resinas Quanton3D:</p>
                      <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                        <li>• Registro completo e conformidade com legislação brasileira</li>
                        <li>• FISPQ disponível para todas as resinas</li>
                        <li>• Controle rigoroso de qualidade em cada lote</li>
                        <li>• Suporte técnico especializado</li>
                        <li>• Garantia de origem e rastreabilidade</li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-950/20 dark:to-red-950/20 border-2 border-pink-200 dark:border-pink-800">
                  <h4 className="font-bold text-lg mb-3 text-center">📋 Processo de Controle</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Análise de matéria-prima antes da produção</li>
                    <li>✓ Testes de viscosidade e tempo de cura em cada lote</li>
                    <li>✓ Verificação de resistência mecânica pós-cura</li>
                    <li>✓ Análise de cor e transparência</li>
                    <li>✓ Testes de compatibilidade com diferentes impressoras</li>
                    <li>✓ Documentação completa e rastreabilidade de lotes</li>
                  </ul>
                </Card>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
