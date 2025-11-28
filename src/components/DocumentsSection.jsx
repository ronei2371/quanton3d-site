import { Card } from '@/components/ui/card.jsx'
import { motion } from 'framer-motion'

export function DocumentsSection() {
  return (
    <section id="documentos" className="container mx-auto px-4 py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      {/* Perguntas Frequentes */}
      <div className="mt-12">
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Perguntas Frequentes
          </h3>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
            Tem dúvidas? Nosso assistente virtual está pronto para ajudar! Clique no ícone do robô no canto inferior direito para conversar com o QuantonBot3D.
          </p>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ou entre em contato pelo WhatsApp: <strong>(31) 3271-6935</strong>
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}
