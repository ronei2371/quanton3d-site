import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Settings2, Printer, Beaker } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const formatSettingValue = (value, suffix = '') => {
  if (value === undefined || value === null || value === '') return '-'
  return `${value}${suffix}`
}

export function GalleryModal({ isOpen, onClose, images = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const normalizeImages = (imgs) => {
    if (!Array.isArray(imgs)) return []
    return imgs.map((img) => {
      if (typeof img === 'string') {
        return { url: img, title: '', desc: '', resin: '-', printer: '-', settings: {} }
      }

      const rawUrl = img?.url || img?.imageUrl || img?.image || (Array.isArray(img?.images) ? img.images[0] : '')
      const url = typeof rawUrl === 'string' ? rawUrl : rawUrl?.url || ''
      return {
        url,
        title: img?.title || img?.name || 'Impressão compartilhada',
        desc: img?.desc || img?.description || img?.note || '',
        resin: img?.resin || '-',
        printer: img?.printer || '-',
        note: img?.note || '',
        contact: img?.contact || '',
        createdAt: img?.createdAt || null,
        settings: img?.settings || {}
      }
    }).filter((img) => typeof img.url === 'string' && img.url)
  }

  const safeImages = normalizeImages(images)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, isOpen])

  if (!isOpen || safeImages.length === 0) return null

  const current = safeImages[currentIndex]

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

      <div className="relative max-w-6xl max-h-[90vh] w-full flex flex-col items-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 w-full items-start">
          <div className="flex flex-col items-center">
            <img
              src={current.url}
              alt={current.title || 'Impressão compartilhada'}
              className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10 bg-black/20"
            />

            <div className="mt-4 text-center">
              <p className="text-white text-lg md:text-2xl font-bold tracking-wide">
                {current.title || 'Impressão compartilhada'}
              </p>
              {current.desc && (
                <p className="text-white/80 text-sm md:text-base mt-2 max-w-3xl">
                  {current.desc}
                </p>
              )}
              <p className="text-white/50 text-sm mt-2">
                {currentIndex + 1} de {safeImages.length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 text-white shadow-2xl">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Configurações usadas
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Beaker className="h-4 w-4 mt-0.5 text-cyan-300" />
                <div>
                  <p className="text-white/70">Resina</p>
                  <p className="font-semibold">{current.resin || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Printer className="h-4 w-4 mt-0.5 text-cyan-300" />
                <div>
                  <p className="text-white/70">Impressora</p>
                  <p className="font-semibold">{current.printer || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-white/60 text-xs uppercase">Layer Height</p>
                  <p className="font-bold">{formatSettingValue(current.settings?.layerHeightMm, ' mm')}</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-white/60 text-xs uppercase">Exposure</p>
                  <p className="font-bold">{formatSettingValue(current.settings?.exposureTimeS, ' s')}</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-white/60 text-xs uppercase">Base Exposure</p>
                  <p className="font-bold">{formatSettingValue(current.settings?.baseExposureTimeS, ' s')}</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-white/60 text-xs uppercase">Base Layers</p>
                  <p className="font-bold">{formatSettingValue(current.settings?.baseLayers)}</p>
                </div>
              </div>

              {current.note && (
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-white/60 text-xs uppercase mb-1">Observações</p>
                  <p className="leading-relaxed">{current.note}</p>
                </div>
              )}
            </div>
          </div>
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
