// quanton3d-site/src/components/AdminPanel.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Input, Button } from './ui'; // ajuste imports conforme seu projeto (ou substitua por HTML simples)
import AuthWrapper from './AuthWrapper'; // se existir
// NOTE: ajuste os imports UI conforme seu repo real

// Helper: monta URL base de API sem duplicar /api
function buildAdminUrl(base, path) {
  // prefer env var, fallback para window global
  let resolvedBase = base || window.__API_BASE__ || import.meta.env.VITE_API_URL || '';
  // remove sufixos / e /api
  resolvedBase = String(resolvedBase).replace(/\/+$/, '').replace(/\/api$/i, '');
  // garante que path começa com '/'
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${resolvedBase}/api${p}`;
}

// token helper (armazene token no state ou localStorage conforme seu fluxo)
function getStoredToken() {
  return localStorage.getItem('admin_token') || '';
}
function storeToken(t) {
  if (t) localStorage.setItem('admin_token', t);
  else localStorage.removeItem('admin_token');
}

export function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getStoredToken());
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAdvancedLogin, setShowAdvancedLogin] = useState(false);
  const [customApiBaseInput, setCustomApiBaseInput] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [apiBase, setApiBase] = useState(import.meta.env.VITE_API_URL || '');
  const [photos, setPhotos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [formulations, setFormulations] = useState([]);
  const [activeTab, setActiveTab] = useState('params'); // params | messages | gallery | formulations

  // se VITE_ADMIN_USERNAME definido, escondemos campo usuário
  const defaultAdminUsername = import.meta.env.VITE_ADMIN_USERNAME || '';
  const hasAutoUser = Boolean(defaultAdminUsername);

  useEffect(() => {
    if (customApiBaseInput) setApiBase(customApiBaseInput);
  }, [customApiBaseInput]);

  useEffect(() => {
    if (isAuthenticated) {
      // carrega dados da aba ativa
      if (activeTab === 'params') loadParams();
      if (activeTab === 'messages') loadMessages();
      if (activeTab === 'gallery') loadGallery();
      if (activeTab === 'formulations') loadFormulations();
    }
  }, [isAuthenticated, activeTab, apiBase]);

  function debugLog(...args) {
    // deixe logs controláveis
    if (import.meta.env.DEV) console.debug('[AdminPanel]', ...args);
  }

  async function handleLogin() {
    try {
      setLoading(true);
      const payload = {
        username: hasAutoUser ? defaultAdminUsername : username,
        password,
        secret: adminSecret || undefined,
      };
      const url = buildAdminUrl(apiBase, '/auth/login');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Login falhou');
      const token = json.token || json.accessToken || '';
      storeToken(token);
      setIsAuthenticated(true);
      setLoading(false);
      debugLog('login ok', json);
    } catch (err) {
      setLoading(false);
      alert('Falha no login: ' + err.message);
      debugLog('login erro', err);
    }
  }

  async function callApi(path, opts = {}) {
    const token = getStoredToken();
    const url = buildAdminUrl(apiBase, path);
    const headers = opts.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    debugLog('callApi', url, opts.method || 'GET');
    const res = await fetch(url, { ...opts, headers });
    if (res.status === 401) {
      // token inválido ou expirado
      storeToken('');
      setIsAuthenticated(false);
      throw new Error('Não autorizado (401) — faça login novamente.');
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || `Erro ${res.status}`);
    return json;
  }

  // refresh button handler que atualiza conforme aba ativa
  async function handleRefresh() {
    try {
      if (!isAuthenticated) return;
      if (activeTab === 'params') await loadParams();
      if (activeTab === 'messages') await loadMessages();
      if (activeTab === 'gallery') await loadGallery();
      if (activeTab === 'formulations') await loadFormulations();
    } catch (err) {
      console.error('refresh erro', err);
      alert('Erro ao atualizar: ' + err.message);
    }
  }

  // loaders mínimos - ajustar endpoints conforme backend real
  async function loadParams() {
    try {
      const res = await callApi('/params/resins');
      // adapte a maneira de apresentar
      debugLog('params', res);
    } catch (err) {
      console.error('loadParams', err);
    }
  }
  async function loadMessages() {
    try {
      const res = await callApi('/contacts?limit=200');
      setMessages(res.items || res || []);
    } catch (err) {
      console.error('loadMessages', err);
    }
  }
  async function loadFormulations() {
    try {
      const res = await callApi('/orders?limit=200');
      setFormulations(res.items || res || []);
    } catch (err) {
      console.error('loadFormulations', err);
    }
  }
  async function loadGallery() {
    try {
      const res = await callApi('/gallery?limit=200');
      // garanta que cada item tenha _id
      const items = Array.isArray(res) ? res : res.items || [];
      setPhotos(items);
    } catch (err) {
      console.error('loadGallery', err);
    }
  }

  // InternalGalleryTab actions
  async function handleDeletePhoto(id) {
    if (!confirm('Tem certeza que deseja deletar esta foto permanentemente?')) return;
    try {
      const res = await callApi(`/gallery/${id}`, { method: 'DELETE' });
      if (res && res.ok) {
        // remove do estado imediatamente
        setPhotos((prev) => prev.filter((p) => String(p._id || p.id) !== String(id)));
        alert('Foto deletada com sucesso.');
        debugLog('delete ok', id, res);
      } else {
        alert('Resposta inesperada: ' + JSON.stringify(res));
      }
    } catch (err) {
      console.error('handleDeletePhoto', err);
      alert('Erro ao deletar: ' + err.message);
    }
  }

  async function handleApprovePhoto(id) {
    try {
      const res = await callApi(`/gallery/${id}/approve`, { method: 'POST' });
      if (res && res.ok) {
        // atualizar item no estado
        setPhotos((prev) => prev.map((p) => (String(p._id || p.id) === String(id) ? { ...p, approved: true } : p)));
        alert('Foto aprovada.');
        debugLog('approve ok', id, res);
      } else {
        alert('Resposta inesperada: ' + JSON.stringify(res));
      }
    } catch (err) {
      console.error('handleApprovePhoto', err);
      alert('Erro ao aprovar: ' + err.message);
    }
  }

  // InternalGalleryTab component (simples)
  function InternalGalleryTab() {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Galeria</h3>
          <Button onClick={handleRefresh}>Atualizar</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {photos.length === 0 && <p>Nenhuma foto</p>}
          {photos.map((p) => {
            const id = p._id || p.id;
            return (
              <div key={id} className="border p-2 rounded">
                <img src={p.url || p.image || '/placeholder.png'} alt={p.title || 'foto'} className="w-full h-40 object-cover mb-2" />
                <div className="flex gap-2">
                  <Button onClick={() => handleApprovePhoto(id)} className="flex-1">Aprovar</Button>
                  <Button onClick={() => handleDeletePhoto(id)} className="flex-1">Deletar</Button>
                </div>
                <div className="text-xs mt-1">{p.approved ? 'Aprovada' : 'Pendente'}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // UI principal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold text-center mb-4">Painel Administrativo</h2>

          <div className="space-y-3">
            {!hasAutoUser && (
              <Input placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
            )}
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="flex gap-2">
              <Button onClick={handleLogin} disabled={loading || !password} className="flex-1">
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button onClick={() => setShowAdvancedLogin((s) => !s)} className="text-sm">Opções</Button>
            </div>

            {showAdvancedLogin && (
              <div className="p-2 border rounded text-xs space-y-2">
                <Input placeholder="URL Backend (opcional)" value={customApiBaseInput} onChange={(e) => setCustomApiBaseInput(e.target.value)} />
                <Input placeholder="Secret (opcional)" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // painel autenticado
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <Button onClick={() => { storeToken(''); setIsAuthenticated(false); }}>Logout</Button>
          <Button onClick={handleRefresh}>Atualizar</Button>
        </div>
      </div>

      <div className="mb-4">
        <button onClick={() => setActiveTab('params')} className={`mr-2 ${activeTab==='params'?'font-bold':''}`}>Parâmetros</button>
        <button onClick={() => setActiveTab('messages')} className={`mr-2 ${activeTab==='messages'?'font-bold':''}`}>Mensagens</button>
        <button onClick={() => setActiveTab('gallery')} className={`mr-2 ${activeTab==='gallery'?'font-bold':''}`}>Galeria</button>
        <button onClick={() => setActiveTab('formulations')} className={`mr-2 ${activeTab==='formulations'?'font-bold':''}`}>Formulações</button>
      </div>

      <div>
        {activeTab === 'params' && <div>Parâmetros (implemente visualização conforme sua UI)</div>}
        {activeTab === 'messages' && (
          <div>
            <h3>Mensagens</h3>
            <div>{messages.length === 0 ? 'Nenhuma' : messages.map(m => <div key={m._id || m.id}>{m.name || m.email || m.message}</div>)}</div>
          </div>
        )}
        {activeTab === 'gallery' && <InternalGalleryTab />}
        {activeTab === 'formulations' && (
          <div>
            <h3>Formulações</h3>
            <div>{formulations.length === 0 ? 'Nenhuma' : formulations.map(f => <div key={f._id || f.id}>{f.title || JSON.stringify(f)}</div>)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
