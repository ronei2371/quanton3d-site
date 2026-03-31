import React, { useCallback, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { X, Check, User, Phone, MessageSquare, BarChart3, BookOpen, Plus, Beaker, Edit3, Mail, Camera, Loader2, Eye, Trash2, Upload, AlertCircle, Handshake, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import { PartnersManager } from './PartnersManager.jsx';
import { MetricsTab } from './admin/MetricsTab.jsx';
import { SuggestionsTab } from './admin/SuggestionsTab.jsx';
import { OrdersTab } from './admin/OrdersTab.jsx';
import { GalleryTab } from './admin/GalleryTab.jsx';
import { DocumentsTab } from './admin/DocumentsTab.jsx';
import { ContactsTab } from './admin/ContactsTab.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center border-red-200 bg-red-50 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">Erro ao carregar este módulo. Tente atualizar a página.</p>
        </Card>
      );
    }
    return this.props.children;
  }
}

function PendingVisualItemForm({ item, onApprove, onDelete, canDelete }) {
  const [defectType, setDefectType] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApproveClick = async () => {
    setIsSubmitting(true);
    try {
      const success = await onApprove(item._id, defectType, diagnosis, solution);
      if (success) {
        setDefectType('');
        setDiagnosis('');
        setSolution('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
      <div className="flex gap-4">
        <img
          src={item.imageUrl}
          alt="Foto pendente"
          className="w-40 h-40 object-cover rounded-lg border flex-shrink-0"
        />
        <div className="flex-1 space-y-3">
          <div className="text-xs text-gray-500">
            Enviada em: {new Date(item.createdAt).toLocaleString('pt-BR')}
            {item.userName && <span className="ml-2">| Cliente: {item.userName}</span>}
          </div>
          <select
            value={defectType}
            onChange={(e) => setDefectType(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600"
          >
            <option value="">Selecione o tipo de defeito...</option>
            <option value="descolamento da base">Descolamento da base</option>
            <option value="falha de suportes">Falha de suportes</option>
            <option value="rachadura/quebra da peca">Rachadura/quebra da peça</option>
            <option value="falha de adesao entre camadas / delaminacao">Delaminação</option>
            <option value="deformacao/warping">Deformação/Warping</option>
            <option value="problema de superficie/acabamento">Problema de superfície</option>
            <option value="excesso ou falta de cura">Excesso ou falta de cura</option>
            <option value="problema de LCD">Problema de LCD</option>
            <option value="outro">Outro</option>
          </select>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Diagnóstico técnico..."
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600 min-h-[60px]"
          />
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Solução recomendada..."
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-600 min-h-[60px]"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleApproveClick}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Aprovando...' : 'Aprovar e Treinar'}
            </Button>
            {canDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(item._id)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Descartar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessLevel, setAccessLevel] = useState(null);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('metrics');
  const [loading, setLoading] = useState(false);

  const [metricsRefreshKey, setMetricsRefreshKey] = useState(0);
  const [suggestionsCount, setSuggestionsCount] = useState(0);
  const [suggestionsRefreshKey, setSuggestionsRefreshKey] = useState(0);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const [ordersPendingCount, setOrdersPendingCount] = useState(0);
  const [knowledgeRefreshKey, setKnowledgeRefreshKey] = useState(0);
  const [customRequests, setCustomRequests] = useState([]);
  const [galleryPendingCount, setGalleryPendingCount] = useState(0);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [contactRefreshKey, setContactRefreshKey] = useState(0);
  const [contacts, setContacts] = useState([]); // Estado adicionado conforme solicitado

  const [visualKnowledge, setVisualKnowledge] = useState([]);
  const [visualLoading, setVisualLoading] = useState(false);
  const [pendingVisualPhotos, setPendingVisualPhotos] = useState([]);
  const [pendingVisualLoading, setPendingVisualLoading] = useState(false);

  const [paramsResins, setParamsResins] = useState([]);
  const [paramsPrinters, setParamsPrinters] = useState([]);
  const [paramsProfiles, setParamsProfiles] = useState([]);
  const [paramsStats, setParamsStats] = useState(null);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [newResinName, setNewResinName] = useState('');
  const [newPrinterBrand, setNewPrinterBrand] = useState('');
  const [newPrinterModel, setNewPrinterModel] = useState('');

  const API_BASE_URL = useMemo(() => {
    return (import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com').replace(/\/$/, '');
  }, []);

  const buildAdminUrl = useCallback((path) => {
    const cleanPath = path.replace(/^\/+/, '').replace(/^api\//, '');
    return `${API_BASE_URL}/api/${cleanPath}`;
  }, [API_BASE_URL]);

  const ADMIN_PASSWORD = 'Rmartins1201';
  const TEAM_SECRET = 'suporte_quanton_2025';
  const isAdmin = accessLevel === 'admin';

  const refreshAllData = async () => {
    setLoading(true);
    try {
      setMetricsRefreshKey((k) => k + 1);
      setSuggestionsRefreshKey((k) => k + 1);
      setOrdersRefreshKey((k) => k + 1);
      setKnowledgeRefreshKey((k) => k + 1);
      setContactRefreshKey((k) => k + 1);
      setGalleryRefreshKey((k) => k + 1);
      await Promise.all([
        loadCustomRequests(),
        loadVisualKnowledge(),
        loadPendingVisualPhotos(),
        loadParamsData()
      ]);
    } catch (error) {
      console.error('Erro ao atualizar painel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (password === ADMIN_PASSWORD) {
      setAccessLevel('admin');
    } else if (password === TEAM_SECRET) {
      setAccessLevel('support');
    } else {
      toast.error('Senha incorreta!');
      return;
    }
    setIsAuthenticated(true);
    await refreshAllData();
  };

  const loadCustomRequests = async () => {
    try {
      const response = await fetch(buildAdminUrl('/orders'));
      const data = await response.json();
      const orders = Array.isArray(data.orders) ? data.orders : [];
      setCustomRequests(orders.filter((item) => item?.type === 'custom_request'));
    } catch (error) {
      console.error('Erro ao carregar pedidos customizados:', error);
    }
  };

  const loadVisualKnowledge = async () => {
    setVisualLoading(true);
    try {
      const response = await fetch(buildAdminUrl('/visual-knowledge'));
      const data = await response.json();
      setVisualKnowledge(data.documents || data.items || []);
    } catch (error) {
      console.error('Erro ao carregar conhecimento visual:', error);
    } finally {
      setVisualLoading(false);
    }
  };

  const loadPendingVisualPhotos = async () => {
    setPendingVisualLoading(true);
    try {
      const response = await fetch(buildAdminUrl('/visual-knowledge/pending'));
      const data = await response.json();
      setPendingVisualPhotos(data.pending || data.documents || []);
    } catch (error) {
      console.error('Erro ao carregar fotos pendentes:', error);
    } finally {
      setPendingVisualLoading(false);
    }
  };

  const loadParamsData = async () => {
    setParamsLoading(true);
    try {
      const [resinsRes, printersRes, profilesRes, statsRes] = await Promise.all([
        fetch(buildAdminUrl('/params/resins')),
        fetch(buildAdminUrl('/params/printers')),
        fetch(buildAdminUrl('/params/profiles')),
        fetch(buildAdminUrl('/params/stats'))
      ]);

      const [resinsData, printersData, profilesData, statsData] = await Promise.all([
        resinsRes.json(),
        printersRes.json(),
        profilesRes.json(),
        statsRes.json()
      ]);

      if (resinsData.success) setParamsResins(resinsData.resins || []);
      if (printersData.success) setParamsPrinters(printersData.printers || []);
      if (profilesData.success) setParamsProfiles(profilesData.profiles || []);
      if (statsData.success) setParamsStats(statsData.stats || null);
    } catch (error) {
      console.error('Erro ao carregar parâmetros:', error);
    } finally {
      setParamsLoading(false);
    }
  };

  const addResin = async () => {
    toast.warning('Cadastro de resina pelo painel está indisponível nesta versão da API.');
  };

  const deleteResin = async (resinId) => {
    void resinId;
    if (!isAdmin) return toast.warning('Seu nível de acesso não permite excluir dados.');
    toast.warning('Exclusão de resina pelo painel está indisponível nesta versão da API.');
  };

  const approvePendingVisual = async (id, defectType, diagnosis, solution) => {
    if (!defectType || !diagnosis || !solution) {
      toast.warning('Preencha todos os campos antes de aprovar');
      return false;
    }
    try {
      const response = await fetch(buildAdminUrl(`/visual-knowledge/${id}/approve`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defectType, diagnosis, solution })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Conhecimento visual aprovado com sucesso!');
        loadPendingVisualPhotos();
        loadVisualKnowledge();
        return true;
      } else {
        toast.error(data.error || 'Erro ao aprovar');
        return false;
      }
    } catch (error) {
      console.error('Erro ao aprovar conhecimento visual:', error);
      toast.error('Erro ao aprovar conhecimento visual');
      return false;
    }
  };

  const deletePendingVisual = async (id) => {
    void id;
    if (!isAdmin) return toast.warning('Seu nível de acesso não permite excluir dados.');
    toast.warning('Descartar foto pendente pelo painel está indisponível nesta versão da API.');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Painel Administrativo Quanton3D
          </h2>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Senha do painel (admin ou equipe)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
              Entrar no Sistema
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Painel Administrativo Quanton3D
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
              {isAdmin ? 'Admin' : 'Equipe'}
            </span>
          </div>
          <div className="flex gap-3">
            <Button onClick={refreshAllData} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Tudo'}
            </Button>
            {onClose && <Button variant="outline" onClick={onClose}><X className="h-4 w-4" /></Button>}
          </div>
        </div>

        {/* Menu de Abas */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-gray-900 p-2 rounded-xl shadow-sm border">
          <Button onClick={() => setActiveTab('metrics')} variant={activeTab === 'metrics' ? 'default' : 'ghost'}><BarChart3 className="h-4 w-4 mr-2" /> Métricas</Button>
          <Button onClick={() => setActiveTab('messages')} variant={activeTab === 'messages' ? 'default' : 'ghost'}><Mail className="h-4 w-4 mr-2" /> Mensagens ({contactCount})</Button>
          <Button onClick={() => setActiveTab('custom')} variant={activeTab === 'custom' ? 'default' : 'ghost'}><Beaker className="h-4 w-4 mr-2" /> Fórmulas ({customRequests.length})</Button>
          <Button onClick={() => setActiveTab('suggestions')} variant={activeTab === 'suggestions' ? 'default' : 'ghost'}><MessageSquare className="h-4 w-4 mr-2" /> Sugestões</Button>
          <Button onClick={() => setActiveTab('orders')} variant={activeTab === 'orders' ? 'default' : 'ghost'}><ShoppingBag className="h-4 w-4 mr-2" /> Pedidos</Button>
          <Button onClick={() => setActiveTab('visual')} variant={activeTab === 'visual' ? 'default' : 'ghost'}><Eye className="h-4 w-4 mr-2" /> Treinamento Visual</Button>
          <Button onClick={() => setActiveTab('gallery')} variant={activeTab === 'gallery' ? 'default' : 'ghost'}><Camera className="h-4 w-4 mr-2" /> Galeria</Button>
          <Button onClick={() => setActiveTab('knowledge')} variant={activeTab === 'knowledge' ? 'default' : 'ghost'}><BookOpen className="h-4 w-4 mr-2" /> Conhecimento</Button>
          <Button onClick={() => setActiveTab('partners')} variant={activeTab === 'partners' ? 'default' : 'ghost'}><Handshake className="h-4 w-4 mr-2" /> Parceiros</Button>
          <Button onClick={() => setActiveTab('params')} variant={activeTab === 'params' ? 'default' : 'ghost'}><Edit3 className="h-4 w-4 mr-2" /> Parâmetros</Button>
        </div>

        {/* Abas com conteúdo real */}
        {activeTab === 'metrics' && <MetricsTab buildAdminUrl={buildAdminUrl} refreshKey={metricsRefreshKey} />}
        {activeTab === 'messages' && <ContactsTab buildAdminUrl={buildAdminUrl} isVisible={true} onCountChange={setContactCount} onContactsChange={setContacts} refreshKey={contactRefreshKey} />}
        {activeTab === 'suggestions' && <SuggestionsTab buildAdminUrl={buildAdminUrl} isAdmin={isAdmin} isVisible={true} onCountChange={setSuggestionsCount} refreshKey={suggestionsRefreshKey} />}
        {activeTab === 'orders' && <OrdersTab buildAdminUrl={buildAdminUrl} isAdmin={isAdmin} isVisible={true} onCountChange={setOrdersPendingCount} refreshKey={ordersRefreshKey} />}

        {activeTab === 'custom' && (
          <div className="space-y-4">
            {customRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Beaker className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Nenhum pedido de formulação customizada ainda.</p>
              </Card>
            ) : (
              customRequests.map((request, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{request.phone}</span>
                          <span className="truncate">{request.email}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(request.timestamp || Date.now()).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">CARACTERÍSTICA DESEJADA</p>
                      <p className="text-sm">{request.caracteristica || request.desiredFeature}</p>
                    </div>
                    {request.cor && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">COR</p>
                        <p className="text-sm">{request.cor}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="mt-4 bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(`https://wa.me/55${request.phone?.replace(/\D/g, '') || ''}?text=Olá ${request.name}, sobre sua solicitação...`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contatar via WhatsApp
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Eye className="h-5 w-5" /> Treinamento Visual</h3>
              {pendingVisualLoading ? (
                <div className="flex items-center gap-2 text-yellow-600"><Loader2 className="animate-spin" /> Carregando fotos pendentes...</div>
              ) : pendingVisualPhotos.length > 0 ? (
                <div className="space-y-4">
                  {pendingVisualPhotos.map((item) => (
                    <PendingVisualItemForm
                      key={item._id}
                      item={item}
                      onApprove={approvePendingVisual}
                      onDelete={deletePendingVisual}
                      canDelete={isAdmin}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma foto pendente no momento.</p>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'gallery' && <GalleryTab isAdmin={isAdmin} isVisible={true} refreshKey={galleryRefreshKey} onPendingCountChange={setGalleryPendingCount} />}
        {activeTab === 'knowledge' && <DocumentsTab isAdmin={isAdmin} refreshKey={knowledgeRefreshKey} />}
        {activeTab === 'partners' && (
          <ErrorBoundary>
            <PartnersManager />
          </ErrorBoundary>
        )}

        {activeTab === 'params' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Gerenciar Parâmetros de Impressão</h3>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Nome da nova resina..."
                  value={newResinName}
                  onChange={(e) => setNewResinName(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={addResin} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Resina
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {paramsResins.map((resin) => (
                  <div key={resin.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium">{resin.name}</span>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteResin(resin.id)}
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <h4 className="font-semibold mb-3">Impressoras Cadastradas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {paramsPrinters.map((printer) => (
                  <div key={printer.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    {printer.brand} {printer.model}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
