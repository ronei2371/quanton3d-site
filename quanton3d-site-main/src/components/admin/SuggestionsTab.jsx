import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Calendar, Check, Clock, Edit3, Phone, User, X, Image as ImageIcon, Paperclip } from 'lucide-react'
import { toast } from 'sonner'

const normalizeSuggestion = (item = {}) => {
  const fallbackId = item?._id ?? item?.id ?? item?.odId ?? item?.odIdLegacy ?? null
  const fallbackTimestamp = item?.timestamp ?? item?.createdAt ?? item?.created_at ?? item?.date ?? new Date().toISOString()

  const attachments = []
  if (Array.isArray(item.attachments)) {
    attachments.push(...item.attachments.filter(Boolean))
  }
  if (item.imageUrl) attachments.push(item.imageUrl)
  if (item.fileUrl) attachments.push(item.fileUrl)

  return {
    ...item,
    id: fallbackId,
    _id: fallbackId,
    userName: item?.userName ?? item?.name ?? 'Usuário',
    userPhone: item?.userPhone ?? item?.phone ?? 'N/A',
    lastUserMessage: item?.lastUserMessage ?? item?.question ?? item?.prompt ?? '',
    lastBotReply: item?.lastBotReply ?? item?.answer ?? item?.response ?? '',
    timestamp: fallbackTimestamp,
    attachments
  }
}

const isImage = (url = '') => {
  if (!url) return false
  if (url.startsWith('data:image')) return true
  return /(png|jpg|jpeg|gif|webp)$/i.test(url.split('?')[0])
}

export function SuggestionsTab({ buildAdminUrl, isAdmin, isVisible, onCountChange, refreshKey, adminToken }) {
  const [suggestions, setSuggestions] = useState([])
  const [editingSuggestion, setEditingSuggestion] = useState(null)
  const [editedText, setEditedText] = useState('')

  const updateCount = useCallback((items) => {
    const pending = items.filter((entry) => (entry.status || 'pending') === 'pending').length
    onCountChange?.(pending)
  }, [onCountChange])

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await fetch(buildAdminUrl('/api/suggestions'), {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      })
      const data = await response.json()
      const mappedSuggestions = (data.suggestions || []).map(normalizeSuggestion)
      setSuggestions(mappedSuggestions)
      updateCount(mappedSuggestions)
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
      toast.error('Erro ao carregar sugestões')
    }
  }, [adminToken, buildAdminUrl, updateCount])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions, refreshKey])

  const removeSuggestion = useCallback((suggestionId) => {
    setSuggestions((prev) => {
      const updated = prev.filter((suggestion) => suggestion._id !== suggestionId)
      updateCount(updated)
      return updated
    })
  }, [updateCount])

  const approveSuggestion = useCallback(async (suggestionIdentifier, editedAnswer) => {
    const suggestionId = suggestionIdentifier?._id || suggestionIdentifier
    if (!suggestionId) {
      toast.error('Sugestão inválida')
      return false
    }

    try {
      const requestConfig = { method: 'PUT' }

      if (editedAnswer !== undefined) {
        requestConfig.headers = { 'Content-Type': 'application/json' }
        requestConfig.body = JSON.stringify({ editedAnswer })
      }

      const response = await fetch(buildAdminUrl(`/api/approve-suggestion/${suggestionId}`), {
        ...requestConfig,
        headers: {
          ...(requestConfig.headers || {}),
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        }
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Sugestão aprovada com sucesso!')
        removeSuggestion(suggestionId)
        setEditingSuggestion(null)
        setEditedText('')
        return true
      }

      toast.error('Erro: ' + data.message)
      return false
    } catch (error) {
      toast.error('Erro ao aprovar: ' + error.message)
      return false
    }
  }, [adminToken, buildAdminUrl, removeSuggestion])

  const rejectSuggestion = useCallback(async (suggestionId) => {
    try {
      const response = await fetch(buildAdminUrl(`/api/reject-suggestion/${suggestionId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        }
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Sugestão rejeitada')
        removeSuggestion(suggestionId)
        return true
      }

      toast.error('Erro: ' + data.message)
      return false
    } catch (error) {
      toast.error('Erro ao rejeitar: ' + error.message)
      return false
    }
  }, [adminToken, buildAdminUrl, removeSuggestion])

  return (
    <div className={`space-y-4 ${isVisible ? '' : 'hidden'}`}>
      {suggestions.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Nenhuma sugestão pendente no momento
          </p>
        </Card>
      ) : (
        suggestions.map((suggestion) => (
          <Card key={suggestion._id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{suggestion.userName}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {suggestion.userPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(suggestion.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                suggestion.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : suggestion.status === 'approved'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {suggestion.status === 'pending' ? 'Pendente' : suggestion.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
              </span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-3">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">PERGUNTA DO CLIENTE</p>
              <p className="text-sm whitespace-pre-wrap">{suggestion.lastUserMessage || 'Pergunta não disponível'}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">RESPOSTA DO BOT</p>
              <p className="text-sm whitespace-pre-wrap">{suggestion.lastBotReply || 'Resposta não disponível'}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">SUGESTÃO DO CLIENTE</p>
              <p className="text-sm whitespace-pre-wrap">{suggestion.suggestion}</p>
            </div>

            {suggestion.attachments?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4 border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <Paperclip className="h-3 w-3" /> ANEXOS
                </p>
                <div className="flex flex-wrap gap-3">
                  {suggestion.attachments.map((attachment, index) => (
                    isImage(attachment) ? (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <img
                          src={attachment}
                          alt={`Anexo ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:opacity-90 transition"
                        />
                      </a>
                    ) : (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-300 underline"
                      >
                        <ImageIcon className="h-4 w-4" /> Abrir anexo {index + 1}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

            {suggestion.status === 'pending' && (
              <>
                {editingSuggestion === suggestion._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1 block">RESPOSTA CORRIGIDA (será salva no RAG)</label>
                      <textarea
                        className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 min-h-[120px]"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        placeholder="Escreva a resposta técnica correta que o bot deveria ter dado..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => approveSuggestion(suggestion._id, editedText)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar com Correção
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditingSuggestion(null)
                          setEditedText('')
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => approveSuggestion(suggestion._id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setEditingSuggestion(suggestion._id)
                          setEditedText(suggestion.lastBotReply || '')
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar Resposta
                      </Button>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => rejectSuggestion(suggestion._id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      )}
                  </div>
                )}
              </>
            )}
          </Card>
        ))
      )}
    </div>
  )
}
