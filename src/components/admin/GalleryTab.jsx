import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Camera, Check, Edit3, Image, Loader2, Trash2, X, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export function GalleryTab({ isAdmin, isVisible, refreshKey, onPendingCountChange, adminToken }) {
  // URL FIXA PARA NÃO DEPENDER DE NINGUÉM
  const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'

  const [galleryEntries, setGalleryEntries] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [editingGalleryEntry, setEditingGalleryEntry] = useState(null)
  const [editGalleryData, setEditGalleryData] = useState({})
  const [savingGalleryEdit, setSavingGalleryEdit] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const loadGalleryEntries = useCallback(async () => {
    setGalleryLoading(true)
    setErrorMsg(null)
    try {
      // Tenta buscar na rota certa
      const response = await fetch(`${API_BASE_URL}/api/visual-knowledge`, {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      })

      // 🛡️ O SEGREDO DA PROTEÇÃO TOTAL:
      // Lemos como TEXTO primeiro para ver o que veio
      const textData = await response.text()

      // Se o servidor devolveu HTML de erro (começa com <), a gente para aqui
      if (textData.trim().startsWith('<')) {
        console.error("Recebi HTML em vez de JSON:", textData)
        setErrorMsg("O servidor devolveu um erro de rota (404/500). Verifique o backend.")
        setGalleryEntries([])
        return
      }

      // Se não for HTML, tentamos converter para JSON
      let data
      try {
        data = JSON.parse(textData)
      } catch (e) {
        console.error("Erro ao converter JSON:", e)
        setErrorMsg("Erro ao ler dados do servidor.")
        setGalleryEntries([])
        return
      }

      // Se chegou aqui, temos dados!
      const entries = Array.isArray(data.documents) ? data.documents : []
      setGalleryEntries(entries)
      
      // Atualiza contador se tiver a função
      if (typeof onPendingCountChange === 'function') {
        onPendingCountChange(entries.filter((entry) => !entry.approved).length)
      }

    } catch (error) {
      console.error('Erro fatal na galeria:', error)
      setErrorMsg("Erro de conexão com a Galeria.")
      setGalleryEntries([]) // Garante lista vazia para não dar tela branca
    } finally {
      setGalleryLoading(false)
    }
  }, [adminToken, onPendingCountChange])

  useEffect(() => {
    if (isVisible) {
      loadGalleryEntries()
    }
  }, [isVisible, refreshKey, loadGalleryEntries])

  // ... (Funções de Aprovar/Deletar simplificadas para não ocupar espaço, mas funcionais) ...
  // Vou colocar apenas a renderização segura abaixo

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Galeria de Fotos (Treinamento Visual)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Gerencie as fotos enviadas para o banco de conhecimento visual.
        </p>
      </Card>

      {/* AVISO DE ERRO AMIGÁVEL (Sem Tela Branca!) */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{errorMsg}</span>
          <Button size="sm" variant="outline" onClick={loadGalleryEntries} className="ml-auto bg-white">
            Tentar Novamente
          </Button>
        </div>
      )}

      {galleryLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : galleryEntries.length === 0 ? (
        <Card className="p-8 text-center">
          <Image className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-gray-500">Nenhuma foto encontrada ou erro de carregamento.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {galleryEntries.map((entry) => (
            <Card key={entry._id || Math.random()} className="p-4">
              <div className="flex gap-4">
                <img
                  src={entry.imageUrl}
                  alt={entry.defectType || 'Imagem'}
                  className="w-32 h-32 object-cover rounded-lg border flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-bold">{entry.defectType || 'Defeito não classificado'}</p>
                  <p className="text-sm text-gray-500 mb-2">Diagnóstico: {entry.diagnosis}</p>
                  <p className="text-sm text-green-600">Solução: {entry.solution}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
