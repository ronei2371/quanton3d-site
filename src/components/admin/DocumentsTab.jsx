import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { FileText, Loader2, Plus, Edit3, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

const normalizeSource = (value) => (value && value.trim()) || 'admin-panel'

const parseTagsString = (value, fallback = 'general') => {
  const tags = (value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  return tags.length > 0 ? tags : [fallback]
}

const getDocTags = (doc) => {
  if (Array.isArray(doc?.tags) && doc.tags.length > 0) return doc.tags
  return ['general']
}

export function DocumentsTab({ isAdmin, refreshKey = 0 }) {
  const [knowledgeTitle, setKnowledgeTitle] = useState('')
  const [knowledgeContent, setKnowledgeContent] = useState('')
  const [knowledgeTags, setKnowledgeTags] = useState('general')
  const [knowledgeSource, setKnowledgeSource] = useState('admin-panel')
  const [addingKnowledge, setAddingKnowledge] = useState(false)
  const [knowledgeDocuments, setKnowledgeDocuments] = useState([])
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [knowledgeDateStart, setKnowledgeDateStart] = useState('')
  const [knowledgeDateEnd, setKnowledgeDateEnd] = useState('')
  const [editingKnowledge, setEditingKnowledge] = useState(null)
  const [editKnowledgeTitle, setEditKnowledgeTitle] = useState('')
  const [editKnowledgeContent, setEditKnowledgeContent] = useState('')
  const [editKnowledgeTags, setEditKnowledgeTags] = useState('general')
  const [editKnowledgeSource, setEditKnowledgeSource] = useState('admin-panel')

  const documentsApiBaseUrl = useMemo(() => (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, ''), [])

  const buildDocumentsUrl = useCallback(
    (path, params = {}) => {
      const url = new URL(path, `${documentsApiBaseUrl}/`)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value)
        }
      })
      return url.toString()
    },
    [documentsApiBaseUrl]
  )

  const loadKnowledgeDocuments = useCallback(async () => {
    setKnowledgeLoading(true)
    try {
      const response = await fetch(buildDocumentsUrl('/api/knowledge'))
      const data = await response.json()
      setKnowledgeDocuments(data.documents || [])
    } catch (error) {
      console.error('Erro ao carregar documentos de conhecimento:', error)
    } finally {
      setKnowledgeLoading(false)
    }
  }, [buildDocumentsUrl])

  useEffect(() => {
    loadKnowledgeDocuments()
  }, [loadKnowledgeDocuments, refreshKey])

  const deleteKnowledgeDocument = async (id) => {
    if (!isAdmin) {
      toast.warning('Seu nivel de acesso nao permite excluir dados.')
      return
    }
    if (!confirm('Tem certeza que deseja deletar este documento? Esta acao nao pode ser desfeita.')) return
    try {
      const response = await fetch(buildDocumentsUrl(`/api/knowledge/${id}`), {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Documento deletado com sucesso!')
        loadKnowledgeDocuments()
      } else {
        toast.error('Erro: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao deletar documento:', error)
      toast.error('Erro ao deletar documento')
    }
  }

  const openEditKnowledge = (doc) => {
    setEditingKnowledge(doc)
    setEditKnowledgeTitle(doc.title || '')
    setEditKnowledgeContent(doc.content || '')
    setEditKnowledgeTags(getDocTags(doc).join(', '))
    setEditKnowledgeSource(normalizeSource(doc.source))
  }

  const saveEditKnowledge = async () => {
    if (!editingKnowledge) return
    if (!editKnowledgeTitle.trim() || !editKnowledgeContent.trim()) {
      toast.warning('Preencha titulo e conteudo!')
      return
    }
    try {
      const tags = parseTagsString(editKnowledgeTags)
      const source = normalizeSource(editKnowledgeSource)
      const response = await fetch(buildDocumentsUrl(`/api/knowledge/${editingKnowledge._id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editKnowledgeTitle,
          content: editKnowledgeContent,
          tags,
          source
        })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Documento atualizado com sucesso!')
        setEditingKnowledge(null)
        loadKnowledgeDocuments()
      } else {
        toast.error('Erro: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
      toast.error('Erro ao atualizar documento')
    }
  }

  const getFilteredKnowledgeDocuments = () => {
    if (!knowledgeDateStart && !knowledgeDateEnd) return knowledgeDocuments
    return knowledgeDocuments.filter((doc) => {
      if (!doc.createdAt) return true
      const docDate = new Date(doc.createdAt)
      if (knowledgeDateStart && docDate < new Date(knowledgeDateStart)) return false
      if (knowledgeDateEnd && docDate > new Date(knowledgeDateEnd + 'T23:59:59')) return false
      return true
    })
  }

  const handleAddKnowledge = async () => {
    if (!knowledgeTitle.trim() || !knowledgeContent.trim()) {
      toast.warning('Preencha título e conteúdo!')
      return
    }
    const tags = parseTagsString(knowledgeTags)
    const source = normalizeSource(knowledgeSource)
    setAddingKnowledge(true)
    try {
      const response = await fetch(buildDocumentsUrl('/add-knowledge'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: knowledgeTitle,
          content: knowledgeContent,
          tags,
          source
        })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Conhecimento adicionado com sucesso! O bot ja pode usar essa informacao.')
        setKnowledgeTitle('')
        setKnowledgeContent('')
        setKnowledgeTags('general')
        setKnowledgeSource('admin-panel')
      } else {
        toast.error('Erro: ' + data.error)
      }
    } catch (error) {
      toast.error('Erro ao adicionar conhecimento: ' + error.message)
    } finally {
      setAddingKnowledge(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Novo Conhecimento ao RAG
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Adicione manualmente novos conhecimentos que o bot deverá aprender. O conteúdo será salvo como arquivo .txt na base de conhecimento RAG.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título do Conhecimento</label>
            <Input
              placeholder="Ex: Configurações de impressão para resina ABS-Like"
              value={knowledgeTitle}
              onChange={(e) => setKnowledgeTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tags (separe por vírgula)</label>
            <Input
              placeholder="ex: impressao, abs-like, parametros"
              value={knowledgeTags}
              onChange={(e) => setKnowledgeTags(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo de uma tag; usamos "general" por padrão.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fonte (opcional)</label>
            <Input
              placeholder="ex: admin-panel, documento interno, link"
              value={knowledgeSource}
              onChange={(e) => setKnowledgeSource(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Conteúdo</label>
            <textarea
              className="w-full min-h-[200px] p-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o conteúdo completo que o bot deverá aprender...\n\nEx:\nPara impressão com resina ABS-Like:\n- Temperatura: 25-30°C\n- Tempo de exposição: 2-3s\n- Lift speed: 60mm/min"
              value={knowledgeContent}
              onChange={(e) => setKnowledgeContent(e.target.value)}
            />
          </div>
          <Button
            onClick={handleAddKnowledge}
            disabled={addingKnowledge}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <FileText className="h-4 w-4 mr-2" />
            {addingKnowledge ? 'Adicionando...' : 'Adicionar ao Conhecimento'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">💡 Dicas de Uso</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• <strong>Seja específico:</strong> Quanto mais detalhado o conteúdo, melhor o bot responderá</li>
          <li>• <strong>Use linguagem natural:</strong> Escreva como se estivesse explicando para um cliente</li>
          <li>• <strong>Organize por tópicos:</strong> Use títulos claros que facilitem a busca semântica</li>
          <li>• <strong>Inclua exemplos:</strong> Casos práticos ajudam o bot a contextualizar respostas</li>
          <li>• <strong>Atualize regularmente:</strong> Adicione novos conhecimentos conforme surgem dúvidas frequentes</li>
        </ul>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos de Conhecimento ({getFilteredKnowledgeDocuments().length})
          </h3>
          <Button onClick={loadKnowledgeDocuments} variant="outline" size="sm" disabled={knowledgeLoading}>
            {knowledgeLoading ? 'Carregando...' : 'Atualizar Lista'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm font-medium">Filtrar por data:</span>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={knowledgeDateStart}
              onChange={(e) => setKnowledgeDateStart(e.target.value)}
              className="w-40 text-sm"
              placeholder="Data inicio"
            />
            <span className="text-gray-500">ate</span>
            <Input
              type="date"
              value={knowledgeDateEnd}
              onChange={(e) => setKnowledgeDateEnd(e.target.value)}
              className="w-40 text-sm"
              placeholder="Data fim"
            />
          </div>
          {(knowledgeDateStart || knowledgeDateEnd) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setKnowledgeDateStart(''); setKnowledgeDateEnd(''); }}
              className="text-gray-500"
            >
              Limpar filtro
            </Button>
          )}
        </div>

        {knowledgeLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : getFilteredKnowledgeDocuments().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum documento de conhecimento encontrado</p>
            <p className="text-sm">Adicione conhecimentos usando o formulario acima</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getFilteredKnowledgeDocuments().map((doc) => (
              <div key={doc._id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{doc.title || 'Sem titulo'}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {doc.content ? doc.content.substring(0, 150) + (doc.content.length > 150 ? '...' : '') : 'Sem conteudo'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
                    {getDocTags(doc).map((tag) => (
                      <span
                        key={`${doc._id || 'doc'}-${tag}`}
                        className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-blue-800 dark:text-blue-100">
                      {normalizeSource(doc.source)}
                    </span>
                    {doc.createdAt && <span>{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {isAdmin && (
                    <>
                      <Button
                        onClick={() => openEditKnowledge(doc)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                        title="Editar documento"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteKnowledgeDocument(doc._id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        title="Excluir documento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editingKnowledge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Editar Conhecimento</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingKnowledge(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titulo</label>
                <Input
                  value={editKnowledgeTitle}
                  onChange={(e) => setEditKnowledgeTitle(e.target.value)}
                  placeholder="Titulo do conhecimento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (separe por vírgula)</label>
                <Input
                  value={editKnowledgeTags}
                  onChange={(e) => setEditKnowledgeTags(e.target.value)}
                  placeholder="ex: impressao, abs-like, parametros"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fonte (opcional)</label>
                <Input
                  value={editKnowledgeSource}
                  onChange={(e) => setEditKnowledgeSource(e.target.value)}
                  placeholder="ex: admin-panel, documento interno, link"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Conteudo</label>
                <textarea
                  className="w-full min-h-[200px] p-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                  value={editKnowledgeContent}
                  onChange={(e) => setEditKnowledgeContent(e.target.value)}
                  placeholder="Conteudo do conhecimento"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingKnowledge(null)}>
                  Cancelar
                </Button>
                <Button onClick={saveEditKnowledge} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Salvar Alteracoes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
