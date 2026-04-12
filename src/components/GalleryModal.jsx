import { useMemo, useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const normalizeImages = (imgs) => {
  if (!Array.isArray(imgs)) return []
  return imgs.map((img) => {
    if (typeof img === 'string') {
      return { url: img, desc: '' }
    }
    return {
      url: img.imageUrl || img.url || '',
      desc: img.defectType || img.diagnosis || img.description || img.note || '',
      resin: img.resin || '',
      printer: img.printer || '',
      name: img.name || '',
      settings: img.settings || {}
    }
  }).filter((img) => img.url)
}

const settingsRows = (settings = {}) => [
  ['Altura de camada', settings.layerHeight],
  ['Exposição normal', settings.exposureNormal],
  ['Exposição base', settings.exposureBase],
  ['Camadas base', settings.baseLayers]
].filter(([, value]) => value !== null && value !== undefined && value !== '')

export function GalleryModal({ isOpen, onClose, images = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const safeImages = useMemo(() => normalizeImages(images), [images])

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [initialIndex, isOpen])

  if (!isOpen || safeImages.length === 0) return null

  const handleNext = (e) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % safeImages.length)
  }

  const handlePrev = (e) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
  }

  const currentImage = safeImages[currentIndex]
  const rows = settingsRows(currentImage.settings)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={onClose}>
      <Button variant="ghost" className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 h-12 w-12 z-50" onClick={onClose}>
        <X className="h-8 w-8" />
      </Button>

      <Button variant="ghost" className="absolute left-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 h-16 w-16 hidden md:flex items-center justify-center z-50" onClick={handlePrev}>
        <ChevronLeft className="h-10 w-10" />
      </Button>

      <div className="relative max-w-6xl max-h-[88vh] w-full flex flex-col lg:flex-row items-center gap-4 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 flex justify-center">
          <img src={currentImage.url} alt="Visualização da galeria" className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10" />
        </div>

        <div className="w-full lg:w-96 bg-white/10 border border-white/10 rounded-xl p-4 text-white backdrop-blur">
          <p className="text-sm text-white/60 mb-2">Registro {currentIndex + 1} de {safeImages.length}</p>
          {currentImage.name && <p className="text-lg font-semibold mb-2">Cliente: {currentImage.name}</p>}
          {currentImage.resin && <p className="text-sm mb-1"><strong>Resina:</strong> {currentImage.resin}</p>}
          {currentImage.printer && <p className="text-sm mb-3"><strong>Impressora:</strong> {currentImage.printer}</p>}
          {rows.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold text-white/80">Configurações usadas</p>
              {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 text-sm">
                  <span className="text-white/70">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
          {currentImage.desc && <p className="text-sm text-white/85">{currentImage.desc}</p>}
        </div>
      </div>

      <Button variant="ghost" className="absolute right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 h-16 w-16 hidden md:flex items-center justify-center z-50" onClick={handleNext}>
        <ChevronRight className="h-10 w-10" />
      </Button>
    </div>
  )
}
