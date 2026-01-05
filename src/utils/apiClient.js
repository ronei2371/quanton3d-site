// =====================================================
// API CLIENT - BLINDADO (CORREÇÃO DE TELA BRANCA)
// =====================================================

// 1. Lógica inteligente para limpar a URL duplicada
const rawUrl = (import.meta.env.VITE_API_URL || "https://quanton3d-bot-v2.onrender.com/api");

// Remove qualquer /api do final ou barras extras e adiciona um único /api limpo
const API_BASE_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "") + "/api";

console.log("🚀 [API] Conectando em:", API_BASE_URL);

// Gerenciador de Token (Admin)
class TokenManager {
  constructor() { this.tokenKey = "quanton3d_admin_token"; }
  getToken() { return localStorage.getItem(this.tokenKey); }
  setToken(token) { localStorage.setItem(this.tokenKey, token); }
  removeToken() { localStorage.removeItem(this.tokenKey); }
  isAuthenticated() { return !!this.getToken(); }
}
const tokenManager = new TokenManager();

// =====================================================
// FUNÇÕES SEGURAS (COM TRY/CATCH PARA NÃO CRASHAR)
// =====================================================

async function getResins() {
  try {
    // Remove o /api para chamar a rota pública /resins (compatibilidade)
    const publicUrl = API_BASE_URL.replace('/api', ''); 
    const response = await fetch(`${publicUrl}/resins`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.resins || [];
  } catch (error) {
    console.warn("⚠️ [API] Falha ao buscar resinas (Site não vai travar):", error);
    return []; // Retorna lista vazia em vez de quebrar o site
  }
}

async function sendMessage(message, sessionId, additionalData = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId, ...additionalData }),
    });
    return await response.json();
  } catch (error) {
    console.error("❌ [API] Erro no chat:", error);
    return { success: false, response: "Erro de conexão. Tente novamente." };
  }
}

// Funções do Admin (Protegidas)
async function adminLogin(password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  
  const data = await response.json();
  if (data.token) tokenManager.setToken(data.token);
  return data;
}

// Exportação Segura
export { 
  getResins, 
  sendMessage, 
  adminLogin, 
  tokenManager,
  API_BASE_URL 
};

// Compatibilidade com window (para debug)
window.apiClient = { getResins, sendMessage, API_BASE_URL };
