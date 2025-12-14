import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Plus, Edit3, Trash2, Save, X, Upload, Image as ImageIcon, Phone, Mail, Link as LinkIcon, User, AlertCircle, Check } from 'lucide-react'

export function PartnersManager() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPartner, setEditingPartner] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Formulário de parceiro
  const [formData, setFormData] = useState({
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
    is_active: true,
    display_order: 0
  })

  const [newHighlight, setNewHighlight] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])

  // Carregar parceiros
  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      setLoading(true)
      const response = await fetch('/.netlify/functions/partners')
      if (!response.ok) throw new Error('Erro ao carregar parceiros')
      const data = await response.json()
      setPartners(data)
    } catch (err) {
      setError('Erro ao carregar parceiros: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Resetar formulário
  const resetForm = () => {
    setFormData({
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
      is_active: true,
      display_order: 0
    })
    setImageFiles([])
    setImagePreviewUrls([])
    setEditingPartner(null)
    setIsCreating(false)
  }

  // Iniciar criação
  const startCreating = () => {
    resetForm()
    setIsCreating(true)
  }

  // Iniciar edição
  const startEditing = (partner) => {
    setFormData({ ...partner })
    setImagePreviewUrls(partner.images || [])
    setEditingPartner(partner._id)
    setIsCreating(false)
  }

  // Cancelar
  const handleCancel = () => {
    resetForm()
    setError(null)
    setSuccess(null)
  }

  // Adicionar destaque
  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData({
        ...formData,
        highlights: [...formData.highlights, newHighlight.trim()]
      })
      setNewHighlight('')
    }
  }

  // Remover destaque
  const removeHighlight = (index) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index)
    })
  }

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles([...imageFiles, ...files])
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls])
  }

  // Remove image
  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviewUrls.filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setImagePreviewUrls(newPreviews)
  }

  // Upload images to server
  const uploadImages = async () => {
    if (imageFiles.length === 0) return formData.images

    setUploadingImages(true)
    try {
      const formDataUpload = new FormData()
      imageFiles.forEach(file => {
        formDataUpload.append('images', file)
      })

      const response = await fetch('/.netlify/functions/upload-partner-image', {
        method: 'POST',
        body: formDataUpload
      })

      if (!response.ok) throw new Error('Erro ao fazer upload das imagens')
      
      const data = await response.json()
      return [...formData.images, ...data.images.map(img => img.url)]
    } catch (err) {
      throw new Error('Erro no upload de imagens: ' + err.message)
    } finally {
      setUploadingImages(false)
    }
  }

  // Salvar parceiro
  const handleSave = async () => {
    try {
      setError(null)
      setSuccess(null)

      // Validação
      if (!formData.name || !formData.description) {
        setError('Nome e descrição são obrigatórios')
        return
      }

      // Upload images if any
      let imageUrls = formData.images
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages()
      }

      const dataToSave = {
        ...formData,
        images: imageUrls
      }

      let response
      if (editingPartner) {
        // Atualizar
        response = await fetch(`/.netlify/functions/partners?id=${editingPartner}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        })
      } else {
        // Criar
        response = await fetch('/.netlify/functions/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        })
      }

      if (!response.ok) throw new Error('Erro ao salvar parceiro')

      setSuccess(editingPartner ? 'Parceiro atualizado com sucesso!' : 'Parceiro criado com sucesso!')
      resetForm()
      loadPartners()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  // Excluir parceiro
  const handleDelete = async (partnerId) => {
    if (!confirm('Tem certeza que deseja excluir este parceiro?')) return

    try {
      const response = await fetch(`/.netlify/functions/partners?id=${partnerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir parceiro')

      setSuccess('Parceiro excluído com sucesso!')
      loadPartners()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Erro ao excluir: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando parceiros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Parceiros</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Adicione, edite ou remova parceiros da página pública
          </p>
        </div>
        {!isCreating && !editingPartner && (
          <Button onClick={startCreating} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            Novo Parceiro
          </Button>
        )}
      </div>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Formulário de Criação/Edição */}
      {(isCreating || editingPartner) && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
          </h3>

          <div className="space-y-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Parceiro *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Sagga Studios"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(21) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição completa do parceiro..."
                className="w-full p-3 border rounded-lg min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@parceiro.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link do Curso/Serviço</label>
              <Input
                value={formData.course_url}
                onChange={(e) => setFormData({ ...formData, course_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Instrutor 1 */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Instrutor/Responsável 1</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    value={formData.instructor_1_name}
                    onChange={(e) => setFormData({ ...formData, instructor_1_name: e.target.value })}
                    placeholder="Nome do instrutor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <Input
                    value={formData.instructor_1_phone}
                    onChange={(e) => setFormData({ ...formData, instructor_1_phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.instructor_1_description}
                  onChange={(e) => setFormData({ ...formData, instructor_1_description: e.target.value })}
                  placeholder="Breve descrição do instrutor..."
                  className="w-full p-3 border rounded-lg min-h-[80px]"
                />
              </div>
            </div>

            {/* Instrutor 2 */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Instrutor/Responsável 2 (Opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    value={formData.instructor_2_name}
                    onChange={(e) => setFormData({ ...formData, instructor_2_name: e.target.value })}
                    placeholder="Nome do instrutor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <Input
                    value={formData.instructor_2_phone}
                    onChange={(e) => setFormData({ ...formData, instructor_2_phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.instructor_2_description}
                  onChange={(e) => setFormData({ ...formData, instructor_2_description: e.target.value })}
                  placeholder="Breve descrição do instrutor..."
                  className="w-full p-3 border rounded-lg min-h-[80px]"
                />
              </div>
            </div>

            {/* Destaques do Curso */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Destaques do Curso/Serviço</h4>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="Ex: Técnicas avançadas de pintura"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                />
                <Button onClick={addHighlight} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="flex-1 text-sm">{highlight}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeHighlight(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload de Imagens */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Galeria de Imagens</h4>
              <div className="mb-4">
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Clique para selecionar imagens</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB cada</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Configurações */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Parceiro ativo (visível no site)</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-sm">Ordem de exibição:</label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={uploadingImages}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {uploadingImages ? 'Fazendo upload...' : 'Salvar Parceiro'}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Parceiros */}
      {!isCreating && !editingPartner && (
        <div className="space-y-4">
          {partners.length === 0 ? (
            <Card className="p-12 text-center">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">Nenhum parceiro cadastrado ainda</p>
              <Button onClick={startCreating} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Parceiro
              </Button>
            </Card>
          ) : (
            partners.map(partner => (
              <Card key={partner._id} className="p-6">
                <div className="flex gap-6">
                  {/* Imagem de Preview */}
                  {partner.images && partner.images.length > 0 && (
                    <img
                      src={partner.images[0]}
                      alt={partner.name}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Informações */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold">{partner.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{partner.description.substring(0, 150)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEditing(partner)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(partner._id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {partner.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {partner.phone}
                        </div>
                      )}
                      {partner.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {partner.email}
                        </div>
                      )}
                      {partner.instructor_1_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {partner.instructor_1_name}
                          {partner.instructor_2_name && ` & ${partner.instructor_2_name}`}
                        </div>
                      )}
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${partner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {partner.is_active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
