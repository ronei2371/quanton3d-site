import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Check, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'

export function ContactsTab({ buildAdminUrl, isVisible, onCountChange, refreshKey }) {
  const [contactMessages, setContactMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const loadContactMessages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(buildAdminUrl('/api/contact'))
      const data = await response.json()
      const messages = data.messages || []
      setContactMessages(messages)
      onCountChange?.(messages.length)
    } catch (error) {
      console.error('Erro ao carregar mensagens de contato:', error)
      toast.error('Erro ao carregar mensagens de contato')
    } finally {
      setLoading(false)
    }
  }, [buildAdminUrl, onCountChange])

  const toggleMessageResolved = async (messageId, currentResolved) => {
    try {
      const response = await fetch(buildAdminUrl(`/api/contact/${messageId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: !currentResolved })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Status atualizado com sucesso')
        loadContactMessages()
      } else {
        toast.error('Erro ao atualizar status: ' + (data.error || data.message || ''))
      }
    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error)
      toast.error('Erro ao atualizar status da mensagem')
    }
  }

  useEffect(() => {
    loadContactMessages()
  }, [loadContactMessages, refreshKey])

  return (
    <div className={isVisible ? '' : 'hidden'}>
      <div className="space-y-4">
        {contactMessages.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma mensagem de contato ainda
            </p>
          </Card>
        ) : (
          contactMessages.map((message, index) => (
            <Card 
              key={index} 
              className={`p-6 transition-all ${message.resolved ? 'opacity-60 bg-gray-100 dark:bg-gray-900' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    message.resolved 
                      ? 'bg-green-500' 
                      : 'bg-gradient-to-br from-green-500 to-blue-500'
                  }`}>
                    {message.resolved ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <Mail className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{message.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {message.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {message.phone}
                        </span>
                      )}
                      {message.email && (
                        <span className="truncate">{message.email}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    message.resolved 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : message.status === 'new' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {message.resolved ? 'Resolvido' : message.status === 'new' ? 'Pendente' : message.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              </div>

              <div className="flex gap-2 items-center">
                {message.phone && (
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(`https://wa.me/55${message.phone.replace(/\D/g, '')}?text=Olá ${message.name}, recebemos sua mensagem...`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                {message.email && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`mailto:${message.email}?subject=Re: Contato Quanton3D&body=Olá ${message.name},%0A%0ARecebemos sua mensagem...`, '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={message.resolved ? 'outline' : 'default'}
                  className={message.resolved ? 'border-green-500 text-green-600' : 'bg-blue-600 hover:bg-blue-700'}
                  onClick={() => toggleMessageResolved(message._id, message.resolved)}
                  disabled={loading}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {message.resolved ? 'Reabrir' : 'Marcar Resolvido'}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
