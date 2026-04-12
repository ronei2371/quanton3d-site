import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Plus, Edit3, Trash2, Save, X, Upload, Image as ImageIcon, Mail, Link as LinkIcon, User, Check } from 'lucide-react'
import { toast } from 'sonner'

const emptyPartner = {
  name: '',
  description: '',
  phone: '',
  email: '',
  website_url: '',
  course_url: '',
  instructor_1_name: '',
  instructor_1_description: '',
  instructor_1_phone: '',
  instructor_2_name: '',
  instructor_2_description: '',
  instructor_2_phone: '',
  highlights: [],
  images: [],
  active: true,
  order: 0,
}

const normalizePartner = (partner = {}) => ({
  ...emptyPartner,
  ...partner,
  id: partner.id || partner._id || '',
  active: partner.active !== false && partner.is_active !== false,
  order: Number(partner.order ?? partner.display_order ?? 0) || 0,
  website_url: partner.website_url || partner.websiteUrl || '',
  course_url: partner.course_url || partner.courseUrl || '',
  images: Array.isArray(partner.images) ? partner.images : [],
  highlights: Array.isArray(partner.highlights) ? partner.highlights : [],
})

export function PartnersManager({ isAdmin, buildAdminUrl, adminToken }) {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [formData, setFormData] = useState(emptyPartner)
  const [newHighlight, setNewHighlight] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [previewImages, setPreviewImages] = useState([])

  const authHeaders = useMemo(() => (
    adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
  ), [adminToken])

  const resetForm = () => {
    setEditingId('')
    setFormData(emptyPartner)
    setNewHighlight('')
    setImageFiles([])
    setPreviewImages([])
  }

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const loadPartners = async () => {
    setLoading(true)
    try {
      const response = await fetch(buildAdminUrl('/partners'), {
        headers: authHeaders,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Erro ao carregar parceiros')
      }
      const list = Array.isArray(data.partners) ? data.partners.map(normalizePartner) : []
      setPartners(list)
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Erro ao carregar parceiros')
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPartners()
  }, [])

  const startCreate = () => {
    resetForm()
  }

  const startEdit = (partner) => {
    const normalized = normalizePartner(partner)
    setEditingId(normalized.id)
    setFormData(normalized)
    setPreviewImages(normalized.images)
    setImageFiles([])
  }

  const addHighlight = () => {
    const value = newHighlight.trim()
    if (!value) return
    setFormData((prev) => ({ ...prev, highlights: [...prev.highlights, value] }))
    setNewHighlight('')
  }

  const removeHighlight = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }))
  }

  const handleImageSelect = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    const dataUrls = await Promise.all(files.map(fileToDataUrl))
    setImageFiles((prev) => [...prev, ...dataUrls])
    setPreviewImages((prev) => [...prev, ...dataUrls])
  }

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const savePartner = async () => {
    if (!isAdmin) {
      toast.error('Somente administradores podem editar parceiros')
      return
    }
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Nome e descrição são obrigatórios')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...formData,
        images: previewImages,
        active: formData.active !== false,
        order: Number(formData.order || 0),
      }
      delete payload.id
      delete payload._id

      const isEditing = Boolean(editingId)
      const url = isEditing ? buildAdminUrl(`/partners/${editingId}`) : buildAdminUrl('/partners')
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Erro ao salvar parceiro')
      }

      toast.success(isEditing ? 'Parceiro atualizado com sucesso' : 'Parceiro criado com sucesso')
      resetForm()
      await loadPartners()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Erro ao salvar parceiro')
    } finally {
      setSaving(false)
    }
  }

  const deletePartner = async (partner) => {
    if (!isAdmin) return
    if (!window.confirm(`Excluir parceiro ${partner.name}?`)) return
    try {
      const response = await fetch(buildAdminUrl(`/partners/${partner.id}`), {
        method: 'DELETE',
        headers: authHeaders,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data?.error || 'Erro ao excluir parceiro')
      }
      toast.success('Parceiro excluído com sucesso')
      await loadPartners()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Erro ao excluir parceiro')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Parceiros cadastrados</h3>
          <p className="text-sm text-gray-500">Gerencie os parceiros exibidos na página pública.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPartners} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</Button>
          <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" /> Novo parceiro</Button>
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">{editingId ? 'Editar parceiro' : 'Cadastrar parceiro'}</h4>
          {(editingId || formData.name || formData.description) && (
            <Button variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-2" /> Cancelar</Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Nome do parceiro *</label>
            <Input value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Ordem de exibição</label>
            <Input type="number" value={formData.order} onChange={(e) => setFormData((prev) => ({ ...prev, order: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Descrição *</label>
            <textarea className="w-full min-h-[100px] rounded-md border p-3" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone</label>
            <Input value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <Input value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Site</label>
            <Input value={formData.website_url} onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Link do curso</label>
            <Input value={formData.course_url} onChange={(e) => setFormData((prev) => ({ ...prev, course_url: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Instrutor 1</label>
            <Input value={formData.instructor_1_name} onChange={(e) => setFormData((prev) => ({ ...prev, instructor_1_name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone instrutor 1</label>
            <Input value={formData.instructor_1_phone} onChange={(e) => setFormData((prev) => ({ ...prev, instructor_1_phone: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Descrição instrutor 1</label>
            <textarea className="w-full min-h-[70px] rounded-md border p-3" value={formData.instructor_1_description} onChange={(e) => setFormData((prev) => ({ ...prev, instructor_1_description: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Instrutor 2</label>
            <Input value={formData.instructor_2_name} onChange={(e) => setFormData((prev) => ({ ...prev, instructor_2_name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone instrutor 2</label>
            <Input value={formData.instructor_2_phone} onChange={(e) => setFormData((prev) => ({ ...prev, instructor_2_phone: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Descrição instrutor 2</label>
            <textarea className="w-full min-h-[70px] rounded-md border p-3" value={formData.instructor_2_description} onChange={(e) => setFormData((prev) => ({ ...prev, instructor_2_description: e.target.value }))} />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Destaques</label>
          <div className="flex gap-2">
            <Input value={newHighlight} onChange={(e) => setNewHighlight(e.target.value)} placeholder="Ex.: Especialista em joalheria" />
            <Button type="button" onClick={addHighlight}>Adicionar</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.highlights.map((highlight, index) => (
              <span key={`${highlight}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm">
                {highlight}
                <button type="button" onClick={() => removeHighlight(index)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2"><Upload className="h-4 w-4" /> Imagens</label>
          <Input type="file" accept="image/*" multiple onChange={handleImageSelect} />
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {previewImages.map((image, index) => (
                <div key={`${image}-${index}`} className="relative rounded-lg overflow-hidden border bg-gray-50">
                  <img src={image} alt={`Preview ${index + 1}`} className="w-full h-28 object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input id="partner-active" type="checkbox" checked={formData.active} onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))} />
          <label htmlFor="partner-active" className="text-sm">Parceiro ativo para exibição pública</label>
        </div>

        <div className="flex justify-end">
          <Button onClick={savePartner} disabled={saving}>
            {saving ? 'Salvando...' : <><Save className="h-4 w-4 mr-2" /> Salvar parceiro</>}
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {partners.length === 0 ? (
          <Card className="p-8 text-center text-gray-500 lg:col-span-2">
            Nenhum parceiro cadastrado no momento.
          </Card>
        ) : partners.map((partner) => (
          <Card key={partner.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold">{partner.name}</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{partner.description}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(partner)}><Edit3 className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => deletePartner(partner)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {partner.phone && <span>{partner.phone}</span>}
              {partner.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {partner.email}</span>}
              {partner.website_url && <span className="flex items-center gap-1"><LinkIcon className="h-4 w-4" /> {partner.website_url}</span>}
            </div>

            {partner.highlights?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {partner.highlights.map((item, index) => (
                  <span key={`${item}-${index}`} className="rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-xs">{item}</span>
                ))}
              </div>
            )}

            {partner.images?.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {partner.images.slice(0, 3).map((image, index) => (
                  <div key={`${image}-${index}`} className="rounded overflow-hidden border bg-gray-50">
                    <img src={image} alt={partner.name} className="w-full h-24 object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
