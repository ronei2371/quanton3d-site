diff --git a/src/components/admin/GalleryTab.jsx b/src/components/admin/GalleryTab.jsx
index 68de1658db508bff927fbc00a127efe550a46b21..74396ecae0384889d60f2a55261282a389f858da 100644
--- a/src/components/admin/GalleryTab.jsx
+++ b/src/components/admin/GalleryTab.jsx
@@ -1,41 +1,41 @@
 import { useCallback, useEffect, useMemo, useState } from 'react'
 import { Card } from '@/components/ui/card.jsx'
 import { Button } from '@/components/ui/button.jsx'
 import { Input } from '@/components/ui/input.jsx'
 import { Camera, Check, Edit3, Image, Loader2, Trash2, X } from 'lucide-react'
 import { toast } from 'sonner'
 
-export function GalleryTab({ isAdmin, isVisible, refreshKey, onPendingCountChange, buildUrl, adminToken }) {
+export function GalleryTab({ isAdmin, isVisible, refreshKey, onPendingCountChange, buildAdminUrl, adminToken }) {
   const API_BASE_URL = useMemo(
     () => (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, ''),
     []
   )
 
   const buildGalleryUrl = useCallback(
-    (path) => (buildUrl ? buildUrl(path) : new URL(path, `${API_BASE_URL}/`).toString()),
-    [API_BASE_URL, buildUrl]
+    (path) => (buildAdminUrl ? buildAdminUrl(path) : new URL(path, `${API_BASE_URL}/`).toString()),
+    [API_BASE_URL, buildAdminUrl]
   )
 
   const [galleryEntries, setGalleryEntries] = useState([])
   const [galleryLoading, setGalleryLoading] = useState(false)
   const [editingGalleryEntry, setEditingGalleryEntry] = useState(null)
   const [editGalleryData, setEditGalleryData] = useState({})
   const [savingGalleryEdit, setSavingGalleryEdit] = useState(false)
 
   const loadGalleryEntries = useCallback(async () => {
     setGalleryLoading(true)
     try {
       const response = await fetch(buildGalleryUrl('/api/gallery/all'), {
         headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
       })
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
   }, [adminToken, buildGalleryUrl, onPendingCountChange])
