import { useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Shield, AlertTriangle, Settings, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function TechnicalTabs() {
  return (
    <section id="informacoes-tecnicas" className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4">Informações Técnicas</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Segurança, toxicidade e parâmetros de impressão
        </p>
      </motion.div>

      <Tabs defaultValue="epi" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="epi" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">EPIs</span>
          </TabsTrigger>
          <TabsTrigger value="toxicidade" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Toxicidade</span>
          </TabsTrigger>
          <TabsTrigger value="parametros" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Parâmetros</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="epi">
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Equipamentos de Proteção Individual (EPIs)
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  Por que usar EPIs?
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  As resinas UV para impressão 3D SLA/DLP contêm compostos químicos reativos que, em sua forma líquida não curada, 
                  podem causar irritações na pele, alergias e problemas respiratórios. O uso de EPIs adequados é <strong>obrigatório</strong> 
                  para garantir sua segurança durante todo o processo de impressão, limpeza e pós-processamento.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <h5 className="font-bold mb-2 text-blue-900 dark:text-blue-100">1. Luvas de Nitrilo</h5>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• <strong>Essencial:</strong> Nunca manuseie resina sem luvas</li>
                    <li>• Use luvas de <strong>nitrilo</strong>, não látex</li>
                    <li>• Troque as luvas regularmente durante o trabalho</li>
                    <li>• Descarte adequadamente após o uso</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                  <h5 className="font-bold mb-2 text-purple-900 dark:text-purple-100">2. Óculos de Proteção</h5>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Protege contra respingos de resina</li>
                    <li>• Use óculos com proteção lateral</li>
                    <li>• Evita contato com os olhos</li>
                    <li>• Essencial durante limpeza e pós-processamento</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <h5 className="font-bold mb-2 text-green-900 dark:text-green-100">3. Máscara Respiratória</h5>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Use máscara com filtro para vapores orgânicos</li>
                    <li>• Protege contra COVs (Compostos Orgânicos Voláteis)</li>
                    <li>• Recomendado: máscara PFF2/N95 ou superior</li>
                    <li>• Troque os filtros conforme recomendação do fabricante</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                  <h5 className="font-bold mb-2 text-orange-900 dark:text-orange-100">4. Avental e Proteção Corporal</h5>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Use avental impermeável ou jaleco</li>
                    <li>• Protege roupas de respingos</li>
                    <li>• Evita contato com a pele</li>
                    <li>• Lave separadamente de outras roupas</li>
                  </ul>
                </Card>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500 p-4">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ IMPORTANTE: Ventilação Adequada
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Trabalhe sempre em ambiente bem ventilado. Se possível, use exaustor ou trabalhe próximo a janelas abertas. 
                  A ventilação adequada reduz significativamente a exposição a vapores nocivos.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="toxicidade">
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Toxicidade e Segurança das Resinas UV
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  Composição Química e Riscos
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  As resinas UV para impressão 3D são compostas por <strong>monômeros e oligômeros fotopolimerizáveis</strong>, 
                  fotoiniciadores e aditivos. Na forma líquida (não curada), esses compostos são <strong>altamente reativos</strong> 
                  e podem apresentar riscos à saúde humana.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                  <h5 className="font-bold mb-2 text-red-900 dark:text-red-100">Contato com a Pele</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• <strong>Irritação cutânea:</strong> Vermelhidão, coceira e queimação</li>
                    <li>• <strong>Dermatite de contato:</strong> Pode desenvolver com exposição repetida</li>
                    <li>• <strong>Sensibilização:</strong> O corpo pode se tornar hipersensível após exposições</li>
                    <li>• <strong>Queimaduras químicas:</strong> Em casos de exposição prolongada</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                  <h5 className="font-bold mb-2 text-orange-900 dark:text-orange-100">Inalação de Vapores</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• <strong>COVs (Compostos Orgânicos Voláteis):</strong> Liberados durante impressão</li>
                    <li>• <strong>Irritação respiratória:</strong> Tosse, falta de ar, desconforto</li>
                    <li>• <strong>Náusea e tontura:</strong> Em ambientes mal ventilados</li>
                    <li>• <strong>Efeitos a longo prazo:</strong> Exposição crônica pode causar problemas respiratórios</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                  <h5 className="font-bold mb-2 text-purple-900 dark:text-purple-100">Contato com os Olhos</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• <strong>Irritação severa:</strong> Vermelhidão e dor intensa</li>
                    <li>• <strong>Danos à córnea:</strong> Em casos de exposição prolongada</li>
                    <li>• <strong>Ação imediata:</strong> Lave com água corrente por 15 minutos</li>
                    <li>• <strong>Procure atendimento médico</strong> após lavagem</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800">
                  <h5 className="font-bold mb-2 text-pink-900 dark:text-pink-100">Ingestão Acidental</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• <strong>Altamente tóxico:</strong> Nunca ingira resina</li>
                    <li>• <strong>Sintomas:</strong> Náusea, vômito, dor abdominal</li>
                    <li>• <strong>NÃO induza vômito</strong></li>
                    <li>• <strong>Procure atendimento médico imediatamente</strong></li>
                  </ul>
                </Card>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  Resinas Biocompatíveis e Reações Individuais
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Mesmo as <strong>resinas biocompatíveis</strong>, certificadas para uso médico e odontológico, podem causar 
                  reações em alguns indivíduos. Isso ocorre porque:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6">
                  <li>• <strong>Sensibilidade individual:</strong> Cada pessoa pode reagir diferentemente aos componentes químicos</li>
                  <li>• <strong>Alergias específicas:</strong> Alguns fotoiniciadores ou aditivos podem causar reações alérgicas</li>
                  <li>• <strong>Histórico de sensibilização:</strong> Exposição prévia a químicos similares aumenta o risco</li>
                  <li>• <strong>Cura incompleta:</strong> Resina mal curada mantém compostos reativos que podem causar reações</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-4">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  🚨 ATENÇÃO: Resina Curada vs Não Curada
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  A resina <strong>não curada (líquida)</strong> é altamente tóxica. Após a cura completa com luz UV, 
                  a toxicidade é drasticamente reduzida, mas ainda assim recomenda-se evitar contato prolongado com a pele. 
                  Sempre realize pós-cura adequada para garantir polimerização completa.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  Primeiros Socorros
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Contato com a pele:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Remova roupas contaminadas. Lave a área com água e sabão abundantemente por pelo menos 15 minutos. 
                      Se irritação persistir, procure atendimento médico.
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Contato com os olhos:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Lave imediatamente com água corrente por 15 minutos, mantendo as pálpebras abertas. 
                      Procure atendimento médico imediatamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="parametros">
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Parâmetros de Impressão
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  Configurações Principais
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Os parâmetros de impressão variam de acordo com a <strong>impressora</strong>, <strong>tipo de resina</strong> 
                  e <strong>temperatura ambiente</strong>. Abaixo estão os parâmetros gerais recomendados como ponto de partida.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <h5 className="font-bold mb-3 text-blue-900 dark:text-blue-100">Altura de Camada</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• <strong>Alta resolução:</strong> 0.025mm - 0.05mm</li>
                    <li>• <strong>Resolução padrão:</strong> 0.05mm - 0.1mm</li>
                    <li>• <strong>Impressão rápida:</strong> 0.1mm - 0.2mm</li>
                    <li className="text-xs italic mt-2">Camadas menores = mais detalhes, mas tempo maior</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                  <h5 className="font-bold mb-3 text-purple-900 dark:text-purple-100">Tempo de Exposição</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• <strong>Tela monocromática:</strong> 0.5s - 5s por camada</li>
                    <li>• <strong>Tela RGB:</strong> 2s - 20s por camada</li>
                    <li>• <strong>Primeiras camadas:</strong> 20s - 60s (burn-in)</li>
                    <li className="text-xs italic mt-2">Ajuste conforme a resina e potência UV</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <h5 className="font-bold mb-3 text-green-900 dark:text-green-100">Velocidade de Elevação</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• <strong>Lift speed (subida):</strong> 60-180 mm/min</li>
                    <li>• <strong>Retract speed (descida):</strong> 150-240 mm/min</li>
                    <li>• <strong>Lift distance:</strong> 5-10mm</li>
                    <li className="text-xs italic mt-2">Velocidades maiores reduzem tempo, mas aumentam risco de falhas</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                  <h5 className="font-bold mb-3 text-orange-900 dark:text-orange-100">Temperatura Ambiente</h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• <strong>Temperatura ideal:</strong> 20°C - 30°C</li>
                    <li>• <strong>Abaixo de 20°C:</strong> Resina mais viscosa, impressão lenta</li>
                    <li>• <strong>Acima de 30°C:</strong> Resina menos viscosa, pode escorrer</li>
                    <li className="text-xs italic mt-2">Mantenha temperatura estável durante impressão</li>
                  </ul>
                </Card>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  Parâmetros por Tipo de Resina Quanton3D
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <th className="p-3 text-left">Tipo de Resina</th>
                        <th className="p-3 text-center">Altura Camada</th>
                        <th className="p-3 text-center">Exposição Normal</th>
                        <th className="p-3 text-center">Exposição Base</th>
                        <th className="p-3 text-center">Lift Speed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-blue-50 dark:hover:bg-blue-950/30">
                        <td className="p-3 font-semibold">Resina Padrão</td>
                        <td className="p-3 text-center">0.05mm</td>
                        <td className="p-3 text-center">2.5s - 3.5s</td>
                        <td className="p-3 text-center">30s - 40s</td>
                        <td className="p-3 text-center">120 mm/min</td>
                      </tr>
                      <tr className="hover:bg-purple-50 dark:hover:bg-purple-950/30">
                        <td className="p-3 font-semibold">Resina Flexível</td>
                        <td className="p-3 text-center">0.05mm</td>
                        <td className="p-3 text-center">3.5s - 5s</td>
                        <td className="p-3 text-center">35s - 50s</td>
                        <td className="p-3 text-center">80 mm/min</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                  * Valores para impressoras com tela monocromática. Ajuste conforme sua impressora específica.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 DICA: Teste de Exposição
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Sempre realize um <strong>teste de exposição (exposure test)</strong> ao usar uma resina pela primeira vez. 
                  Isso ajuda a encontrar o tempo ideal para sua impressora específica. Comece com os valores recomendados 
                  e ajuste em incrementos de 0.5s até obter a qualidade desejada.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  Fatores que Afetam os Parâmetros
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Cor da Resina</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Resinas escuras precisam de mais tempo de exposição que resinas claras ou transparentes.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Idade da Resina</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Resinas antigas ou expostas à luz podem precisar de ajustes nos tempos de exposição.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-950/30 dark:to-red-950/30 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Potência UV</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      LEDs UV envelhecem e perdem potência. Ajuste os tempos se notar mudanças na qualidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}
