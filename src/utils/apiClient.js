// =====================================================
// API CLIENT - BLINDADO V2 (COM EXPORT DEFAULT)
// =====================================================

// 1. Limpeza Inteligente de URL (Evita o erro /api/api)
const rawUrl = (import.meta.env.VITE_API_URL || "https://quanton3d-bot-v2.onrender.com/api");
const API_BASE_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "") + "/api";

console.log("🚀 [API] Conectando em:", API_BASE_URL);

// Gerenciador de Token
class TokenManager {
  constructor() { this.tokenKey = "quanton3d_admin_token"; }
  getToken() { return localStorage.getItem(this.tokenKey); }
  setToken(token) { localStorage.setItem(this.tokenKey, token); }
  removeToken() { localStorage.removeItem(this.tokenKey); }
  isAuthenticated() { return !!this.getToken(); }
}
export const tokenManager = new TokenManager();

// =====================================================
// FUNÇÕES SEGURAS (TRY/CATCH)
// =====================================================

export async function getResins() {
  try {
    // Tira o /api para chamar a rota publica /resins
    const publicUrl = API_BASE_URL.replace('/api', ''); 
    const response = await fetch(`${publicUrl}/resins`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.resins || [];
  } catch (error) {
    console.warn("⚠️ [API] Falha leve ao buscar resinas:", error);
    return []; 
  }
}

export async function sendMessage(message, sessionId, additionalData = {}) {
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

export async function sendMessageWithImage({ image, message, model, sessionId }) {
  try {
    const formData = new FormData();
    if (image) {
      formData.append("image", image);
    }
    formData.append("message", message || "");
    formData.append("model", model || "");
    if (sessionId) {
      formData.append("sessionId", sessionId);
    }

    const response = await fetch(`${API_BASE_URL}/ask-with-image`, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("❌ [API] Erro no envio de imagem:", error);
    return { success: false, response: "Erro de conexão. Tente novamente." };
  }
}

export async function adminLogin(password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (data.token) tokenManager.setToken(data.token);
    return data;
  } catch (e) {
    return { success: false, error: "Erro de conexão" };
  }
}

// OBJETO FINAL PARA COMPATIBILIDADE (Isso evita a Tela Branca)
const apiClient = {
  getResins,
  sendMessage,
  sendMessageWithImage,
  adminLogin,
  tokenManager,
  API_BASE_URL
};

export default apiClient;
