import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'

export function ServiceModal({ isOpen, onClose, service }) {
  if (!service) return null

  const serviceContent = {
    nivelamento: {
      title: 'Nivelamento de Plataforma',
      description: 'O nivelamento correto da plataforma é fundamental para o sucesso da impressão 3D.',
      content: [
        'Garante aderência uniforme da primeira camada',
        'Evita falhas de impressão e desperdício de resina',
        'Processo simples usando o método da folha de papel',
        'Deve ser verificado regularmente, especialmente após transporte'
      ],
      tips: 'Dica: Faça o teste da folha de papel em todos os cantos da plataforma. A resistência deve ser uniforme.'
    },
    calibracao: {
      title: 'Calibração de Resina',
      description: 'Cada resina e impressora requer calibração específica para resultados ideais.',
      content: [
        'Use nosso arquivo CALIBRADOR.STL disponível no site',
        'Ajuste o tempo de exposição conforme o resultado',
        'Repita a calibração a cada troca de lote ou resina',
        'Parâmetros iniciais disponíveis no nosso seletor'
      ],
      tips: 'Dica: A peça menor deve encaixar perfeitamente no furo 3 da peça maior.'
    },
    configuracao: {
      title: 'Configuração de Fatiadores',
      description: 'Configuração correta do software de fatiamento é essencial.',
      content: [
        'Ajuste altura de camada conforme a aplicação',
        'Configure suportes adequados para cada geometria',
        'Defina tempos de exposição corretos',
        'Otimize velocidades de lift e retração'
      ],
      tips: 'Dica: Camadas de 0.05mm são ideais para a maioria das aplicações.'
    },
    posicionamento: {
      title: 'Posicionamento de Suportes',
      description: 'Suportes bem posicionados garantem impressões bem-sucedidas.',
      content: [
        'Use suportes em todas as áreas pendentes',
        'Ajuste espessura conforme o tipo de resina',
        'Incline peças para melhor resultado',
        'Evite suportes em áreas visíveis quando possível'
      ],
      tips: 'Dica: Em resinas flexíveis, use suportes com pontas maiores.'
    },
    diagnostico: {
      title: 'Diagnóstico de Problemas',
      description: 'Identifique e resolva problemas comuns de impressão.',
      content: [
        'Falha de aderência: Aumente tempo de base ou nivele',
        'Linhas nas peças: Verifique FEP e limpe LCD',
        'Peças frágeis: Aumente tempo de exposição',
        'Deformações: Melhore posicionamento e suportes'
      ],
      tips: 'Dica: Nosso bot pode analisar fotos de problemas! Envie uma imagem no chat.'
    },
    otimizacao: {
      title: 'Otimização de Parâmetros',
      description: 'Ajuste fino para máxima qualidade e velocidade.',
      content: [
        'Teste diferentes tempos de exposição',
        'Ajuste lift speed para sua resina',
        'Otimize tempo de base conforme aderência',
        'Balance qualidade vs velocidade'
      ],
      tips: 'Dica: Consulte nossa tabela de parâmetros por resina e impressora.'
    },
    chamadas: {
      title: 'Chamadas de Vídeo',
      description: 'Suporte visual em tempo real para casos complexos.',
      content: [
        'Agendamento via WhatsApp',
        'Diagnóstico visual de problemas',
        'Orientação passo a passo',
        'Disponível em horário comercial'
      ],
      tips: 'Contato: (31) 3271-6935'
    },
    prioritario: {
      title: 'Atendimento Prioritário',
      description: 'Suporte dedicado para clientes corporativos e revendedores.',
      content: [
        'Resposta em até 2 horas úteis',
        'Canal direto de comunicação',
        'Suporte técnico especializado',
        'Treinamentos personalizados'
      ],
      tips: 'Entre em contato para saber mais sobre planos corporativos.'
    }
  }

  const data = serviceContent[service]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <Card
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{data.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {data.description}
                </p>

                <div className="space-y-3">
                  {data.content.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30"
                    >
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>

                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                    💡 {data.tips}
                  </p>
                </Card>

                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={() => {
                      onClose()
                      // Aqui você pode adicionar lógica para abrir o chat
                      window.dispatchEvent(new CustomEvent('openChat', { detail: { message: `Preciso de ajuda com ${data.title}` } }))
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Falar com o Bot
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
