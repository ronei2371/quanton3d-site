diff --git a/src/components/admin/GalleryTab.jsx b/src/components/admin/GalleryTab.jsx
index 4dc839329482f85a44e9e36b449e574459f2fab6..68de1658db508bff927fbc00a127efe550a46b21 100644
--- a/src/components/admin/GalleryTab.jsx
+++ b/src/components/admin/GalleryTab.jsx
@@ -1,95 +1,99 @@
 import { useCallback, useEffect, useMemo, useState } from 'react'
 import { Card } from '@/components/ui/card.jsx'
 import { Button } from '@/components/ui/button.jsx'
 import { Input } from '@/components/ui/input.jsx'
 import { Camera, Check, Edit3, Image, Loader2, Trash2, X } from 'lucide-react'
 import { toast } from 'sonner'
 
-export function GalleryTab({ isAdmin, isVisible, refreshKey, onPendingCountChange }) {
+export function GalleryTab({ isAdmin, isVisible, refreshKey, onPendingCountChange, buildUrl, adminToken }) {
   const API_BASE_URL = useMemo(
     () => (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, ''),
     []
   )
 
   const buildGalleryUrl = useCallback(
-    (path) => new URL(path, `${API_BASE_URL}/`).toString(),
-    [API_BASE_URL]
+    (path) => (buildUrl ? buildUrl(path) : new URL(path, `${API_BASE_URL}/`).toString()),
+    [API_BASE_URL, buildUrl]
   )
 
   const [galleryEntries, setGalleryEntries] = useState([])
   const [galleryLoading, setGalleryLoading] = useState(false)
   const [editingGalleryEntry, setEditingGalleryEntry] = useState(null)
   const [editGalleryData, setEditGalleryData] = useState({})
   const [savingGalleryEdit, setSavingGalleryEdit] = useState(false)
 
   const loadGalleryEntries = useCallback(async () => {
     setGalleryLoading(true)
     try {
-      const response = await fetch(buildGalleryUrl('/api/gallery/all'))
+      const response = await fetch(buildGalleryUrl('/api/gallery/all'), {
+        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
+      })
       const data = await response.json()
       const entries = data.entries || []
       setGalleryEntries(entries)
       onPendingCountChange?.(entries.filter((entry) => entry.status === 'pending').length)
     } catch (error) {
       console.error('Erro ao carregar galeria:', error)
       toast.error('Erro ao carregar galeria')
     } finally {
       setGalleryLoading(false)
     }
-  }, [buildGalleryUrl, onPendingCountChange])
+  }, [adminToken, buildGalleryUrl, onPendingCountChange])
 
   useEffect(() => {
     loadGalleryEntries()
   }, [isVisible, refreshKey, loadGalleryEntries])
 
   const approveGalleryEntry = async (id) => {
     try {
       const response = await fetch(buildGalleryUrl(`/api/gallery/${id}/approve`), {
-        method: 'PUT'
+        method: 'PUT',
+        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
       })
       const data = await response.json()
       if (data.success) {
         loadGalleryEntries()
       } else {
         toast.error('Erro ao aprovar: ' + data.error)
       }
     } catch (error) {
       console.error('Erro ao aprovar:', error)
       toast.error('Erro ao aprovar foto')
     }
   }
 
   const rejectGalleryEntry = async (id) => {
     if (!isAdmin) {
       toast.warning('Seu nivel de acesso nao permite rejeitar/excluir dados.')
       return
     }
     if (!confirm('Tem certeza que deseja rejeitar esta foto? As imagens serao deletadas.')) return
     try {
       const response = await fetch(buildGalleryUrl(`/api/gallery/${id}/reject`), {
-        method: 'PUT'
+        method: 'PUT',
+        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
       })
       const data = await response.json()
       if (data.success) {
         loadGalleryEntries()
       } else {
         toast.error('Erro ao rejeitar: ' + data.error)
       }
     } catch (error) {
       console.error('Erro ao rejeitar:', error)
       toast.error('Erro ao rejeitar foto')
     }
   }
 
   const openEditGallery = (entry) => {
     setEditingGalleryEntry(entry)
     const params = entry.params || {}
     const lowerLiftDist = params.lowerLiftDistance || {}
     const liftDist = params.liftDistance || {}
     const liftSpd = params.liftSpeed || {}
     const lowerRetractSpd = params.lowerRetractSpeed || {}
     const retractSpd = params.retractSpeed || {}
 
     setEditGalleryData({
       name: entry.name || '',
       resin: entry.resin || '',
@@ -98,51 +102,54 @@ export function GalleryTab({ isAdmin, isVisible, refreshKey, onPendingCountChang
       layerHeight: params.layerHeight || entry.layerHeight || '',
       baseLayers: params.baseLayers || entry.baseLayers || '',
       exposureTime: params.exposureTime || entry.exposureTime || '',
       baseExposureTime: params.baseExposureTime || entry.baseExposureTime || '',
       transitionLayers: params.transitionLayers || entry.transitionLayers || '',
       uvOffDelay: params.uvOffDelay || entry.uvOffDelay || '',
       lowerLiftDistance1: lowerLiftDist.value1 || entry.lowerLiftDistance1 || '',
       lowerLiftDistance2: lowerLiftDist.value2 || entry.lowerLiftDistance2 || '',
       liftDistance1: liftDist.value1 || entry.liftDistance1 || '',
       liftDistance2: liftDist.value2 || entry.liftDistance2 || '',
       liftSpeed1: liftSpd.value1 || entry.liftSpeed1 || '',
       liftSpeed2: liftSpd.value2 || entry.liftSpeed2 || '',
       lowerRetractSpeed1: lowerRetractSpd.value1 || entry.lowerRetractSpeed1 || '',
       lowerRetractSpeed2: lowerRetractSpd.value2 || entry.lowerRetractSpeed2 || '',
       retractSpeed1: retractSpd.value1 || entry.retractSpeed1 || '',
       retractSpeed2: retractSpd.value2 || entry.retractSpeed2 || ''
     })
   }
 
   const saveGalleryEdit = async () => {
     if (!editingGalleryEntry) return
     setSavingGalleryEdit(true)
     try {
       const response = await fetch(buildGalleryUrl(`/api/gallery/${editingGalleryEntry._id}`), {
         method: 'PUT',
-        headers: { 'Content-Type': 'application/json' },
+        headers: {
+          'Content-Type': 'application/json',
+          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
+        },
         body: JSON.stringify(editGalleryData)
       })
       const data = await response.json()
       if (data.success) {
         setEditingGalleryEntry(null)
         setEditGalleryData({})
         loadGalleryEntries()
         toast.success('Entrada atualizada com sucesso!')
       } else {
         toast.error('Erro ao atualizar: ' + data.error)
       }
     } catch (error) {
       console.error('Erro ao atualizar:', error)
       toast.error('Erro ao atualizar entrada da galeria')
     } finally {
       setSavingGalleryEdit(false)
     }
   }
 
   return (
     <div className="space-y-4">
       <Card className="p-6">
         <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
           <Camera className="h-5 w-5" />
           Galeria de Fotos - Aprovacao
