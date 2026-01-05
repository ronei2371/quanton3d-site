// =====================================================
// API CLIENT - QUANTON3D FRONTEND
// Gerencia todas as chamadas ao backend com autenticação
// =====================================================

// Usa VITE_API_URL como prioridade; fallback para o backend v2
const API_BASE_URL =
  (typeof import !== "undefined" &&
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  "https://quanton3d-bot-v2.onrender.com/api";

// Gerenciador de token JWT
class TokenManager {
  constructor() {
    this.tokenKey = "quanton3d_admin_token";
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

const tokenManager = new TokenManager();

// =====================================================
// FUNÇÕES DE API - CHAT/BOT
// =====================================================

/**
 * Envia mensagem para o bot
 */
async function sendMessage(message, sessionId, additionalData = {}) {
  try {
    console.log("📤 [API] Enviando mensagem para o bot:", message);

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId, ...additionalData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [API] Erro na resposta:", response.status, errorText);
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ [API] Resposta recebida:", data);
    return data;
  } catch (error) {
    console.error("❌ [API] Erro ao enviar mensagem:", error);
    throw error;
  }
}

/**
 * Registra usuário do chat
 */
async function registerUser(userData) {
  try {
    console.log("📤 [API] Registrando usuário:", userData);

    const response = await fetch(`${API_BASE_URL}/register-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ [API] Usuário registrado:", data);
    return data;
  } catch (error) {
    console.error("❌ [API] Erro ao registrar usuário:", error);
    throw error;
  }
}

/**
 * Envia sugestão de conhecimento
 */
async function sendSuggestion(suggestionData) {
  try {
    console.log("📤 [API] Enviando sugestão:", suggestionData);

    const response = await fetch(`${API_BASE_URL}/suggest-knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suggestionData),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ [API] Sugestão enviada:", data);
    return data;
  } catch (error) {
    console.error("❌ [API] Erro ao enviar sugestão:", error);
    throw error;
  }
}

// =====================================================
// FUNÇÕES DE API - RESINAS (ROTA PÚBLICA)
// =====================================================

/**
 * Lista todas as resinas disponíveis
 */
async function getResins() {
  try {
    console.log("📤 [API] Buscando lista de resinas...");

    // Usa /api/resins (prefixo consistente)
    const response = await fetch(`${API_BASE_URL}/resins`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [API] Erro ao buscar resinas:", response.status, errorText);
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ [API] Resinas carregadas:", data.total || 0);
    return data.resins || [];
  } catch (error) {
    console.error("❌ [API] Erro ao buscar resinas:", error);
    return [];
  }
}

// =====================================================
// FUNÇÕES DE API - GALERIA
// =====================================================

/**
 * Lista itens da galeria pública
 */
async function getGallery(page = 1, limit = 12, category = null) {
  try {
    console.log("📤 [API] Buscando galeria...");

    let url = `${API_BASE_URL}/gallery?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ [API] Galeria carregada:", data.total || 0, "itens");
    return data;
  } catch (error) {
    console.error("❌ [API] Erro ao buscar galeria:", error);
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

/**
 * Envia item para galeria
 */
async function submitGalleryItem(itemData) {
  try {
    console.log("📤 [API] Enviando item para galeria:", itemData);

    const response = await fetch(`${API_BASE_URL}/gallery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ [API] Item enviado para galeria:", data);
    return data;
  } catch (error) {
    console.error("❌ [API] Erro ao enviar item para galeria:", error);
    throw error;
  }
}

// =====================================================
// FUNÇÕES DE API - CONTATO
// =====================================================

async function sendContact(contactData) {
  try {
    console.log("📤 [API] Enviando mensagem de contato:", contactData);

    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ [API] Mensagem de contato enviada:", data);
    return data;
  } catch (error) {
    console.error("❌ [API] Erro ao enviar mensagem de contato:", error);
    throw error;
  }
}

// =====================================================
// FUNÇÕES DE API - AUTENTICAÇÃO ADMIN
// =====================================================

async function adminLogin(password) {
  try {
    console.log("📤 [API] Tentando login admin...");

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Senha incorreta");
    }

    const data = await response.json();
    console.log("✅ [API] Login admin bem-sucedido");

    if (data.token) {
      tokenManager.setToken(data.token);
    }

    return data;
  } catch (error) {
    console.error("❌ [API] Erro no login admin:", error);
    throw error;
  }
}

async function verifyToken(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) return { valid: false };

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ [API] Erro ao verificar token:", error);
    return { valid: false };
  }
}

function adminLogout() {
  tokenManager.removeToken();
  console.log("✅ [API] Logout realizado");
}

// =====================================================
// FUNÇÕES DE API - ADMIN (PROTEGIDAS)
// =====================================================

async function authenticatedRequest(endpoint, options = {}) {
  const token = tokenManager.getToken();
  if (!token) throw new Error("Usuário não autenticado");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    tokenManager.removeToken();
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Health check
async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log("✅ [API] Health check:", data);
    return data;
  } catch (error) {
    console.error("❌ [API] Erro no health check:", error);
    return { status: "error", message: error.message };
  }
}

// =====================================================
// EXPORTAÇÕES
// =====================================================

window.apiClient = {
  // Chat/Bot
  sendMessage,
  registerUser,
  sendSuggestion,

  // Resinas
  getResins,

  // Galeria
  getGallery,
  submitGalleryItem,

  // Contato
  sendContact,

  // Auth
  adminLogin,
  verifyToken,
  adminLogout,
  isAuthenticated: () => tokenManager.isAuthenticated(),

  // Admin
  authenticatedRequest,

  // Utils
  healthCheck,

  // Config
  API_BASE_URL,
};

console.log("✅ [API] API Client inicializado com sucesso!");
console.log("📡 [API] Backend URL:", API_BASE_URL);
