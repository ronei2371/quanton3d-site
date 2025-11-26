import { Card } from '@/components/ui/card.jsx'
import { Download, Shield, Info, Truck } from 'lucide-react'
import { motion } from 'framer-motion'

export function DocumentsSection() {
  const documents = [
    { 
      name: 'Política de Privacidade', 
      file: 'PolíticadePrivacidade.docx.pdf',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      name: 'Quem Somos', 
      file: 'QuemSomosnos.docx.pdf',
      icon: Info,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      name: 'Coletas e Entregas', 
      file: 'ColetaseEntregas.pdf',
      icon: Truck,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <section id="documentos" className="container mx-auto px-4 py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4">Documentos</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Documentos institucionais importantes
        </p>
      </motion.div>

      {/* Documentos Institucionais */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Documentos Institucionais
          </span>
        </h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {documents.map((doc, index) => {
            const Icon = doc.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <a 
                  href={`/docs/${doc.file}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 hover:border-purple-400 dark:hover:border-purple-600 cursor-pointer h-full">
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-center mb-2">{doc.name}</h4>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Download className="h-4 w-4" />
                      <span>Baixar PDF</span>
                    </div>
                  </Card>
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>

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
