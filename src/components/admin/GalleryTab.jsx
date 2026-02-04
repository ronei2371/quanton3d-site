import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Camera, RefreshCw, AlertTriangle, Loader2, Trash2, Check, X, Eye } from 'lucide-react'
import { toast } from 'sonner'

export function GalleryTab({ isAdmin, isVisible, adminToken, onPendingCountChange }) {
  // URL FIXA PARA NÃO DEPENDER DE NINGUÉM
  const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'
  
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null) // Para loading nos botões

  // --- 1. CARREGAMENTO BLINDADO (Anti-Tela Branca) ---
  const loadPhotos = useCallback(async () => {
    if (!isVisible) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Busca na rota correta
      const response = await fetch(`${API_BASE_URL}/api/visual-knowledge`, {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      })

      // Lê como texto primeiro (Proteção contra HTML/404)
      const text = await response.text()

      if (!response.ok) {
        // Se o servidor deu erro, a gente avisa mas NÃO TRAVA a tela
        if (text.startsWith('<')) {
           throw new Error(`Erro de Rota (404/500). O servidor não respondeu JSON.`)
        }
        throw new Error(`Erro do servidor: ${response.status}`)
      }

      // Tenta converter
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error("O servidor respondeu algo que não é dados válidos.")
      }
      
      // Garante que seja um array (Segurança Extra)
      const safeList = Array.isArray(data.documents) ? data.documents : []
      setPhotos(safeList)

      // Atualiza o contador de pendentes lá na aba
      if (onPendingCountChange) {
        const pendingCount = safeList.filter(p => !p.approved).length
        onPendingCountChange(pendingCount)
      }

    } catch (err) {
      console.error("Erro na galeria:", err)
      setError(err.message)
      setPhotos([]) // Zera a lista para não dar tela branca
    } finally {
      setLoading(false)
    }
  }, [isVisible, adminToken, onPendingCountChange])

  // Carrega ao abrir
  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  // --- 2. AÇÕES (Aprovar, Rejeitar, Deletar) ---
  
  const handleAction = async (id, action) => {
    if (!isAdmin) {
        toast.error("Apenas admins podem fazer isso.")
        return
    }
    
    setProcessingId(id)
    try {
        let url, method
        
        if (action === 'approve') {
            url = `${API_BASE_URL}/api/visual-knowledge/${id}/approve`
            method = 'PUT'
        } else if (action === 'delete') {
            if (!confirm("Tem certeza que deseja apagar essa foto?")) {
                setProcessingId(null)
                return
            }
            url = `${API_BASE_URL}/api/visual-knowledge/${id}`
            method = 'DELETE'
        }

        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: action === 'approve' ? JSON.stringify({ 
                // Envia dados padrão se aprovar direto
                defectType: 'Aprovado via Painel',
                diagnosis: 'Aprovado manualmente', 
                solution: 'Verificar imagem'
            }) : undefined
        })

        if (res.ok) {
            toast.success(action === 'approve' ? "Foto Aprovada!" : "Foto Deletada!")
            loadPhotos() // Recarrega a lista
        } else {
            toast.error("Erro ao processar ação.")
        }
    } catch (e) {
        console.error(e)
        toast.error("Erro de conexão.")
    } finally {
        setProcessingId(null)
    }
  }

  // --- 3. RENDERIZAÇÃO ---

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <h3 className="font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Erro ao carregar galeria
        </h3>
        <p className="mt-2 text-sm">{error}</p>
        <Button onClick={loadPhotos} variant="outline" className="mt-4 bg-white">
          <RefreshCw className="h-4 w-4 mr-2" /> Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Camera className="h-6 w-6 text-blue-600" />
          Galeria de Treinamento Visual ({photos.length})
        </h2>
        <Button onClick={loadPhotos} disabled={loading} size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
          <p>Buscando fotos no servidor...</p>
        </div>
      ) : photos.length === 0 ? (
        <Card className="p-8 text-center bg-gray-50">
          <p className="text-gray-500">Nenhuma foto encontrada no sistema.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((item) => (
            <Card key={item._id} className="p-4 overflow-hidden flex flex-col">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 relative group">
                <img 
                  src={item.imageUrl} 
                  alt={item.defectType || 'Foto'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {e.target.style.display = 'none'}} 
                />
                {/* Badge de Status */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${item.approved ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    {item.approved ? 'Aprovado' : 'Pendente'}
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <p className="font-bold text-gray-800">{item.defectType || 'Não classificado'}</p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {item.diagnosis || 'Sem diagnóstico'}
                </p>
              </div>

              {/* Botões de Ação */}
              {isAdmin && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                      {!item.approved && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(item._id, 'approve')}
                            disabled={processingId === item._id}
                          >
                             <Check className="h-4 w-4" />
                          </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleAction(item._id, 'delete')}
                        disabled={processingId === item._id}
                      >
                         {processingId === item._id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                      </Button>
                  </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
