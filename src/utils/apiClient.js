// =====================================================
// API CLIENT - JWT + COMPATIBILIDADE (EXPORT DEFAULT)
// =====================================================

const normalizeApiBaseUrl = (rawUrl) => {
  const base = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!base) return 'https://quanton3d-bot-v2.onrender.com/api';
  return base.endsWith('/api') ? base : `${base}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com/api');
const PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// Token helpers
const TOKEN_KEY = 'quanton3d_jwt_token';
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(TOKEN_KEY);

// fetch com JWT e limpeza em caso de 401
export const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const isAbsolute = /^https?:\/\//i.test(url);
  const fullUrl = isAbsolute ? url : `${API_BASE_URL}${url}`;

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, { ...options, headers });

    if (response.status === 401) {
      removeAuthToken();
    }

    return response;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// Adaptadores esperados pelo site
export async function sendMessage(message, sessionId) {
  const response = await fetchWithAuth('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });

  return response.json();
}

export async function getResins() {
  try {
    const response = await fetch(`${PUBLIC_BASE_URL}/resins`, { method: 'GET' });
    if (!response.ok) return [];
    const data = await response.json();
    return data.resins || [];
  } catch (error) {
    console.warn('⚠️ [API] Falha leve ao buscar resinas:', error);
    return [];
  }
}

export async function adminLogin(password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (error) {
    console.error('Erro ao autenticar administrador:', error);
    return { success: false, error: 'Erro de conexão' };
  }
}

// OBJETO FINAL PARA COMPATIBILIDADE
const apiClient = {
  API_BASE_URL,
  PUBLIC_BASE_URL,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  tokenManager: {
    getToken: getAuthToken,
    setToken: setAuthToken,
    removeToken: removeAuthToken,
    isAuthenticated: () => Boolean(getAuthToken()),
  },
  fetchWithAuth,
  sendMessage,
  getResins,
  adminLogin,
};

export default apiClient;
