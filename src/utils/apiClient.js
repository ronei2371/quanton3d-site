/**
 * API Client com suporte a JWT
 * 
 * Funções auxiliares para fazer requisições autenticadas
 */

const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com'

/**
 * Pega o token JWT do localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('quanton3d_jwt_token')
}

/**
 * Verifica se usuário está autenticado
 */
export const isAuthenticated = () => {
  return !!getAuthToken()
}

/**
 * Faz requisição autenticada com JWT
 * 
 * @param {string} url - URL da API (relativa ou absoluta)
 * @param {object} options - Opções do fetch
 * @returns {Promise<Response>}
 */
export const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken()
  
  // Construir URL completa se for relativa
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  
  // Adicionar headers de autenticação
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // Fazer requisição
  const response = await fetch(fullUrl, {
    ...options,
    headers
  })
  
  // Se receber 401, token expirou - fazer logout
  if (response.status === 401) {
    localStorage.removeItem('quanton3d_jwt_token')
    window.location.reload() // Recarregar página para mostrar tela de login
  }
  
  return response
}

/**
 * GET autenticado
 */
export const authGet = async (url, params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  return fetchWithAuth(fullUrl, {
    method: 'GET'
  })
}

/**
 * POST autenticado
 */
export const authPost = async (url, data) => {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * PUT autenticado
 */
export const authPut = async (url, data) => {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * DELETE autenticado
 */
export const authDelete = async (url) => {
  return fetchWithAuth(url, {
    method: 'DELETE'
  })
}

/**
 * Constrói URL com query params (compatibilidade com código antigo)
 * Agora usa JWT ao invés de query param
 */
export const buildAdminUrl = (path, params = {}) => {
  const url = new URL(path, API_BASE_URL)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}
