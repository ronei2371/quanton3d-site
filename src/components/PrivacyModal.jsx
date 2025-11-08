import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'
import { Shield, FileText, CheckCircle2 } from 'lucide-react'

export function PrivacyModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasAccepted, setHasAccepted] = useState(false)

  useEffect(() => {
    // Verificar se já aceitou os termos
    const accepted = localStorage.getItem('quanton3d_privacy_accepted')
    if (!accepted) {
      setIsOpen(true)
    } else {
      setHasAccepted(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('quanton3d_privacy_accepted', 'true')
    localStorage.setItem('quanton3d_privacy_date', new Date().toISOString())
    setHasAccepted(true)
    setIsOpen(false)
  }

  const handleDecline = () => {
    alert('Você precisa aceitar os termos para usar o site.')
  }

  if (!isOpen || hasAccepted) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        style={{ pointerEvents: 'all' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-white dark:bg-gray-900 shadow-2xl border-4 border-blue-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Shield className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Termos de Uso e Privacidade</h2>
                  <p className="text-blue-100 mt-1">Quanton3D - Resinas UV SLA</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Política de Privacidade */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-bold">Política de Privacidade</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>1. Coleta de Dados:</strong> Coletamos apenas informações necessárias para fornecer nossos serviços, 
                      como nome, telefone e e-mail quando você entra em contato conosco.
                    </p>
                    <p>
                      <strong>2. Uso de Dados:</strong> Seus dados são utilizados exclusivamente para:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Atendimento e suporte técnico</li>
                      <li>Processamento de pedidos</li>
                      <li>Comunicação sobre produtos e serviços</li>
                      <li>Melhorias no atendimento</li>
                    </ul>
                    <p>
                      <strong>3. Proteção:</strong> Implementamos medidas de segurança para proteger suas informações pessoais 
                      contra acesso não autorizado, alteração, divulgação ou destruição.
                    </p>
                    <p>
                      <strong>4. Compartilhamento:</strong> NÃO vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros 
                      para fins de marketing.
                    </p>
                    <p>
                      <strong>5. Cookies:</strong> Utilizamos cookies apenas para melhorar sua experiência de navegação e lembrar suas preferências.
                    </p>
                  </div>
                </div>

                {/* Termos de Uso */}
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    <h3 className="text-xl font-bold">Termos de Uso</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>1. Produtos Químicos:</strong> Nossas resinas são produtos químicos que devem ser manuseados com cuidado. 
                      É obrigatório o uso de EPIs (luvas, óculos, máscara).
                    </p>
                    <p>
                      <strong>2. Responsabilidade:</strong> O usuário é responsável pelo uso adequado dos produtos conforme as FISPQs 
                      e instruções fornecidas.
                    </p>
                    <p>
                      <strong>3. Uso Profissional:</strong> Nossos produtos são destinados a uso profissional ou hobbyista experiente. 
                      MANTER FORA DO ALCANCE DE CRIANÇAS E ANIMAIS.
                    </p>
                    <p>
                      <strong>4. Suporte Técnico:</strong> Fornecemos suporte técnico gratuito para uso de nossos produtos. 
                      NÃO fornecemos suporte para produtos de outras marcas.
                    </p>
                    <p>
                      <strong>5. Garantia:</strong> Garantimos a qualidade de nossos produtos. Em caso de defeito de fabricação, 
                      entre em contato em até 7 dias após o recebimento.
                    </p>
                  </div>
                </div>

                {/* FISPQ e Segurança */}
                <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-6 border-2 border-red-300 dark:border-red-700">
                  <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-3">
                    ⚠️ Avisos Importantes de Segurança
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>• <strong>Tóxico para organismos aquáticos</strong> - NÃO descartar em água ou solo</p>
                    <p>• <strong>Pode causar irritação</strong> - Evitar contato com pele e olhos</p>
                    <p>• <strong>Vapores nocivos</strong> - Usar em ambiente ventilado</p>
                    <p>• <strong>Fotossensível</strong> - Não expor à luz solar direta antes da cura</p>
                    <p>• <strong>Consulte as FISPQs</strong> - Disponíveis na seção "Documentos e FISPQs"</p>
                  </div>
                </div>

                {/* Contato */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Contato:</strong> atendimento@quanton3d.com.br | (31) 3271-6935<br />
                    <strong>Endereço:</strong> Av. Dom Pedro II, 5.056 – Jardim Montanhês, Belo Horizonte – MG
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Botões */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 border-t">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ao aceitar, você concorda com nossos termos de uso e política de privacidade.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                    className="px-6"
                  >
                    Recusar
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Aceitar e Continuar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
