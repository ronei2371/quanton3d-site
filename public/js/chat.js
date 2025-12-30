// ChatBot simples para páginas estáticas
// Usa a API do bot em https://quanton3d-bot-v2.onrender.com por padrão,
// mas você pode sobrescrever com window.CHAT_API_BASE antes de carregar este script.

const CHAT_API_BASE = (window.CHAT_API_BASE || 'https://quanton3d-bot-v2.onrender.com').replace(/\/$/, '');

const CONFIG = {
  API_URL: `${CHAT_API_BASE}/api/chat`,
  HEALTH_URL: `${CHAT_API_BASE}/health`,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
};

let conversationHistory = [];
let isConnected = false;
let retryCount = 0;

let chatMessages;
let chatInput;
let chatForm;
let statusIndicator;
let suggestionButtons;

document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  checkConnection();
  setupEventListeners();
  showWelcomeMessage();
});

function initializeElements() {
  chatMessages = document.getElementById('chat-messages');
  chatInput = document.getElementById('chat-input');
  chatForm = document.getElementById('chat-form');
  statusIndicator = document.getElementById('status-indicator');
  suggestionButtons = document.querySelectorAll('.suggestion-btn');
}

async function checkConnection() {
  try {
    updateStatus('Conectando...', 'connecting');

    const response = await fetch(CONFIG.HEALTH_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conectado ao servidor:', data);
      isConnected = true;
      retryCount = 0;
      updateStatus('Online', 'online');
    } else {
      throw new Error('Servidor retornou erro');
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
    isConnected = false;
    updateStatus('Desconectado', 'offline');

    if (retryCount < CONFIG.MAX_RETRIES) {
      retryCount += 1;
      setTimeout(checkConnection, CONFIG.RETRY_DELAY);
    } else {
      showErrorMessage('Não foi possível conectar ao servidor. Tente recarregar a página.');
    }
  }
}

function updateStatus(text, status) {
  if (!statusIndicator) return;

  statusIndicator.textContent = text;
  statusIndicator.className = `status-${status}`;
}

function setupEventListeners() {
  if (chatForm) {
    chatForm.addEventListener('submit', handleSubmit);
  }

  suggestionButtons?.forEach((btn) => {
    btn.addEventListener('click', () => {
      const suggestion = btn.textContent;
      chatInput.value = suggestion;
      handleSubmit(new Event('submit'));
    });
  });

  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });
}

async function handleSubmit(e) {
  e.preventDefault();

  const message = chatInput.value.trim();
  if (!message) return;

  if (!isConnected) {
    showErrorMessage('Sem conexão com o servidor. Tentando reconectar...');
    checkConnection();
    return;
  }

  chatInput.value = '';
  chatInput.focus();

  addMessage(message, 'user');

  const typingId = showTypingIndicator();

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
    });

    removeTypingIndicator(typingId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.details || 'Erro ao enviar mensagem');
    }

    const data = await response.json();

    addMessage(data.response, 'bot');

    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: data.response }
    );

    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
  } catch (error) {
    removeTypingIndicator(typingId);
    console.error('❌ Erro ao enviar mensagem:', error);

    showErrorMessage(
      error.message || 'Desculpe, ocorreu um erro. Tente novamente ou entre em contato: (31) 3271-6935'
    );
  }
}

function addMessage(text, type) {
  if (!chatMessages) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = type === 'user' ? '👤' : '🤖';

  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;

  const timestamp = document.createElement('div');
  timestamp.className = 'message-timestamp';
  timestamp.textContent = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (type === 'user') {
    messageDiv.appendChild(content);
    messageDiv.appendChild(avatar);
  } else {
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
  }

  content.appendChild(timestamp);
  chatMessages.appendChild(messageDiv);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const id = Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.id = `typing-${id}`;
  typingDiv.className = 'message message-bot typing-indicator';
  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  chatMessages?.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return id;
}

function removeTypingIndicator(id) {
  const element = document.getElementById(`typing-${id}`);
  element?.remove();
}

function showErrorMessage(text) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'message message-error';
  errorDiv.innerHTML = `
    <div class="message-avatar">⚠️</div>
    <div class="message-content">${text}</div>
  `;

  chatMessages?.appendChild(errorDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => errorDiv.remove(), 5000);
}

function showWelcomeMessage() {
  const welcomeText = `Olá! 👋 Sou o assistente virtual da Quanton3D.

Posso ajudar você com:
• Informações sobre nossas resinas UV
• Sugestões de produtos para sua aplicação
• Parâmetros de impressão
• Dúvidas técnicas

Como posso ajudar você hoje?`;

  setTimeout(() => addMessage(welcomeText, 'bot'), 500);
}

setInterval(() => {
  if (!isConnected) {
    checkConnection();
  }
}, 30000);

console.log('💬 ChatBot Quanton3D inicializado');
