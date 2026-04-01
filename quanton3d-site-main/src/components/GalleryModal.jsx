import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

export function GalleryModal({ isOpen, onClose, images = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Função para garantir que as imagens tenham o formato certo
  const normalizeImages = (imgs) => {
    if (!Array.isArray(imgs)) return []
    return imgs.map(img => {
      if (typeof img === 'string') return { url: img, desc: '' }
      return { 
          url: img.imageUrl || img.url, 
          desc: img.defectType || img.diagnosis || '' 
      }
    })
  }

  const safeImages = normalizeImages(images)

  useEffect(() => {
    setCurrentIndex(initialIndex)
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <Button 
        variant="ghost" 
        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 h-12 w-12 z-50"
        onClick={onClose}
      >
        <X className="h-8 w-8" />
      </Button>

      <Button 
        variant="ghost" 
        className="absolute left-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 h-16 w-16 hidden md:flex items-center justify-center"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-10 w-10" />
      </Button>

      <div className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center p-4" onClick={e => e.stopPropagation()}>
        <img 
          src={safeImages[currentIndex].url} 
          alt="Zoom" 
          className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
        />
        
        <div className="mt-4 text-center">
            {safeImages[currentIndex].desc && (
            <p className="text-white text-lg font-medium tracking-wide">
                {safeImages[currentIndex].desc}
            </p>
            )}
            <p className="text-white/50 text-sm mt-1">
            {currentIndex + 1} de {safeImages.length}
            </p>
        </div>
      </div>

      <Button 
        variant="ghost" 
        className="absolute right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 h-16 w-16 hidden md:flex items-center justify-center"
        onClick={handleNext}
      >
        <ChevronRight className="h-10 w-10" />
      </Button>
    </div>
  )
}
