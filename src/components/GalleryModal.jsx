// Componente: GalleryModal.jsx
// Galeria de fotos de impressoes 3D com upload e visualizacao

import { useCallback, useEffect, useState } from 'react';
import { X, Upload, Image, Camera, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { resinList, printerList } from '@/data/parametersData.js';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com';

const normalizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => (typeof image === 'string' ? { url: image } : image))
    .filter((image) => image && image.url);
};

export function GalleryModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' ou 'upload'
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    resin: '',
    printer: '',
    comment: '',
    // Campos de configuracao de impressao
    layerHeight: '',
    baseLayers: '',
    exposureTime: '',
    baseExposureTime: '',
    transitionLayers: '',
    uvOffDelay: '',
    lowerLiftDistance1: '',
    lowerLiftDistance2: '',
    liftDistance1: '',
    liftDistance2: '',
    liftSpeed1: '',
    liftSpeed2: '',
    lowerRetractSpeed1: '',
    lowerRetractSpeed2: '',
    retractSpeed1: '',
    retractSpeed2: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Filtros
  const [filterResin, setFilterResin] = useState('');
  const [filterPrinter, setFilterPrinter] = useState('');

  // Carregar galeria
  const loadGallery = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/gallery?page=${page}&limit=12`;
      if (filterResin) url += `&resin=${encodeURIComponent(filterResin)}`;
      if (filterPrinter) url += `&printer=${encodeURIComponent(filterPrinter)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        const safeEntries = Array.isArray(data.entries)
          ? data.entries.map((entry) => ({
              ...entry,
              images: normalizeImages(entry.images),
            }))
          : [];
        setEntries(safeEntries);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
      }
    } catch (err) {
      console.error('Erro ao carregar galeria:', err);
      setMessage({ type: 'error', text: 'Erro ao carregar galeria. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }, [filterPrinter, filterResin]);

  useEffect(() => {
    if (isOpen && activeTab === 'gallery') {
      loadGallery(1);
    }
  }, [activeTab, isOpen, loadGallery]);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 2); // Max 2 files
    setSelectedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Remove file
  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    
    URL.revokeObjectURL(newUrls[index]);
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos uma foto.' });
      return;
    }
    
    if (!formData.resin || !formData.printer) {
      setMessage({ type: 'error', text: 'Selecione a resina e a impressora.' });
      return;
    }
    
    setUploading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('resin', formData.resin);
      formDataToSend.append('printer', formData.printer);
      formDataToSend.append('comment', formData.comment);
      
      // Campos de configuracao de impressao
      formDataToSend.append('layerHeight', formData.layerHeight);
      formDataToSend.append('baseLayers', formData.baseLayers);
      formDataToSend.append('exposureTime', formData.exposureTime);
      formDataToSend.append('baseExposureTime', formData.baseExposureTime);
      formDataToSend.append('transitionLayers', formData.transitionLayers);
      formDataToSend.append('uvOffDelay', formData.uvOffDelay);
      formDataToSend.append('lowerLiftDistance1', formData.lowerLiftDistance1);
      formDataToSend.append('lowerLiftDistance2', formData.lowerLiftDistance2);
      formDataToSend.append('liftDistance1', formData.liftDistance1);
      formDataToSend.append('liftDistance2', formData.liftDistance2);
      formDataToSend.append('liftSpeed1', formData.liftSpeed1);
      formDataToSend.append('liftSpeed2', formData.liftSpeed2);
      formDataToSend.append('lowerRetractSpeed1', formData.lowerRetractSpeed1);
      formDataToSend.append('lowerRetractSpeed2', formData.lowerRetractSpeed2);
      formDataToSend.append('retractSpeed1', formData.retractSpeed1);
      formDataToSend.append('retractSpeed2', formData.retractSpeed2);
      
      selectedFiles.forEach(file => {
        formDataToSend.append('images', file);
      });
      
      const response = await fetch(`${API_URL}/api/gallery`, {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'SUCESSO! Suas fotos e configuracoes foram enviadas para o administrador aprovar. Assim que aprovadas, aparecerao na galeria publica.' });
        // Reset form
        setFormData({ 
          name: '', resin: '', printer: '', comment: '',
          layerHeight: '', baseLayers: '', exposureTime: '', baseExposureTime: '',
          transitionLayers: '', uvOffDelay: '',
          lowerLiftDistance1: '', lowerLiftDistance2: '',
          liftDistance1: '', liftDistance2: '',
          liftSpeed1: '', liftSpeed2: '',
          lowerRetractSpeed1: '', lowerRetractSpeed2: '',
          retractSpeed1: '', retractSpeed2: ''
        });
        setSelectedFiles([]);
        setPreviewUrls([]);
      }else {
        setMessage({ type: 'error', text: data.error || 'Erro ao enviar fotos.' });
      }
    } catch (err) {
      console.error('Erro ao enviar:', err);
      setMessage({ type: 'error', text: 'Erro ao enviar fotos. Tente novamente.' });
    } finally {
      setUploading(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2">
      <div className="relative w-full max-w-7xl h-[95vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6" />
            <h2 className="text-xl font-bold">Galeria de Impressoes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Image className="inline-block h-4 w-4 mr-2" />
            Ver Galeria
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="inline-block h-4 w-4 mr-2" />
            Enviar Minha Impressao
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'gallery' ? (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={filterResin}
                  onChange={(e) => setFilterResin(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
                >
                  <option value="">Todas as Resinas</option>
                  {resinList.map(resin => (
                    <option key={resin} value={resin}>{resin}</option>
                  ))}
                </select>
                <select
                  value={filterPrinter}
                  onChange={(e) => setFilterPrinter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
                >
                  <option value="">Todas as Impressoras</option>
                  {printerList.map(printer => (
                    <option key={printer} value={printer}>{printer}</option>
                  ))}
                </select>
              </div>

              {/* Gallery Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Image className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma foto encontrada.</p>
                  <p className="text-sm mt-2">Seja o primeiro a compartilhar sua impressao!</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {entries.map((entry) => {
                      const entryImages = entry.images || [];
                      const primaryImage = entryImages[0]?.url;

                      return (
                        <div
                          key={entry._id}
                          onClick={() => setSelectedEntry(entry)}
                          className="group cursor-pointer rounded-xl overflow-hidden border hover:shadow-lg transition-all"
                        >
                          <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                            {primaryImage ? (
                              <img
                                src={primaryImage}
                                alt={`${entry.resin} - ${entry.printer}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                Sem imagem
                              </div>
                            )}
                            {entryImages.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                +{entryImages.length - 1}
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800">
                            <p className="font-medium text-sm truncate">{entry.resin}</p>
                            <p className="text-xs text-gray-500 truncate">{entry.printer}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <button
                        onClick={() => loadGallery(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-sm">
                        Pagina {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => loadGallery(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* Upload Form */
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
              {message.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Seu Nome (opcional)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Como deseja ser identificado"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Resina Utilizada *</label>
                <select
                  value={formData.resin}
                  onChange={(e) => setFormData({ ...formData, resin: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione a resina</option>
                  {resinList.map(resin => (
                    <option key={resin} value={resin}>{resin}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Impressora Utilizada *</label>
                <select
                  value={formData.printer}
                  onChange={(e) => setFormData({ ...formData, printer: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione a impressora</option>
                  {printerList.map(printer => (
                    <option key={printer} value={printer}>{printer}</option>
                  ))}
                </select>
              </div>

              {/* Secao de Configuracoes de Impressao */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold text-blue-600 mb-3">Configuracoes de Impressao</h4>
                
                {/* Campos simples */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Altura da Camada (mm)</label>
                    <input
                      type="text"
                      value={formData.layerHeight}
                      onChange={(e) => setFormData({ ...formData, layerHeight: e.target.value })}
                      placeholder="0.05"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Camadas Base</label>
                    <input
                      type="text"
                      value={formData.baseLayers}
                      onChange={(e) => setFormData({ ...formData, baseLayers: e.target.value })}
                      placeholder="6"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tempo Exposicao Camada (s)</label>
                    <input
                      type="text"
                      value={formData.exposureTime}
                      onChange={(e) => setFormData({ ...formData, exposureTime: e.target.value })}
                      placeholder="2.5"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tempo Exposicao Base (s)</label>
                    <input
                      type="text"
                      value={formData.baseExposureTime}
                      onChange={(e) => setFormData({ ...formData, baseExposureTime: e.target.value })}
                      placeholder="30"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Camadas Transicao</label>
                    <input
                      type="text"
                      value={formData.transitionLayers}
                      onChange={(e) => setFormData({ ...formData, transitionLayers: e.target.value })}
                      placeholder="5"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Atraso Desligar UV (s)</label>
                    <input
                      type="text"
                      value={formData.uvOffDelay}
                      onChange={(e) => setFormData({ ...formData, uvOffDelay: e.target.value })}
                      placeholder="0.5"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Campos duplos - Distancias */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Distancias de Elevacao (mm)</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-24">Inferior:</span>
                      <input
                        type="text"
                        value={formData.lowerLiftDistance1}
                        onChange={(e) => setFormData({ ...formData, lowerLiftDistance1: e.target.value })}
                        placeholder="Valor 1"
                        className="flex-1 px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={formData.lowerLiftDistance2}
                        onChange={(e) => setFormData({ ...formData, lowerLiftDistance2: e.target.value })}
                        placeholder="Valor 2"
                        className="flex-1 px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-24">Normal:</span>
                      <input
                        type="text"
                        value={formData.liftDistance1}
                        onChange={(e) => setFormData({ ...formData, liftDistance1: e.target.value })}
                        placeholder="Valor 1"
                        className="flex-1 px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={formData.liftDistance2}
                        onChange={(e) => setFormData({ ...formData, liftDistance2: e.target.value })}
                        placeholder="Valor 2"
                        className="flex-1 px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Campos duplos - Velocidades de Elevacao */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Velocidades de Elevacao (mm/s)</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Lift Speed 1 (Lento)</label>
                      <input
                        type="text"
                        value={formData.liftSpeed1}
                        onChange={(e) => setFormData({ ...formData, liftSpeed1: e.target.value })}
                        placeholder="Lift Speed 1 (Lento)"
                        className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Lift Speed 2 (Rapido)</label>
                      <input
                        type="text"
                        value={formData.liftSpeed2}
                        onChange={(e) => setFormData({ ...formData, liftSpeed2: e.target.value })}
                        placeholder="Lift Speed 2 (Rapido)"
                        className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Campos duplos - Velocidades de Retracao */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Velocidades de Retracao (mm/s)</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Retract Speed 1 (Rapido)</label>
                      <input
                        type="text"
                        value={formData.retractSpeed1}
                        onChange={(e) => setFormData({ ...formData, retractSpeed1: e.target.value })}
                        placeholder="Retract Speed 1 (Rapido)"
                        className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Retract Speed 2 (Lento)</label>
                      <input
                        type="text"
                        value={formData.retractSpeed2}
                        onChange={(e) => setFormData({ ...formData, retractSpeed2: e.target.value })}
                        placeholder="Retract Speed 2 (Lento)"
                        className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Comentario (opcional)</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Conte sobre sua experiencia com essa configuracao"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fotos da Impressao * (max 2)</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {previewUrls.length === 0 ? (
                    <label className="cursor-pointer">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Clique para selecionar fotos</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG (max 5MB cada)</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex gap-4 justify-center">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {previewUrls.length < 2 && (
                        <label className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                          <Camera className="h-8 w-8 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setSelectedFiles([...selectedFiles, file]);
                                setPreviewUrls([...previewUrls, URL.createObjectURL(file)]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar para Galeria
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Suas fotos serao revisadas antes de aparecer na galeria publica.
              </p>
            </form>
          )}
        </div>

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-2">
            <div className="relative max-w-6xl w-full max-h-[95vh] bg-white dark:bg-gray-900 rounded-2xl overflow-auto">
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="grid md:grid-cols-2">
                {/* Images */}
                <div className="bg-gray-100 dark:bg-gray-800">
                  {selectedEntry.images.length === 0 ? (
                    <div className="flex h-full min-h-[40vh] items-center justify-center text-sm text-gray-400">
                      Nenhuma imagem disponivel
                    </div>
                  ) : selectedEntry.images.length === 1 ? (
                    <img
                      src={selectedEntry.images[0].url}
                      alt="Impressao"
                      className="w-full h-full object-contain max-h-[60vh]"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {selectedEntry.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Impressao ${idx + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Detalhes da Impressao</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Resina</p>
                      <p className="font-medium">{selectedEntry.resin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Impressora</p>
                      <p className="font-medium">{selectedEntry.printer}</p>
                    </div>
                    {selectedEntry.name && (
                      <div>
                        <p className="text-sm text-gray-500">Enviado por</p>
                        <p className="font-medium">{selectedEntry.name}</p>
                      </div>
                    )}
                    {selectedEntry.comment && (
                      <div>
                        <p className="text-sm text-gray-500">Comentario</p>
                        <p className="text-sm">{selectedEntry.comment}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="text-sm">
                        {new Date(selectedEntry.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    {/* Parametros de Configuracao */}
                    {selectedEntry.params && (
                      <div className="border-t pt-3 mt-3">
                        <p className="text-sm font-semibold text-blue-600 mb-2">Configuracoes de Impressao</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {selectedEntry.params.layerHeight && (
                            <div>
                              <span className="text-gray-500">Altura Camada:</span>
                              <span className="ml-1 font-medium">{selectedEntry.params.layerHeight}mm</span>
                            </div>
                          )}
                          {selectedEntry.params.baseLayers && (
                            <div>
                              <span className="text-gray-500">Camadas Base:</span>
                              <span className="ml-1 font-medium">{selectedEntry.params.baseLayers}</span>
                            </div>
                          )}
                          {selectedEntry.params.exposureTime && (
                            <div>
                              <span className="text-gray-500">Exposicao:</span>
                              <span className="ml-1 font-medium">{selectedEntry.params.exposureTime}s</span>
                            </div>
                          )}
                          {selectedEntry.params.baseExposureTime && (
                            <div>
                              <span className="text-gray-500">Exposicao Base:</span>
                              <span className="ml-1 font-medium">{selectedEntry.params.baseExposureTime}s</span>
                            </div>
                          )}
                          {selectedEntry.params.transitionLayers && (
                            <div>
                              <span className="text-gray-500">Transicao:</span>
                              <span className="ml-1 font-medium">{selectedEntry.params.transitionLayers}</span>
                            </div>
                          )}
                          {selectedEntry.params.uvOffDelay && (
                            <div>
                              <span className="text-gray-500">UV Off Delay:</span>
                              <span className="ml-1 font-medium">{selectedEntry.params.uvOffDelay}s</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Distancias e Velocidades */}
                        {(selectedEntry.params.lowerLiftDistance?.value1 || selectedEntry.params.liftDistance?.value1) && (
                          <div className="mt-2 pt-2 border-t border-dashed">
                            <p className="text-xs text-gray-500 mb-1">Distancias (mm):</p>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              {selectedEntry.params.lowerLiftDistance?.value1 && (
                                <div>Inferior: {selectedEntry.params.lowerLiftDistance.value1} / {selectedEntry.params.lowerLiftDistance.value2}</div>
                              )}
                              {selectedEntry.params.liftDistance?.value1 && (
                                <div>Normal: {selectedEntry.params.liftDistance.value1} / {selectedEntry.params.liftDistance.value2}</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {(selectedEntry.params.liftSpeed?.value1 || selectedEntry.params.lowerRetractSpeed?.value1 || selectedEntry.params.retractSpeed?.value1) && (
                          <div className="mt-2 pt-2 border-t border-dashed">
                            <p className="text-xs text-gray-500 mb-1">Velocidades (mm/s):</p>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              {selectedEntry.params.liftSpeed?.value1 && (
                                <div>Elevacao: {selectedEntry.params.liftSpeed.value1} / {selectedEntry.params.liftSpeed.value2}</div>
                              )}
                              {selectedEntry.params.lowerRetractSpeed?.value1 && (
                                <div>Ret. Inf: {selectedEntry.params.lowerRetractSpeed.value1} / {selectedEntry.params.lowerRetractSpeed.value2}</div>
                              )}
                              {selectedEntry.params.retractSpeed?.value1 && (
                                <div>Retracao: {selectedEntry.params.retractSpeed.value1} / {selectedEntry.params.retractSpeed.value2}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => {
                      setSelectedEntry(null);
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GalleryModal;
