import { useCallback, useEffect, useMemo, useState, Component } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { X, Phone, MessageSquare, BarChart3, BookOpen, Plus, Beaker, Edit3, Camera, Loader2, Eye, Trash2, AlertTriangle, RefreshCw, Check, Handshake, ShoppingBag, CalendarDays, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge.jsx'
import { toast } from 'sonner'
import { PartnersManager } from './PartnersManager.jsx'
import { MetricsTab } from './admin/MetricsTab.jsx'
import { SuggestionsTab } from './admin/SuggestionsTab.jsx'
import { OrdersTab } from './admin/OrdersTab.jsx'
import { DocumentsTab } from './admin/DocumentsTab.jsx'
import { ContactsTab } from './admin/ContactsTab.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }
  render() {
    if (this.state.hasError) return this.props.fallback || <div>Erro ao carregar componente.</div>
    return this.props.children
  }
}

const STORAGE_KEYS = {
  token: 'quanton3d_admin_token',
  apiBase: 'quanton3d_admin_api_base'
}

const normalizeBaseUrl = (value) => {
  if (!value) return ''
  try {
    const trimmed = value.trim()
    if (!trimmed) return ''
    const url = new URL(trimmed, trimmed.startsWith('http') ? undefined : window.location.origin)
    return url.origin
  } catch {
    return ''
  }
}

const deriveDefaultApiBase = () => 'https://quanton3d-bot-v2.onrender.com'

const formatDateTime = (value) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString('pt-BR')
}

const buildGalleryIdCandidates = (item) => {
  const values = [
    item?._id,
    item?.id,
    item?.legacyId,
    item?.raw?._id,
    item?.raw?.id,
    item?.raw?.legacyId
  ]
  return [...new Set(values.filter(Boolean).map((v) => String(v)))]
}

function InternalGalleryTab({ isAdmin, adminToken, apiBaseUrl, onPendingCountChange, onUnauthorized }) {
  const baseUrl = apiBaseUrl || deriveDefaultApiBase()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState('')

  const loadPhotos = useCallback(async () => {
    if (!adminToken) return
    setLoading(true)
    setError('')
    try {
      const headers = { Authorization: `Bearer ${adminToken}` }
      let response = await fetch(`${baseUrl}/api/gallery/all`, { headers })
      if (response.status === 404) {
        response = await fetch(`${baseUrl}/gallery/all`, { headers })
      }
      if (response.status === 401) {
        onUnauthorized?.()
        return
      }
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || `Erro ${response.status}`)

      const rawList = Array.isArray(data.images) ? data.images : Array.isArray(data.items) ? data.items : Array.isArray(data.documents) ? data.documents : Array.isArray(data) ? data : []
      const list = rawList.map((item) => ({
        raw: item,
        _id: item._id || item.id || item.legacyId || '',
        id: item.id || item._id || item.legacyId || '',
        legacyId: item.legacyId || '',
        imageUrl: item.imageUrl || item.image || (Array.isArray(item.images) ? item.images[0] : ''),
        approved: Boolean(item.approved || item.status === 'approved'),
        status: item.status || (item.approved ? 'approved' : 'pending'),
        resin: item.resin || '-',
        printer: item.printer || '-',
        customerName: item.name || item.userName || '',
        note: item.note || item.description || '',
        settings: item.settings || {}
      })).filter((item) => item.imageUrl && item.status !== 'deleted')

      setPhotos(list)
      onPendingCountChange?.(list.filter((item) => !item.approved).length)
      console.log('[GALERIA] Fotos carregadas:', list.length)
    } catch (err) {
      console.error('[GALERIA] Erro ao carregar:', err)
      setError(err.message || 'Erro ao carregar fotos.')
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [adminToken, baseUrl, onPendingCountChange, onUnauthorized])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  const attemptAction = async (candidateId, action) => {
    const method = action === 'delete' ? 'DELETE' : 'PUT'
    const path = action === 'approve' ? `/api/gallery/${encodeURIComponent(candidateId)}/approve` : `/api/gallery/${encodeURIComponent(candidateId)}`
    const fallback = action === 'approve' ? `/gallery/${encodeURIComponent(candidateId)}/approve` : `/gallery/${encodeURIComponent(candidateId)}`
    const options = {
      method,
      headers: {
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        ...(action === 'approve' ? { 'Content-Type': 'application/json' } : {})
      },
      body: action === 'approve' ? JSON.stringify({ approved: true }) : undefined
    }

    let response = await fetch(`${baseUrl}${path}`, options)
    if ((response.status === 404 || response.status === 500) && path !== fallback) {
      response = await fetch(`${baseUrl}${fallback}`, options)
    }
    return response
  }

  const handleAction = async (item, action) => {
    if (!isAdmin) return
    const displayId = item?._id || item?.id || item?.legacyId
    if (!displayId) {
      toast.error('ID da foto não encontrado.')
      return
    }

    setProcessingId(String(displayId))
    try {
      const candidates = buildGalleryIdCandidates(item)
      let ok = false

      for (const candidateId of candidates) {
        const response = await attemptAction(candidateId, action)
        if (response.status === 401) {
          onUnauthorized?.()
          return
        }
        const payload = await response.json().catch(() => ({}))
        if (response.ok && payload?.success !== false) {
          ok = true
          break
        }
      }

      if (!ok) {
        throw new Error(action === 'delete' ? 'Não foi possível remover a foto.' : 'Não foi possível aprovar a foto.')
      }

      if (action === 'delete') {
        setPhotos((prev) => prev.filter((photo) => photo._id !== item._id))
        toast.success('Foto removida.')
      } else {
        setPhotos((prev) => prev.map((photo) => photo._id === item._id ? { ...photo, approved: true, status: 'approved' } : photo))
        toast.success('Foto aprovada.')
      }

      loadPhotos()
    } catch (err) {
      console.error('[GALERIA] Falha na ação:', err)
      toast.error(err.message || 'Não foi possível concluir a ação.')
    } finally {
      setProcessingId(null)
    }
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        <p>{error}</p>
        <Button onClick={loadPhotos} size="sm" variant="outline" className="mt-2 bg-white">Tentar novamente</Button>
      </div>
    )
  }

  if (loading) {
    return <div className="py-12 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold"><Camera className="h-5 w-5" /> Galeria</h3>
        <Button onClick={loadPhotos} size="sm" disabled={loading}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {photos.length === 0 ? (
        <p className="py-10 text-center text-gray-500">Nenhuma foto encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {photos.map((photo) => (
            <Card key={photo._id || photo.id} className="relative p-3">
              {!photo.approved && <Badge className="absolute right-2 top-2 bg-yellow-500">Pendente</Badge>}
              {photo.approved && <Badge className="absolute right-2 top-2 bg-green-500">Aprovada</Badge>}

              <img src={photo.imageUrl} alt={photo.resin || 'Foto'} className="mb-2 h-40 w-full rounded bg-gray-100 object-cover" />

              <div className="mb-2 space-y-1 text-xs">
                <p><strong>Resina:</strong> {photo.resin || 'Não informada'}</p>
                <p><strong>Impressora:</strong> {photo.printer || 'Não informada'}</p>
                {photo.customerName && <p><strong>Cliente:</strong> {photo.customerName}</p>}
              </div>

              <div className="mb-2 space-y-1 rounded-md bg-gray-100 p-2 text-xs text-gray-700">
                <p className="font-semibold text-gray-800">Configurações</p>
                <p><strong>Layer Height:</strong> {photo.settings?.layerHeightMm ?? '-'}</p>
                <p><strong>Exposure Time:</strong> {photo.settings?.exposureTimeS ?? '-'}</p>
                <p><strong>Base Exposure:</strong> {photo.settings?.baseExposureTimeS ?? '-'}</p>
                <p><strong>Base Layers:</strong> {photo.settings?.baseLayers ?? '-'}</p>
              </div>

              <div className="mt-2 flex gap-2">
                {isAdmin && !photo.approved && (
                  <Button size="sm" className="flex-1 bg-green-600" onClick={() => handleAction(photo, 'approve')} disabled={processingId === String(photo._id || photo.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                {isAdmin && (
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleAction(photo, 'delete')} disabled={processingId === String(photo._id || photo.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminPanel({ onClose, externalAdminToken = '' }) {
  const defaultApiBase = deriveDefaultApiBase()
  const [apiBaseUrl, setApiBaseUrl] = useState(() => normalizeBaseUrl(localStorage.getItem(STORAGE_KEYS.apiBase)) || defaultApiBase)
  const [activeTab, setActiveTab] = useState('metrics')
  const [loading, setLoading] = useState(false)
  const [metricsRefreshKey, setMetricsRefreshKey] = useState(0)
  const [suggestionsRefreshKey, setSuggestionsRefreshKey] = useState(0)
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)
  const [knowledgeRefreshKey, setKnowledgeRefreshKey] = useState(0)
  const [contactRefreshKey, setContactRefreshKey] = useState(0)
  const [contacts, setContacts] = useState([])
  const [customRequests, setCustomRequests] = useState([])
  const [galleryPendingCount, setGalleryPendingCount] = useState(0)
  const [contactCount, setContactCount] = useState(0)
  const [ragStatus, setRagStatus] = useState(null)
  const [ragLoading, setRagLoading] = useState(false)
  const [ragError, setRagError] = useState('')
  const [paramsLoading, setParamsLoading] = useState(false)
  const [paramsResins, setParamsResins] = useState([])
  const [paramsPrinters, setParamsPrinters] = useState([])
  const [paramsProfiles, setParamsProfiles] = useState([])
  const [paramsStats, setParamsStats] = useState(null)
  const [newResinName, setNewResinName] = useState('')
  const [newPrinterBrand, setNewPrinterBrand] = useState('')
  const [newPrinterModel, setNewPrinterModel] = useState('')
  const [editingProfile, setEditingProfile] = useState(null)
  const [profileFormData, setProfileFormData] = useState({
    resinId: '',
    printerId: '',
    brand: '',
    model: '',
    status: 'active',
    layerHeightMm: '',
    exposureTimeS: '',
    baseExposureTimeS: '',
    baseLayers: ''
  })
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  const safeAdminToken = externalAdminToken || localStorage.getItem(STORAGE_KEYS.token) || localStorage.getItem('quanton3d_jwt_token') || ''
  const isAuthenticated = Boolean(safeAdminToken)
  const isAdmin = true

  useEffect(() => {
    if (apiBaseUrl) {
      localStorage.setItem(STORAGE_KEYS.apiBase, apiBaseUrl)
    }
  }, [apiBaseUrl])

  const buildAuthHeaders = useCallback((headers = {}, tokenOverride) => {
    const token = tokenOverride || safeAdminToken
    if (!token) return headers
    return { ...headers, Authorization: `Bearer ${token}` }
  }, [safeAdminToken])

  const handleLogout = useCallback((message) => {
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem('quanton3d_jwt_token')
    try { window.dispatchEvent(new Event('quanton3d:admin-logout')) } catch (_err) {}
    if (message) toast.error(message)
  }, [])

  const handleUnauthorizedResponse = useCallback((status) => {
    if (status === 401) {
      handleLogout('Sessão expirada. Faça login novamente.')
      return true
    }
    return false
  }, [handleLogout])

  const buildAdminUrl = useCallback((path, params = {}, baseOverride) => {
    let finalPath = path.startsWith('/') ? path : `/${path}`
    const shouldSkipPrefix = finalPath.startsWith('/api') || finalPath.startsWith('/auth') || finalPath.startsWith('/admin') || finalPath.startsWith('/health')
    if (!shouldSkipPrefix) finalPath = `/api${finalPath}`
    const resolvedBase = normalizeBaseUrl(baseOverride) || apiBaseUrl || defaultApiBase
    const url = new URL(finalPath, `${resolvedBase}/`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
    })
    return url.toString()
  }, [apiBaseUrl, defaultApiBase])

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const rawDate = contact.createdAt || contact.updatedAt
      if (!rawDate) return !filterStartDate && !filterEndDate
      const parsed = new Date(rawDate)
      if (Number.isNaN(parsed.getTime())) return !filterStartDate && !filterEndDate
      const onlyDate = parsed.toISOString().slice(0, 10)
      if (filterStartDate && onlyDate < filterStartDate) return false
      if (filterEndDate && onlyDate > filterEndDate) return false
      return true
    })
  }, [contacts, filterStartDate, filterEndDate])

  const loadContacts = useCallback(async (tokenOverride) => {
    const token = tokenOverride || safeAdminToken
    if (!token) return
    const headers = buildAuthHeaders({}, token)
    let response = await fetch(buildAdminUrl('/contacts'), { headers })
    if (response.status === 404) {
      response = await fetch(buildAdminUrl('/api/contacts'), { headers })
    }
    if (handleUnauthorizedResponse(response.status)) return
    const data = await response.json().catch(() => ({}))
    const loaded = Array.isArray(data.contacts) ? data.contacts : []
    setContacts(loaded)
    setContactCount(loaded.length)
  }, [safeAdminToken, buildAuthHeaders, buildAdminUrl, handleUnauthorizedResponse])

  const loadCustomRequests = useCallback(async (tokenOverride) => {
    const token = tokenOverride || safeAdminToken
    if (!token) return
    try {
      const response = await fetch(buildAdminUrl('/formulations'), { headers: buildAuthHeaders({}, token) })
      if (handleUnauthorizedResponse(response.status)) return
      const data = await response.json().catch(() => ({}))
      setCustomRequests(data.formulations || data.requests || [])
    } catch (error) {
      console.error('Erro ao carregar formulações:', error)
    }
  }, [safeAdminToken, buildAdminUrl, buildAuthHeaders, handleUnauthorizedResponse])

  const loadRagStatus = useCallback(async (tokenOverride) => {
    const token = tokenOverride || safeAdminToken
    if (!token) return
    setRagLoading(true)
    setRagError('')
    try {
      const response = await fetch(buildAdminUrl('/rag-status'), { headers: buildAuthHeaders({}, token) })
      if (handleUnauthorizedResponse(response.status)) return
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) throw new Error(data?.error || 'Erro ao carregar RAG')
      setRagStatus(data.status)
    } catch (error) {
      setRagError(error.message || 'Erro ao carregar RAG')
    } finally {
      setRagLoading(false)
    }
  }, [safeAdminToken, buildAdminUrl, buildAuthHeaders, handleUnauthorizedResponse])

  const loadParamsData = useCallback(async (tokenOverride) => {
    const token = tokenOverride || safeAdminToken
    if (!token) return
    setParamsLoading(true)
    try {
      const headers = buildAuthHeaders({}, token)
      const [resinsRes, printersRes, profilesRes, statsRes] = await Promise.all([
        fetch(buildAdminUrl('/params/resins'), { headers }),
        fetch(buildAdminUrl('/params/printers'), { headers }),
        fetch(buildAdminUrl('/params/profiles'), { headers }),
        fetch(buildAdminUrl('/params/stats'), { headers })
      ])
      if ([resinsRes, printersRes, profilesRes, statsRes].some((res) => handleUnauthorizedResponse(res.status))) return

      const [resinsData, printersData, profilesData, statsData] = await Promise.all([
        resinsRes.json().catch(() => ({})),
        printersRes.json().catch(() => ({})),
        profilesRes.json().catch(() => ({})),
        statsRes.json().catch(() => ({}))
      ])

      if (resinsData.success) {
        setParamsResins((resinsData.resins || []).map((item) => ({
          ...item,
          id: item.id || item._id || item.name,
          _id: item._id || item.id || item.name,
          name: item.name || item.label || item.resinName || 'Sem nome'
        })))
      }

      if (printersData.success) {
        setParamsPrinters((printersData.printers || []).map((item) => {
          const brand = item.brand || ''
          const model = item.model || item.name || item.label || ''
          const label = [brand, model].filter(Boolean).join(' ').trim() || item.name || item.label || 'Sem nome'
          return {
            ...item,
            id: item.id || item._id || label,
            _id: item._id || item.id || label,
            name: item.name || label,
            brand,
            model,
            label
          }
        }))
      }

      if (profilesData.success) setParamsProfiles(profilesData.profiles || [])
      if (statsData.success) setParamsStats(statsData.stats || null)
    } catch (error) {
      console.error('Erro params:', error)
    } finally {
      setParamsLoading(false)
    }
  }, [safeAdminToken, buildAuthHeaders, buildAdminUrl, handleUnauthorizedResponse])

  const refreshAllData = useCallback(async (tokenOverride) => {
    const token = tokenOverride || safeAdminToken
    if (!token) return
    setLoading(true)
    try {
      setMetricsRefreshKey((prev) => prev + 1)
      setSuggestionsRefreshKey((prev) => prev + 1)
      setOrdersRefreshKey((prev) => prev + 1)
      setKnowledgeRefreshKey((prev) => prev + 1)
      setContactRefreshKey((prev) => prev + 1)
      await Promise.all([
        loadContacts(token),
        loadCustomRequests(token),
        loadRagStatus(token),
        loadParamsData(token)
      ])
    } finally {
      setLoading(false)
    }
  }, [safeAdminToken, loadContacts, loadCustomRequests, loadRagStatus, loadParamsData])

  useEffect(() => {
    if (isAuthenticated) refreshAllData()
  }, [isAuthenticated, refreshAllData])

  const resolveRequestDate = (request) => formatDateTime(request?.createdAt || request?.date || request?.updatedAt)
  const resolveRequestFeature = (request) => request?.desiredFeature || request?.caracteristica || request?.details || request?.description || 'Sem detalhes'
  const resolveRequestPhone = (request) => (request?.phone || request?.telefone || request?.whatsapp || '').replace(/\D/g, '')

  const addResin = async () => {
    if (!safeAdminToken || !newResinName.trim()) return
    await fetch(buildAdminUrl('/params/resins'), {
      method: 'POST',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: newResinName.trim() })
    })
    setNewResinName('')
    loadParamsData()
  }

  const deleteResin = async (id) => {
    if (!window.confirm('Deletar resina?')) return
    await fetch(buildAdminUrl(`/params/resins/${id}`), { method: 'DELETE', headers: buildAuthHeaders() })
    loadParamsData()
  }

  const addPrinter = async () => {
    if (!safeAdminToken || !newPrinterBrand.trim() || !newPrinterModel.trim()) return
    await fetch(buildAdminUrl('/params/printers'), {
      method: 'POST',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ brand: newPrinterBrand.trim(), model: newPrinterModel.trim() })
    })
    setNewPrinterBrand('')
    setNewPrinterModel('')
    loadParamsData()
  }

  const deletePrinter = async (id) => {
    if (!window.confirm('Deletar impressora?')) return
    await fetch(buildAdminUrl(`/params/printers/${id}`), { method: 'DELETE', headers: buildAuthHeaders() })
    loadParamsData()
  }

  const openEditProfile = (profile = null) => {
    if (profile && (profile.id || profile._id)) {
      const clean = (v) => (v ? String(v).replace(/[^\d.]/g, '') : '')
      setEditingProfile(profile)
      setProfileFormData({
        resinId: profile.resinId || '',
        printerId: profile.printerId || '',
        brand: profile.brand || '',
        model: profile.model || '',
        status: profile.status || 'active',
        layerHeightMm: clean(profile.params?.layerHeightMm),
        exposureTimeS: clean(profile.params?.exposureTimeS),
        baseExposureTimeS: clean(profile.params?.baseExposureTimeS || profile.params?.bottomExposureS),
        baseLayers: clean(profile.params?.baseLayers)
      })
      return
    }
    setEditingProfile({ isNew: true })
    setProfileFormData({
      resinId: '',
      printerId: '',
      brand: '',
      model: '',
      status: 'active',
      layerHeightMm: '',
      exposureTimeS: '',
      baseExposureTimeS: '',
      baseLayers: ''
    })
  }

  const saveProfile = async () => {
    if (!safeAdminToken || !profileFormData.resinId || !profileFormData.printerId) {
      toast.error('Selecione resina e impressora')
      return
    }
    const payload = {
      resinId: profileFormData.resinId,
      printerId: profileFormData.printerId,
      brand: profileFormData.brand,
      model: profileFormData.model,
      status: profileFormData.status || 'active',
      params: {
        layerHeightMm: profileFormData.layerHeightMm,
        exposureTimeS: profileFormData.exposureTimeS,
        baseExposureTimeS: profileFormData.baseExposureTimeS,
        baseLayers: profileFormData.baseLayers
      }
    }
    const isEditing = editingProfile && !editingProfile.isNew && (editingProfile.id || editingProfile._id)
    const endpoint = isEditing ? `/params/profiles/${editingProfile.id || editingProfile._id}` : '/params/profiles'
    const method = isEditing ? 'PATCH' : 'POST'
    const response = await fetch(buildAdminUrl(endpoint), {
      method,
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    })
    if (handleUnauthorizedResponse(response.status)) return
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.success) {
      toast.error(data?.error || 'Erro ao salvar perfil')
      return
    }
    toast.success(isEditing ? 'Perfil atualizado!' : 'Perfil criado!')
    setEditingProfile(null)
    loadParamsData()
  }

  const deleteProfile = async (id) => {
    if (!window.confirm('Deletar perfil?')) return
    const response = await fetch(buildAdminUrl(`/params/profiles/${id}`), { method: 'DELETE', headers: buildAuthHeaders() })
    if (handleUnauthorizedResponse(response.status)) return
    loadParamsData()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="mx-auto mt-20 max-w-md p-8">
          <h2 className="mb-2 text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Painel Administrativo</h2>
          <p className="text-center text-sm text-gray-500">Faça login pelo painel principal. Não é mais necessário digitar a senha duas vezes.</p>
          <div className="mt-4 text-center">
            <Button onClick={onClose} variant="outline">Fechar</Button>
          </div>
        </Card>
      </div>
    )
  }

  const originCards = [
    { label: 'Instagram', icon: '📱', value: filteredContacts.filter((c) => (c.origin || '').toLowerCase().includes('instagram')).length, className: 'from-pink-500 to-purple-600' },
    { label: 'YouTube', icon: '🎥', value: filteredContacts.filter((c) => (c.origin || '').toLowerCase().includes('youtube')).length, className: 'from-red-500 to-red-700' },
    { label: 'Google', icon: '🔍', value: filteredContacts.filter((c) => (c.origin || '').toLowerCase().includes('google')).length, className: 'from-blue-500 to-green-500' },
    { label: 'Mercado Livre / Shopee', icon: '🛒', value: filteredContacts.filter((c) => { const origin = (c.origin || '').toLowerCase(); return origin.includes('mercado livre') || origin.includes('shopee') }).length, className: 'from-yellow-500 to-orange-600' },
    { label: 'Indicação', icon: '🤝', value: filteredContacts.filter((c) => (c.origin || '').toLowerCase().includes('indica')).length, className: 'from-emerald-500 to-teal-600' },
    { label: 'Já sou cliente', icon: '⭐', value: filteredContacts.filter((c) => (c.origin || '').toLowerCase().includes('cliente')).length, className: 'from-slate-600 to-slate-800' }
  ]

  const leader = [...originCards].sort((a, b) => b.value - a.value)[0]?.label || '-'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        <div className="mb-8 flex justify-between">
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">Painel Administrativo</h1>
          <div className="flex gap-3">
            <Button onClick={() => refreshAllData()} disabled={loading}><Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar</Button>
            <Button onClick={() => handleLogout('Sessão encerrada.')} variant="outline">Sair</Button>
            <Button onClick={onClose} variant="outline"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <Button onClick={() => setActiveTab('metrics')} variant={activeTab === 'metrics' ? 'default' : 'outline'} className={activeTab === 'metrics' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><BarChart3 className="mr-2 h-4 w-4" /> Métricas</Button>
          <Button onClick={() => setActiveTab('suggestions')} variant={activeTab === 'suggestions' ? 'default' : 'outline'} className={activeTab === 'suggestions' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><MessageSquare className="mr-2 h-4 w-4" /> Sugestões</Button>
          <Button onClick={() => setActiveTab('orders')} variant={activeTab === 'orders' ? 'default' : 'outline'} className={activeTab === 'orders' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><ShoppingBag className="mr-2 h-4 w-4" /> Pedidos</Button>
          <Button onClick={() => setActiveTab('gallery')} variant={activeTab === 'gallery' ? 'default' : 'outline'} className={activeTab === 'gallery' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Camera className="mr-2 h-4 w-4" /> Galeria</Button>
          <Button onClick={() => setActiveTab('visual')} variant={activeTab === 'visual' ? 'default' : 'outline'} className={activeTab === 'visual' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Eye className="mr-2 h-4 w-4" /> Treinamento Visual</Button>
          <Button onClick={() => { setActiveTab('params'); loadParamsData() }} variant={activeTab === 'params' ? 'default' : 'outline'} className={activeTab === 'params' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Beaker className="mr-2 h-4 w-4" /> Parâmetros</Button>
          <Button onClick={() => setActiveTab('documents')} variant={activeTab === 'documents' ? 'default' : 'outline'} className={activeTab === 'documents' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><BookOpen className="mr-2 h-4 w-4" /> Documentos</Button>
          <Button onClick={() => setActiveTab('partners')} variant={activeTab === 'partners' ? 'default' : 'outline'} className={activeTab === 'partners' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Handshake className="mr-2 h-4 w-4" /> Parceiros</Button>
          <Button onClick={() => setActiveTab('contacts')} variant={activeTab === 'contacts' ? 'default' : 'outline'} className={activeTab === 'contacts' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Phone className="mr-2 h-4 w-4" /> Contatos</Button>
          <Button onClick={() => { setActiveTab('custom'); loadCustomRequests() }} variant={activeTab === 'custom' ? 'default' : 'outline'} className={activeTab === 'custom' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}><Beaker className="mr-2 h-4 w-4" /> Formulações</Button>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          {(ragStatus || ragError) && (
            <div className="mb-6 space-y-2">
              <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-xs uppercase text-gray-500">Base de conhecimento (RAG)</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={`px-3 py-1 ${ragStatus?.isHealthy ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {ragStatus?.isHealthy ? 'Saudável' : 'Monitorando'}
                    </Badge>
                    {ragLoading && <span className="flex items-center gap-1 text-xs text-gray-500"><Loader2 className="h-3 w-3 animate-spin" /> Atualizando...</span>}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Docs indexados: {ragStatus?.databaseEntries ?? 0} · Arquivos locais: {ragStatus?.knowledgeFiles ?? 0}</p>
                  <p className="text-xs text-gray-500">Última verificação: {formatDateTime(ragStatus?.lastCheck)}</p>
                </div>
                <div className="text-right">
                  <p className="mb-2 text-xs text-gray-500">Mongo: {ragStatus?.databaseStatus || 'desconhecido'}</p>
                  <Button variant="outline" size="sm" onClick={() => loadRagStatus()} disabled={ragLoading}>Atualizar RAG</Button>
                </div>
              </Card>
              {ragError && <Card className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{ragError}</Card>}
            </div>
          )}

          {activeTab === 'metrics' && (
            <>
              <MetricsTab apiToken={safeAdminToken} buildAdminUrl={buildAdminUrl} refreshKey={metricsRefreshKey} />

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5" /> Origem dos Clientes</h3>
                  <Card className="mb-4 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                      <div className="w-full md:max-w-[220px]">
                        <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700"><CalendarDays className="h-4 w-4" /> Data inicial</label>
                        <Input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                      </div>
                      <div className="w-full md:max-w-[220px]">
                        <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700"><CalendarDays className="h-4 w-4" /> Data final</label>
                        <Input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setFilterStartDate(''); setFilterEndDate('') }}>Limpar filtro</Button>
                        <Badge variant="outline" className="flex h-10 items-center px-3"><Search className="mr-2 h-4 w-4" /> {filteredContacts.length} registros filtrados</Badge>
                      </div>
                    </div>
                  </Card>

                  {filteredContacts.length === 0 ? (
                    <Card className="border border-amber-200 bg-amber-50 p-4 text-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Nenhum contato encontrado para o filtro atual.</p>
                          <p className="mt-1 text-sm">Limpe as datas ou ajuste o período para visualizar os cadastros.</p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card className="border-dashed p-4">
                          <p className="text-xs uppercase text-gray-500">Cadastros últimos 7 dias</p>
                          <p className="mt-2 text-3xl font-bold">{filteredContacts.filter((contact) => {
                            const rawDate = contact.createdAt || contact.updatedAt
                            if (!rawDate) return false
                            const parsed = new Date(rawDate)
                            if (Number.isNaN(parsed.getTime())) return false
                            return (Date.now() - parsed.getTime()) <= 7 * 24 * 60 * 60 * 1000
                          }).length}</p>
                        </Card>
                        <Card className="border-dashed p-4">
                          <p className="text-xs uppercase text-gray-500">Origem líder</p>
                          <p className="mt-2 text-xl font-bold">{leader}</p>
                        </Card>
                        <Card className="border-dashed p-4">
                          <p className="text-xs uppercase text-gray-500">Clientes acumulados</p>
                          <p className="mt-2 text-3xl font-bold">{filteredContacts.length}</p>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {originCards.map((card) => (
                          <Card key={card.label} className={`bg-gradient-to-br ${card.className} p-6 text-white shadow-lg`}>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-medium opacity-90">{card.icon} {card.label}</span>
                            </div>
                            <div className="text-4xl font-bold">{card.value}</div>
                            <p className="mt-2 text-xs opacity-75">Total de clientes</p>
                          </Card>
                        ))}
                      </div>

                      <Card className="p-4">
                        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h4 className="text-lg font-bold">Últimos cadastros</h4>
                            <p className="text-sm text-gray-500">Histórico detalhado de origem, contato e data.</p>
                          </div>
                          <Badge variant="outline" className="w-fit">Total acumulado: {filteredContacts.length}</Badge>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-left">
                                <th className="py-2 pr-4">Nome</th>
                                <th className="py-2 pr-4">Telefone</th>
                                <th className="py-2 pr-4">E-mail</th>
                                <th className="py-2 pr-4">Origem</th>
                                <th className="py-2 pr-4">Resina</th>
                                <th className="py-2">Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredContacts.slice(0, 100).map((contact, index) => (
                                <tr key={`${contact.id || contact.email || contact.phone || 'contact'}-${index}`} className="border-b align-top">
                                  <td className="py-2 pr-4 font-medium">{contact.name || 'Sem nome'}</td>
                                  <td className="py-2 pr-4">{contact.phone || '-'}</td>
                                  <td className="py-2 pr-4">{contact.email || '-'}</td>
                                  <td className="py-2 pr-4">{contact.origin || 'Direto'}</td>
                                  <td className="py-2 pr-4">{contact.resin || '-'}</td>
                                  <td className="py-2">{formatDateTime(contact.createdAt || contact.updatedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-center text-xs text-gray-500">💡 Agora as métricas usam o histórico acumulado e você pode pesquisar por data.</p>
              </div>
            </>
          )}

          {activeTab === 'suggestions' && <SuggestionsTab isAdmin={isAdmin} isVisible={true} adminToken={safeAdminToken} buildAdminUrl={buildAdminUrl} refreshKey={suggestionsRefreshKey} onCountChange={() => {}} />}
          {activeTab === 'orders' && <OrdersTab isAdmin={isAdmin} isVisible={true} adminToken={safeAdminToken} buildAdminUrl={buildAdminUrl} refreshKey={ordersRefreshKey} onCountChange={() => {}} />}
          {activeTab === 'gallery' && <InternalGalleryTab isAdmin={isAdmin} adminToken={safeAdminToken} apiBaseUrl={apiBaseUrl} onPendingCountChange={setGalleryPendingCount} onUnauthorized={() => handleLogout('Sessão expirada. Faça login novamente.')} />}
          {activeTab === 'documents' && <DocumentsTab isAdmin={isAdmin} refreshKey={knowledgeRefreshKey} />}
          {activeTab === 'contacts' && <ContactsTab isAdmin={isAdmin} isVisible={true} adminToken={safeAdminToken} buildAdminUrl={buildAdminUrl} onCountChange={setContactCount} onContactsChange={setContacts} refreshKey={contactRefreshKey} />}
          {activeTab === 'partners' && (
            <div className="p-4">
              <ErrorBoundary fallback={<div className="rounded bg-red-50 p-4 text-red-700"><p>Erro ao carregar Parceiros.</p></div>}>
                <PartnersManager isAdmin={isAdmin} />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === 'visual' && (
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold"><Eye className="h-5 w-5" /> Treinamento Visual</h3>
              <p className="text-sm text-gray-600">A parte visual foi preservada no backend. Neste ajuste eu foquei em estabilizar o login do painel, a métrica por data e a exclusão da galeria.</p>
            </Card>
          )}
          {activeTab === 'params' && (
            <div className="space-y-6">
              {paramsStats && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <Card className="p-4"><p>Resinas</p><p className="text-2xl font-bold">{paramsStats.totalResins}</p></Card>
                  <Card className="p-4"><p>Impressoras</p><p className="text-2xl font-bold">{paramsStats.totalPrinters}</p></Card>
                  <Card className="p-4"><p>Perfis</p><p className="text-2xl font-bold">{paramsStats.activeProfiles}</p></Card>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h3 className="mb-2 font-bold">Resinas</h3>
                  <div className="mb-2 flex gap-2"><Input value={newResinName} onChange={(e) => setNewResinName(e.target.value)} /><Button onClick={addResin}><Plus /></Button></div>
                  {paramsResins.map((resin) => <div key={resin.id} className="flex justify-between border-b p-1">{resin.name}<Trash2 onClick={() => deleteResin(resin.id)} className="h-4 w-4 cursor-pointer text-red-500" /></div>)}
                </Card>
                <Card className="p-4">
                  <h3 className="mb-2 font-bold">Impressoras</h3>
                  <div className="mb-2 flex gap-2"><Input placeholder="Marca" value={newPrinterBrand} onChange={(e) => setNewPrinterBrand(e.target.value)} /><Input placeholder="Modelo" value={newPrinterModel} onChange={(e) => setNewPrinterModel(e.target.value)} /><Button onClick={addPrinter}><Plus /></Button></div>
                  {paramsPrinters.map((printer) => <div key={printer.id} className="flex justify-between border-b p-1">{printer.brand} {printer.model}<Trash2 onClick={() => deletePrinter(printer.id)} className="h-4 w-4 cursor-pointer text-red-500" /></div>)}
                </Card>
              </div>
              <Card className="p-4">
                <div className="mb-4 flex justify-between"><h3 className="font-bold">Perfis</h3><Button onClick={() => openEditProfile(null)}>Novo</Button></div>
                <table className="w-full text-sm">
                  <thead><tr><th className="text-left">Resina</th><th className="text-left">Impressora</th><th className="text-left">Camada</th><th className="text-left">Exp.</th><th className="text-left">Ações</th></tr></thead>
                  <tbody>
                    {paramsProfiles.map((profile) => (
                      <tr key={profile.id} className="border-b">
                        <td>{profile.resinName}</td><td>{profile.brand} {profile.model}</td><td>{profile.params?.layerHeightMm}</td><td>{profile.params?.exposureTimeS}</td>
                        <td><Edit3 onClick={() => openEditProfile(profile)} className="mr-2 inline h-4 w-4 cursor-pointer" /><Trash2 onClick={() => deleteProfile(profile.id)} className="inline h-4 w-4 cursor-pointer text-red-500" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              {editingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6">
                    <h3 className="mb-4 font-bold">{editingProfile?.isNew ? 'Novo Perfil' : 'Editar Perfil'}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={profileFormData.resinId} onChange={(e) => setProfileFormData({ ...profileFormData, resinId: e.target.value })} className="rounded border p-2"><option value="">Resina...</option>{paramsResins.map((resin) => <option key={resin.id} value={resin.id}>{resin.name}</option>)}</select>
                      <select value={profileFormData.printerId} onChange={(e) => setProfileFormData({ ...profileFormData, printerId: e.target.value })} className="rounded border p-2"><option value="">Impressora...</option>{paramsPrinters.map((printer) => <option key={printer.id} value={printer.id}>{printer.brand} {printer.model}</option>)}</select>
                      <Input placeholder="Marca" value={profileFormData.brand} onChange={(e) => setProfileFormData({ ...profileFormData, brand: e.target.value })} />
                      <Input placeholder="Modelo" value={profileFormData.model} onChange={(e) => setProfileFormData({ ...profileFormData, model: e.target.value })} />
                      <Input placeholder="Camada (mm)" value={profileFormData.layerHeightMm} onChange={(e) => setProfileFormData({ ...profileFormData, layerHeightMm: e.target.value.replace(/[^\d.]/g, '') })} />
                      <Input placeholder="Expo (s)" value={profileFormData.exposureTimeS} onChange={(e) => setProfileFormData({ ...profileFormData, exposureTimeS: e.target.value.replace(/[^\d.]/g, '') })} />
                      <Input placeholder="Base (s)" value={profileFormData.baseExposureTimeS} onChange={(e) => setProfileFormData({ ...profileFormData, baseExposureTimeS: e.target.value.replace(/[^\d.]/g, '') })} />
                      <Input placeholder="Camadas Base" value={profileFormData.baseLayers} onChange={(e) => setProfileFormData({ ...profileFormData, baseLayers: e.target.value.replace(/[^\d.]/g, '') })} />
                      <select value={profileFormData.status} onChange={(e) => setProfileFormData({ ...profileFormData, status: e.target.value })} className="rounded border p-2"><option value="active">Ativo</option><option value="draft">Rascunho</option><option value="coming_soon">Coming Soon</option></select>
                    </div>
                    <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setEditingProfile(null)}>Cancelar</Button><Button onClick={saveProfile}>Salvar</Button></div>
                  </Card>
                </div>
              )}
            </div>
          )}
          {activeTab === 'custom' && (
            <div>
              {customRequests.length === 0 ? <p className="p-8 text-center text-gray-500">Sem pedidos.</p> : customRequests.map((request, index) => {
                const phoneDigits = resolveRequestPhone(request)
                const featureText = resolveRequestFeature(request)
                const requestDate = resolveRequestDate(request)
                return (
                  <Card key={request.id || index} className="mb-4 p-4">
                    <div className="flex justify-between"><h4 className="font-bold">{request.name || 'Cliente'}</h4><span className="text-xs">{requestDate}</span></div>
                    <p className="text-sm">Característica: {featureText}</p>
                    {request.color && <p className="text-sm text-gray-600">Cor desejada: {request.color}</p>}
                    {request.email && <p className="text-xs text-gray-500">Email: {request.email}</p>}
                    {phoneDigits && <Button size="sm" className="mt-2 bg-green-600" onClick={() => window.open(`https://wa.me/55${phoneDigits}`)}><Phone className="mr-2 h-4 w-4" /> WhatsApp</Button>}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
