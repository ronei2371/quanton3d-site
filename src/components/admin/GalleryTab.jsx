import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Camera, RefreshCw, AlertTriangle, Loader2, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'

export function GalleryTab({ isAdmin, isVisible, adminToken }) {
  // URL FIXA E DIRETA
  const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'
  
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Função de carga ultra-segura
  const loadPhotos = useCallback(async () => {
    if (!isVisible) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log("Tentando buscar fotos em:", `${API_BASE_URL}/api/visual-knowledge`)
      
      const response = await fetch(`${API_BASE_URL}/api/visual-knowledge`, {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      })

      // Lê como texto primeiro para evitar quebra no JSON
      const text = await response.text()
      console.log("Resposta bruta do servidor:", text.substring(0, 100))

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status} - ${text.substring(0, 50)}`)
      }

      // Tenta converter
      const data = JSON.parse(text)
      
      // Garante que seja um array
      const safeList = Array.isArray(data.documents) ? data.documents : []
      setPhotos(safeList)

    } catch (err) {
      console.error("Erro na galeria:", err)
      setError(err.message)
      setPhotos([]) // Zera a lista para não travar
    } finally {
      setLoading(false)
    }
  }, [isVisible, adminToken])

  // Carrega ao abrir a aba
  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  // Se der erro, mostra aviso (NÃO TELA BRANCA)
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
          Galeria de Treinamento Visual
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
          {photos.map((item, index) => (
            <Card key={item._id || index} className="p-4 overflow-hidden">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.defectType || 'Foto'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {e.target.style.display = 'none'}} 
                />
              </div>
              <div className="space-y-2">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold">
                  {item.defectType || 'Desconhecido'}
                </span>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.diagnosis || 'Sem diagnóstico'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
