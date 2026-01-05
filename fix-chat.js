// =====================================================
// INIT.JS - INICIALIZAÇÃO AUTOMÁTICA
// Carrega automaticamente quando o DOM estiver pronto
// =====================================================

(function() {
  'use strict';
  
  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('🚀 [INIT] Inicializando correções de chat...');
    
    const API_BASE_URL = 'https://quanton3d-bot-v2.onrender.com';
    
    // =====================================================
    // FUNÇÃO CORRIGIDA: Enviar Mensagem
    // =====================================================
    
    function getSessionId() {
      let sessionId = sessionStorage.getItem('quanton3d_session_id');
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('quanton3d_session_id', sessionId);
      }
      return sessionId;
    }
    
    async function sendChatMessage(message, additionalData = {}) {
      try {
        console.log('📤 [CHAT] Enviando:', message);
        
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            sessionId: getSessionId(),
            ...additionalData
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [CHAT] Erro HTTP:', response.status, errorText);
          throw new Error(`Erro ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ [CHAT] Resposta:', data);
        
        return {
          success: true,
          reply: data.reply || data.response || 'Sem resposta',
          data: data
        };
        
      } catch (error) {
        console.error('❌ [CHAT] Erro:', error);
        return {
          success: false,
          error: error.message,
          reply: 'Desculpe, ocorreu um erro. Tente novamente em instantes.'
        };
      }
    }
    
    // =====================================================
    // INTERCEPTAR TODOS OS EVENTOS DE ENVIO
    // =====================================================
    
    // Interceptar cliques no botão de enviar
    document.addEventListener('click', async function(e) {
      const target = e.target;
      
      // Verificar se é botão de enviar chat
      if (target.matches('[data-send-chat], .send-button, #send-btn, button[type="submit"]')) {
        console.log('🔧 [INIT] Interceptando envio de mensagem');
        e.preventDefault();
        e.stopPropagation();
        
        // Buscar input de mensagem
        const input = document.querySelector('[data-chat-input], .chat-input, #chat-input, input[type="text"]');
        if (!input || !input.value.trim()) {
          console.warn('⚠️ [INIT] Input de mensagem não encontrado ou vazio');
          return;
        }
        
        const message = input.value.trim();
        input.value = '';
        
        // Enviar mensagem
        const result = await sendChatMessage(message);
        
        // Exibir resposta (você pode customizar isso)
        if (result.success) {
          console.log('✅ [INIT] Resposta recebida:', result.reply);
          // Tentar encontrar área de chat para exibir
          const chatArea = document.querySelector('[data-chat-messages], .chat-messages, #chat-messages');
          if (chatArea) {
            // Adicionar mensagem do usuário
            const userMsg = document.createElement('div');
            userMsg.className = 'message user-message';
            userMsg.textContent = message;
            chatArea.appendChild(userMsg);
            
            // Adicionar resposta do bot
            const botMsg = document.createElement('div');
            botMsg.className = 'message bot-message';
            botMsg.textContent = result.reply;
            chatArea.appendChild(botMsg);
            
            // Scroll para o final
            chatArea.scrollTop = chatArea.scrollHeight;
          }
        } else {
          console.error('❌ [INIT] Erro ao enviar mensagem:', result.error);
          alert(result.reply);
        }
      }
    }, true); // Use capture phase
    
    // =====================================================
    // INTERCEPTAR ENVIOS DE FORMULÁRIO
    // =====================================================
    
    document.addEventListener('submit', async function(e) {
      const form = e.target;
      
      // Verificar se é formulário de chat
      if (form.matches('[data-chat-form], .chat-form, #chat-form')) {
        console.log('🔧 [INIT] Interceptando submit de formulário');
        e.preventDefault();
        e.stopPropagation();
        
        const input = form.querySelector('input[type="text"], textarea');
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        input.value = '';
        
        const result = await sendChatMessage(message);
        
        if (result.success) {
          console.log('✅ [INIT] Mensagem enviada com sucesso');
        } else {
          console.error('❌ [INIT] Erro:', result.error);
        }
      }
    }, true);
    
    // =====================================================
    // SOBRESCREVER FUNÇÕES GLOBAIS
    // =====================================================
    
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(() => {
      if (window.sendMessage) {
        console.log('🔧 [INIT] Sobrescrevendo window.sendMessage');
        window.sendMessage = sendChatMessage;
      }
      
      if (window.apiClient && window.apiClient.sendMessage) {
        console.log('🔧 [INIT] Sobrescrevendo apiClient.sendMessage');
        window.apiClient.sendMessage = sendChatMessage;
      }
      
      // Criar função global se não existir
      if (!window.sendMessage) {
        console.log('🔧 [INIT] Criando window.sendMessage');
        window.sendMessage = sendChatMessage;
      }
      
      console.log('✅ [INIT] Todas as correções aplicadas!');
      console.log('📡 [INIT] Backend:', API_BASE_URL);
    }, 1000);
  }
  
})();
