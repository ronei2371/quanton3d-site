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

const buildAuthHeaders = (adminToken, extra = {}) => ({
  ...extra,
  ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
})

export function DocumentsTab({ isAdmin, refreshKey = 0, buildAdminUrl, adminToken }) {
  const [knowledgeTitle, setKnowledgeTitle] = useState('')
  const [knowledgeContent, setKnowledgeContent] = useState('')
  const [knowledgeTags, setKnowledgeTags] = useState('general')
  const [knowledgeSource, setKnowledgeSource] = useState('admin-panel')
  const [addingKnowledge, setAddingKnowledge] = useState(false)
  const [knowledgeDocuments, setKnowledgeDocuments] = useState([])
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [editingKnowledge, setEditingKnowledge] = useState(null)
  const [editKnowledgeTitle, setEditKnowledgeTitle] = useState('')
  const [editKnowledgeContent, setEditKnowledgeContent] = useState('')
  const [editKnowledgeTags, setEditKnowledgeTags] = useState('general')
  const [editKnowledgeSource, setEditKnowledgeSource] = useState('admin-panel')

  const documentsApiBaseUrl = useMemo(() => (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, ''), [])

  const buildDocumentsUrl = useCallback(
    (path, params = {}) => {
      if (buildAdminUrl) {
        return buildAdminUrl(path, params)
      }

      const url = new URL(path, `${documentsApiBaseUrl}/`)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value)
        }
      })
      return url.toString()
    },
    [buildAdminUrl, documentsApiBaseUrl]
  )

  const loadKnowledgeDocuments = useCallback(async () => {
    setKnowledgeLoading(true)
    try {
      const response = await fetch(buildDocumentsUrl('/api/knowledge/list', { limit: 100 }), {
        headers: buildAuthHeaders(adminToken)
      })
      const data = await response.json().catch(() => ({}))
      setKnowledgeDocuments(data.documents || [])
    } catch (error) {
      console.error('Erro ao carregar documentos de conhecimento:', error)
      toast.error('Erro ao carregar documentos de conhecimento')
    } finally {
      setKnowledgeLoading(false)
    }
  }, [adminToken, buildDocumentsUrl])

  useEffect(() => {
    loadKnowledgeDocuments()
  }, [loadKnowledgeDocuments, refreshKey])

  const deleteKnowledgeDocument = async (id) => {
    if (!isAdmin) {
      toast.warning('Seu nível de acesso não permite excluir dados.')
      return
    }
    if (!confirm('Tem certeza que deseja deletar este documento? Esta ação não pode ser desfeita.')) return
    try {
      const response = await fetch(buildDocumentsUrl(`/api/knowledge/${id}`), {
        method: 'DELETE',
        headers: buildAuthHeaders(adminToken)
      })
      const data = await response.json().catch(() => ({}))
      if (data.success) {
        toast.success('Documento deletado com sucesso!')
        loadKnowledgeDocuments()
      } else {
        toast.error('Erro: ' + (data.error || data.message || ''))
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
      toast.warning('Preencha título e conteúdo!')
      return
    }
    try {
      const tags = parseTagsString(editKnowledgeTags)
      const source = normalizeSource(editKnowledgeSource)
      const response = await fetch(buildDocumentsUrl(`/api/knowledge/${editingKnowledge._id || editingKnowledge.id}`), {
        method: 'PUT',
        headers: buildAuthHeaders(adminToken, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          title: editKnowledgeTitle,
          content: editKnowledgeContent,
          tags,
          source
        })
      })
      const data = await response.json().catch(() => ({}))
      if (data.success) {
        toast.success('Documento atualizado com sucesso!')
        setEditingKnowledge(null)
        loadKnowledgeDocuments()
      } else {
        toast.error('Erro: ' + (data.error || data.message || ''))
      }
    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
      toast.error('Erro ao atualizar documento')
    }
  }

  const addKnowledgeDocument = async () => {
    if (!knowledgeTitle.trim() || !knowledgeContent.trim()) {
      toast.warning('Preencha título e conteúdo!')
      return
    }
    setAddingKnowledge(true)
    try {
      const tags = parseTagsString(knowledgeTags)
      const source = normalizeSource(knowledgeSource)
      const response = await fetch(buildDocumentsUrl('/api/knowledge'), {
        method: 'POST',
        headers: buildAuthHeaders(adminToken, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          title: knowledgeTitle,
          content: knowledgeContent,
          tags,
          source
        })
      })
      const data = await response.json().catch(() => ({}))
      if (data.success) {
        toast.success('Documento adicionado com sucesso!')
        setKnowledgeTitle('')
        setKnowledgeContent('')
        setKnowledgeTags('general')
        setKnowledgeSource('admin-panel')
        loadKnowledgeDocuments()
      } else {
        toast.error('Erro: ' + (data.error || data.message || ''))
      }
    } catch (error) {
      console.error('Erro ao adicionar documento:', error)
      toast.error('Erro ao adicionar documento')
    } finally {
      setAddingKnowledge(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-bold">Base de conhecimento</h3>
        </div>

        <div className="grid gap-3">
          <Input value={knowledgeTitle} onChange={(e) => setKnowledgeTitle(e.target.value)} placeholder="Título do documento" />
          <textarea
            value={knowledgeContent}
            onChange={(e) => setKnowledgeContent(e.target.value)}
            placeholder="Conteúdo técnico do documento"
            className="min-h-[140px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <div className="grid md:grid-cols-2 gap-3">
            <Input value={knowledgeTags} onChange={(e) => setKnowledgeTags(e.target.value)} placeholder="Tags separadas por vírgula" />
            <Input value={knowledgeSource} onChange={(e) => setKnowledgeSource(e.target.value)} placeholder="Origem" />
          </div>
          <div>
            <Button onClick={addKnowledgeDocument} disabled={addingKnowledge}>
              {addingKnowledge ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              {addingKnowledge ? 'Salvando...' : 'Adicionar documento'}
            </Button>
          </div>
        </div>
      </Card>

      {knowledgeLoading ? (
        <Card className="p-10 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
        </Card>
      ) : knowledgeDocuments.length === 0 ? (
        <Card className="p-10 text-center text-gray-500">Nenhum documento encontrado.</Card>
      ) : (
        <div className="space-y-4">
          {knowledgeDocuments.map((doc) => (
            <Card key={doc._id || doc.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold">{doc.title || 'Sem título'}</h4>
                  <p className="text-xs text-gray-500">
                    {normalizeSource(doc.source)} · {Array.isArray(doc.tags) ? doc.tags.join(', ') : 'general'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditKnowledge(doc)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => deleteKnowledgeDocument(doc._id || doc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap text-gray-700">{doc.content || 'Conteúdo não disponível.'}</p>
            </Card>
          ))}
        </div>
      )}

      {editingKnowledge && (
        <Card className="p-6 space-y-4 border-blue-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">Editar documento</h4>
            <Button size="sm" variant="outline" onClick={() => setEditingKnowledge(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Input value={editKnowledgeTitle} onChange={(e) => setEditKnowledgeTitle(e.target.value)} placeholder="Título" />
          <textarea
            value={editKnowledgeContent}
            onChange={(e) => setEditKnowledgeContent(e.target.value)}
            className="min-h-[160px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <div className="grid md:grid-cols-2 gap-3">
            <Input value={editKnowledgeTags} onChange={(e) => setEditKnowledgeTags(e.target.value)} placeholder="Tags" />
            <Input value={editKnowledgeSource} onChange={(e) => setEditKnowledgeSource(e.target.value)} placeholder="Origem" />
          </div>
          <div>
            <Button onClick={saveEditKnowledge}>Salvar alterações</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
