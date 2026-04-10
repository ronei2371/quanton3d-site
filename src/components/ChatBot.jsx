// Arquivo: quanton3d-site/src/components/ChatBot.jsx
// (Código com correção de caminho do robot-icon.png)

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Mic, Lightbulb, ChevronsUpDown, User, BrainCircuit, ImagePlus, RefreshCcw, MessageSquarePlus, Copy, ThumbsUp, ThumbsDown, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import robotIcon from '../assets/robot-icon.png'; // <-- LINHA DELETADA (A QUE CAUSAVA O ERRO)

// URL do backend - usa variavel de ambiente ou fallback para producao
const normalizeApiUrl = (rawUrl) => {
  const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) return 'https://quanton3d-bot-v2.onrender.com/api';
  return trimmed.endsWith('/api') ? trimmed : trimmed + '/api';
};

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com/api');
const PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// ✅ CORREÇÃO: Trocando /ask por /chat em ambas as listas
const ASK_ENDPOINTS = Array.from(new Set([`${API_BASE_URL}/chat`, `${PUBLIC_BASE_URL}/chat`]));
const ASK_IMAGE_ENDPOINTS = Array.from(new Set([`${API_BASE_URL}/chat`, `${PUBLIC_BASE_URL}/chat`]));

const REGISTER_ENDPOINT = `${API_BASE_URL}/register-user`;
const SUGGESTION_ENDPOINT = `${API_BASE_URL}/suggest-knowledge`;
const CHAT_MODEL = (import.meta.env.VITE_CHAT_MODEL || '').trim() || null;
const STORAGE_KEY = 'quanton3d-chat-state';
const initialUserData = { name: '', phone: '', email: '', resin: '', problemType: '' };
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) return resolve(null);
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const getInitialMessageText = (mode) => {
  if (mode === 'suporte') {
    return 'Olá! Sou o QuantonBot3D IA. Como posso ajudar com seu problema técnico ou dúvida sobre resinas?';
  }
  if (mode === 'vendas') {
    return 'Olá! Você está no modo "Vendas e Produtos". Posso ajudar a encontrar a resina ideal ou falar sobre nossos produtos?';
  }
  return 'Olá! Sou o QuantonBot3D. Como posso ajudar?';
};

export function ChatBot({ isOpen, setIsOpen, mode = 'suporte', userProfile = null, showInternalActions = false, onImproveKnowledge = () => {}, onConversationSnapshot = () => {} }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionImage, setSuggestionImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const suggestionFileInputRef = useRef(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [userData, setUserData] = useState(initialUserData);
  const [userRegistered, setUserRegistered] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const hasExternalProfile = Boolean(userProfile && (userProfile.email || userProfile.phone));
  // Estado para armazenar ultima pergunta e resposta (para enviar nas sugestoes)
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [lastBotReply, setLastBotReply] = useState('');
  const [feedbackPrompt, setFeedbackPrompt] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [suggestionMode, setSuggestionMode] = useState('improve');
  const [hasReceivedFirstReply, setHasReceivedFirstReply] = useState(false);
  
  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);
  const initializedRef = useRef(false);
  const persistTimeoutRef = useRef(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Define a mensagem inicial com base no modo e restaura conversas salvas
  useEffect(() => {
    if (initializedRef.current) return;

    const restored = (() => {
      if (typeof window === 'undefined') return false;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return false;
        const parsed = JSON.parse(stored);
        setMessages(parsed?.messages?.length ? parsed.messages : [{ id: 1, sender: 'bot', text: getInitialMessageText(mode) }]);
        setUserData({ ...initialUserData, ...(parsed?.userData || {}) });
        setUserRegistered(Boolean(parsed?.userRegistered));
        setShowUserForm(Boolean(parsed?.showUserForm));
        setShowWelcomeScreen(Boolean(parsed?.showWelcomeScreen));
        setLastUserMessage(parsed?.lastUserMessage || '');
        setLastBotReply(parsed?.lastBotReply || '');
        setShowSuggestion(Boolean(parsed?.showSuggestion));
        setSuggestionText(parsed?.suggestionText || '');
        setError(parsed?.error || null);
        setHasReceivedFirstReply(Boolean(parsed?.hasReceivedFirstReply));
        if (parsed?.sessionId) {
          setSessionId(parsed.sessionId);
        }
        return true;
      } catch (err) {
        console.error('Erro ao restaurar conversa salva:', err);
        return false;
      }
    })();

    if (!restored) {
      setMessages([{ id: 1, sender: 'bot', text: getInitialMessageText(mode) }]);
    }
    initializedRef.current = true;
  }, [mode, userRegistered, hasExternalProfile, setSessionId]);

  useEffect(() => {
    if (hasExternalProfile) {
      setUserData((prev) => ({ ...prev, ...userProfile }));
      setUserRegistered(true);
      setShowUserForm(false);
    }
  }, [hasExternalProfile, userProfile]);

  useEffect(() => {
    if (!hasReceivedFirstReply || userRegistered || hasExternalProfile) return;
    setShowUserForm(true);
  }, [hasReceivedFirstReply, userRegistered, hasExternalProfile]);

  useEffect(() => {
    if (typeof window === 'undefined' || !initializedRef.current) return;
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
    const stateToPersist = {
      messages,
      userData,
      userRegistered,
      showUserForm,
      showWelcomeScreen,
      lastUserMessage,
      lastBotReply,
      sessionId,
      mode,
      showSuggestion,
      suggestionText,
      error,
      hasReceivedFirstReply
    };
    persistTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
      } catch (err) {
        console.error('Erro ao salvar conversa localmente:', err);
      }
    }, 300);
    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [
    messages,
    userData,
    userRegistered,
    showUserForm,
    showWelcomeScreen,
    lastUserMessage,
    lastBotReply,
    sessionId,
    mode,
    showSuggestion,
    suggestionText,
    error
  ]);

  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = setTimeout(() => setFeedbackMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  useEffect(() => () => {
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
  }, []);


  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen || showUserForm || showWelcomeScreen) return;
    const focusInput = () => inputRef.current?.focus();
    const focusId = window.requestAnimationFrame(focusInput);
    return () => window.cancelAnimationFrame(focusId);
  }, [isOpen, showUserForm, showWelcomeScreen]);

  useEffect(() => {
    if (!isOpen || showUserForm || showWelcomeScreen || isLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.sender !== 'bot') return;
    const focusId = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(focusId);
  }, [messages, isLoading, isOpen, showUserForm, showWelcomeScreen]);

  const callChatApi = async (payload, hasImage = false) => {
    let lastError = new Error('Chat indisponível no momento.');
    const targets = hasImage ? ASK_IMAGE_ENDPOINTS : ASK_ENDPOINTS;

    for (const endpoint of targets) {
      try {
        const response = await fetch(
          endpoint,
          hasImage
            ? {
                method: 'POST',
                body: payload,
              }
            : {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              }
        );

        if (!response.ok) {
          let errorMsg = 'Ocorreu um erro ao conectar com a IA.';
          try {
            const errorPayload = await response.json();
            if (typeof errorPayload?.message === 'string') {
              errorMsg = errorPayload.message;
            } else if (typeof errorPayload?.error === 'string') {
              errorMsg = errorPayload.error;
            }
          } catch {
            // Mantém a mensagem padrão quando não há JSON válido.
          }

          if (response.status === 400) {
            errorMsg = errorMsg || '⚠️ Não foi possível validar a solicitação. Verifique os dados enviados.';
          } else if (response.status === 429) {
            errorMsg = '⚠️ Muitas mensagens enviadas! Por favor, aguarde um momento antes de enviar novamente.';
          } else if (response.status === 503) {
            errorMsg = '⚠️ Servidor temporiamente ocupado. Tente novamente em alguns segundos.';
          } else if (response.status === 500) {
            errorMsg = '⚠️ Erro no servidor. Nossa equipe foi notificada. Tente novamente em instantes.';
          }
          lastError = new Error(errorMsg);
          continue;
        }

        return await response.json();
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;
    
    // Após a primeira resposta, exigimos cadastro para continuar
    if (hasReceivedFirstReply && !userRegistered && !hasExternalProfile) {
      setShowUserForm(true);
      setError('Antes de continuar, informe seu nome e telefone.');
      return;
    }
    
    const userMessage = { 
      id: Date.now(), 
      sender: 'user', 
      text: inputValue || '📷 Imagem enviada',
      image: selectedImage ? URL.createObjectURL(selectedImage) : null
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null); // Limpar erro anterior
    
    try {
      const messageText = inputValue || (selectedImage ? 'Analise esta imagem' : '');
      let data;

      if (selectedImage) {
        const formData = new FormData();
        formData.append('message', messageText);
        formData.append('sessionId', sessionId);
        formData.append('image', selectedImage);
        formData.append('model', CHAT_MODEL || '');

        data = await callChatApi(formData, true);
        setSelectedImage(null);
      } else {
        data = await callChatApi({
          message: messageText,
          sessionId,
          ...(CHAT_MODEL ? { model: CHAT_MODEL } : {}),
        });
      }

      const botText = data.reply || data.response || 'Não consegui processar sua resposta.';
      const botMessage = { id: Date.now() + 1, sender: 'bot', text: botText };
      setMessages((prev) => [...prev, botMessage]);
      setFeedbackPrompt({ messageId: botMessage.id });
      setFeedbackMessage('');
      
      setLastUserMessage(userMessage.text);
      setLastBotReply(botText);
      if (!hasReceivedFirstReply) {
        setHasReceivedFirstReply(true);
      }
      onConversationSnapshot({ user: userMessage.text, bot: botText });
    } catch (error) {
      console.error('Erro na API:', error);
      
      // Definir erro no estado para exibir componente de erro
      setError(error.message || 'Erro ao processar sua mensagem.');
      
      // Também adicionar mensagem de erro no chat
      const errorMessage = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: error.message || 'Ocorreu um erro ao conectar com a IA. Tente novamente em instantes.',
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
      setFeedbackPrompt(null);
      
      // Limpar erro após 5 segundos
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSuggestionImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSuggestionImage(file);
    }
  };

  const resetConversation = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    setMessages([{ id: Date.now(), sender: 'bot', text: getInitialMessageText(mode) }]);
    setUserData(initialUserData);
    setUserRegistered(false);
    setHasReceivedFirstReply(false);
    setShowUserForm(false);
    setShowWelcomeScreen(false);
    setSelectedImage(null);
    setSuggestionImage(null);
    setShowSuggestion(false);
    setSuggestionText('');
    setError(null);
    setLastUserMessage('');
    setLastBotReply('');
    setFeedbackPrompt(null);
    setFeedbackHistory({});
    setFeedbackMessage('');
    setSuggestionMode('improve');
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error('Erro ao limpar conversa local:', err);
      }
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    if (!userData.name?.trim() || !userData.phone?.trim()) {
      alert('Por favor, informe nome e telefone.');
      return;
    }
    
    const normalizedName = userData.name.trim();
    const normalizedPhone = userData.phone.trim();
    const normalizedEmail = userData.email?.trim() || `${sessionId}@lead.quanton3d`;
    const phoneDigits = normalizedPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setPhoneError('Telefone invalido. Informe um numero com DDD (minimo 10 digitos).');
      return;
    }
    setPhoneError('');
    
    try {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: normalizedName,
          phone: normalizedPhone,
          email: normalizedEmail,
          resin: userData.resin || null,
          problemType: userData.problemType || null,
          sessionId
        }),
      });
      
      if (response.ok) {
        setUserRegistered(true);
        setShowUserForm(false);
        setShowWelcomeScreen(true); // Mostrar tela de boas-vindas
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
    }
  };

  const copyLastMessages = () => {
    if (!lastUserMessage && !lastBotReply) {
      alert('Ainda não existe conversa para copiar. Faça uma pergunta primeiro.');
      return;
    }
    const textToCopy = [`Pergunta do cliente: ${lastUserMessage || '(vazia)'}`, `Resposta do bot: ${lastBotReply || '(vazia)'}`].join('\n\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setError(null);
    }).catch(() => {
      alert('Não consegui copiar automaticamente. Pode selecionar o texto manualmente.');
    });
  };

  const handleSuggestionSubmit = async () => {
    if (!suggestionText.trim() || isLoading) {
      alert('Por favor, descreva sua sugestão.');
      return;
    }

    if (!lastUserMessage && !lastBotReply) {
      alert('Por favor, faça uma pergunta primeiro antes de enviar uma sugestão de correção.');
      return;
    }
    
    setIsLoading(true);
    try {
      const attachment = suggestionImage ? await fileToDataUrl(suggestionImage) : null;

      const payload = {
        suggestion: suggestionText,
        userName: userData?.name || 'Usuario do Site',
        userPhone: userData?.phone || null,
        sessionId,
        lastUserMessage,
        lastBotReply,
        attachment,
        mode: suggestionMode
      };
      
      const response = await fetch(SUGGESTION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { throw new Error('Não foi possível enviar sua sugestão.'); }
      const data = await response.json();
      alert(data.message || 'Obrigado! Sua sugestão foi enviada.');
      setSuggestionText('');
      setSuggestionImage(null);
      setShowSuggestion(false);
      setSuggestionMode('improve');
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackAction = (action) => {
    if (!feedbackPrompt?.messageId) return;
    setFeedbackHistory((prev) => ({ ...prev, [feedbackPrompt.messageId]: action }));

    if (action === 'approve') {
      setFeedbackMessage('✅ Obrigado! Vamos considerar esta conversa resolvida.');
    } else if (action === 'reject') {
      setFeedbackMessage('⚠️ Vamos melhorar essa resposta. Conte o que faltou.');
      setSuggestionMode('improve');
      setShowSuggestion(true);
      setSuggestionText('');
      setSuggestionImage(null);
    } else if (action === 'complement') {
      setFeedbackMessage('➕ Adicione mais detalhes para continuarmos te ajudando.');
      setSuggestionMode('complement');
      setShowSuggestion(true);
      setSuggestionText('');
      setSuggestionImage(null);
      if (showInternalActions && typeof onImproveKnowledge === 'function') {
        onImproveKnowledge();
      }
    }

    setFeedbackPrompt(null);
  };


  if (!isOpen) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 right-0 md:bottom-8 md:right-8 w-full h-full md:w-[520px] md:h-[85vh] md:max-h-[850px] shadow-2xl rounded-lg flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-700 to-purple-700 text-white flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-3">
          {/* ===== LINHA CORRIGIDA (caminho público) ===== */}
          <img src="/assets/robot-icon.png" alt="Bot" className="h-8 w-8" />
          <div>
            <h3 className="font-bold">Quanton3D IA</h3>
            <p className="text-xs opacity-80">Assistente Virtual GPT</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetConversation}
            className="px-3 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-lg border border-white/20 flex items-center gap-2 transition-all"
          >
            <RefreshCcw size={14} /> Nova conversa
          </button>
          <button onClick={toggleOpen} className="text-white opacity-70 hover:opacity-100">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tela de Boas-Vindas */}
      <AnimatePresence>
        {showWelcomeScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center"
            >
              <motion.img
                src="/robot-welcome-quanton.png"
                alt="Quanton3D 24/7 com você"
                className="w-full max-w-md mx-auto mb-6 rounded-lg shadow-lg"
                animate={{ 
                  scale: [1, 1.02, 1],
                  opacity: [0.95, 1, 0.95]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bem-vindo(a), {userData.name}! 🎉
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Obrigado por escolher a <span className="font-bold text-purple-600">Quanton3D</span>! 
                Estou aqui para te ajudar com tudo sobre impressão 3D e resinas UV.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  💡 <strong>Dica:</strong> Pergunte sobre resinas, troubleshooting, parâmetros de impressão ou qualquer dúvida técnica!
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowWelcomeScreen(false);
                  const botMessage = { 
                    id: Date.now(), 
                    sender: 'bot', 
                    text: `Olá ${userData.name}! Estou pronto para te ajudar. Como posso te auxiliar hoje?` 
                  };
                  setMessages((prev) => [...prev, botMessage]);
                }}
                className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg"
              >
                🚀 Começar Agora!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Cadastro de Usuário */}
      <AnimatePresence>
        {showUserForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl max-w-md w-full relative"
            >
              {/* Botão X para fechar */}
              <button
                onClick={() => setShowUserForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                type="button"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                👋 Olá! Vamos nos conhecer?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Para te atender melhor, por favor preencha seus dados:
              </p>
              <form onSubmit={handleUserFormSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <div>
                  <input
                    type="tel"
                    placeholder="Seu telefone (com DDD)"
                    value={userData.phone}
                    onChange={(e) => {
                      setUserData({ ...userData, phone: e.target.value });
                      setPhoneError(''); // Limpar erro ao digitar
                    }}
                    className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${phoneError ? 'border-red-500 border-2' : ''}`}
                    required
                  />
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                  )}
                </div>
                <input
                  type="email"
                  placeholder="Seu e-mail (opcional)"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <select
                  value={userData.problemType || ''}
                  onChange={(e) => setUserData({ ...userData, problemType: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Qual o seu problema? (opcional)</option>
                  <option value="Adesao">Adesão na plataforma</option>
                  <option value="Configuracao">Configuração de parâmetros</option>
                  <option value="Qualidade">Qualidade da impressão</option>
                  <option value="Problema de LCD / Tela">Problema de LCD / Tela</option>
                  <option value="Resina">Dúvida sobre resina</option>
                  <option value="Outro">Outro problema</option>
                </select>
                <select
                  value={userData.resin}
                  onChange={(e) => setUserData({ ...userData, resin: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Qual resina você utiliza? (opcional)</option>
                  <option value="Pyroblast+">Pyroblast+</option>
                  <option value="Iron">Iron</option>
                  <option value="Iron 7030">Iron 7030</option>
                  <option value="Spin+">Spin+</option>
                  <option value="Spark">Spark</option>
                  <option value="FlexForm">FlexForm</option>
                  <option value="Castable">Castable</option>
                  <option value="Low Smell">Low Smell</option>
                  <option value="Spare">Spare</option>
                  <option value="ALCHEMIST">ALCHEMIST</option>
                  <option value="POSEIDON">POSEIDON</option>
                  <option value="RPG">RPG</option>
                  <option value="Athon ALINHADORES">Athon ALINHADORES</option>
                  <option value="Athon DENTAL">Athon DENTAL</option>
                  <option value="Athon GENGIVA">Athon GENGIVA</option>
                  <option value="Athon WASHABLE">Athon WASHABLE</option>
                </select>
                <button
                  type="submit"
                  className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold"
                >
                  Enviar
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Area de Mensagens - Fundo com Circuitos (sem overlay para mostrar circuitos) */}
      <div 
        className="flex-1 p-4 overflow-y-auto space-y-4 relative"
        style={{ 
          minHeight: '400px',
          backgroundImage: 'url(/circuit-bg.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'local'
        }}
      >
        {/* Sem overlay - circuitos sempre visiveis */}
        <div className="space-y-4 relative z-10">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] shadow-md ${
                  msg.isError
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {msg.image && (
                  <img src={msg.image} alt="Imagem enviada" className="w-full rounded-lg mb-2" />
                )}
                {msg.isError && <span className="mr-2">⚠️</span>}
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800 shadow-md">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Quanton3D está pensando...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      {/* Botão de Sugestão (o "💡") */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        
        <AnimatePresence>
          {showSuggestion && (
             <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 mb-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-200">
                      {suggestionMode === 'complement' ? 'Complementar atendimento' : 'Sugerir novo conhecimento'}
                    </span>
                    {suggestionMode === 'complement' && (
                      <span className="text-[10px] text-yellow-600 dark:text-yellow-300">Compartilhe mais detalhes para continuarmos</span>
                    )}
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                    {suggestionMode === 'complement'
                      ? 'Conte o que ainda ficou faltando na resposta para que possamos complementar.'
                      : 'Descreva a informação que você gostaria que fosse adicionada.'}
                  </p>
                  <textarea
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                    rows={3}
                    placeholder="Ex: A resina X funciona bem com..."
                    disabled={isLoading}
                  />

                  <div>
                    <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      {suggestionMode === 'complement' ? 'Envie uma imagem (opcional)' : 'Anexe uma foto do problema'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      ref={suggestionFileInputRef}
                      onChange={handleSuggestionImageSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => suggestionFileInputRef.current?.click()}
                      className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md"
                      disabled={isLoading}
                    >
                      {suggestionImage ? 'Trocar foto' : 'Selecionar foto'}
                    </button>

                    {suggestionImage && (
                      <div className="mt-2 relative inline-block">
                        <img
                          src={URL.createObjectURL(suggestionImage)}
                          alt="Sugestão"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-yellow-500"
                        />
                        <button
                          type="button"
                          onClick={() => setSuggestionImage(null)}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                  <button 
                    onClick={() => {
                      setShowSuggestion(false)
                      setSuggestionImage(null)
                      setSuggestionMode('improve')
                    }}
                    className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 font-semibold shadow-md transition-all"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSuggestionSubmit}
                    className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 font-semibold shadow-md transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : '✨ Enviar Sugestão'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => {
            if (showSuggestion && suggestionMode === 'improve') {
              setShowSuggestion(false);
              setSuggestionImage(null);
              return;
            }
            setSuggestionMode('improve');
            setShowSuggestion(true);
          }}
          className={`flex items-center gap-2 text-xs mb-2 px-3 py-1.5 rounded-lg transition-all ${showSuggestion && suggestionMode === 'improve' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
        >
          <Lightbulb size={14} /> Sugerir Conhecimento <ChevronsUpDown size={14} />
        </button>

        {feedbackPrompt && !feedbackHistory[feedbackPrompt.messageId] && (
          <div className="mb-3 p-3 rounded-lg bg-blue-50 dark:bg-gray-700/40 border border-blue-200 dark:border-gray-600">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-200">
              Essa resposta ajudou?
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleFeedbackAction('approve')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow"
              >
                <ThumbsUp size={14} /> Aprovar
              </button>
              <button
                type="button"
                onClick={() => handleFeedbackAction('reject')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-red-500 text-white hover:bg-red-600 shadow"
              >
                <ThumbsDown size={14} /> Rejeitar
              </button>
              <button
                type="button"
                onClick={() => handleFeedbackAction('complement')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-purple-500 text-white hover:bg-purple-600 shadow"
              >
                <PlusCircle size={14} /> Complementar
              </button>
            </div>
          </div>
        )}

        {feedbackMessage && (
          <div className="mb-2 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[11px] text-blue-800 dark:text-blue-100 border border-blue-200 dark:border-blue-800">
            {feedbackMessage}
          </div>
        )}
        
        {/* Preview da imagem selecionada */}
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img 
              src={URL.createObjectURL(selectedImage)} 
              alt="Preview" 
              className="w-20 h-20 object-cover rounded-lg border-2 border-blue-500"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg hover:scale-110 transition-transform"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Mensagem de Erro */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <span className="text-red-500 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-600 dark:text-red-400 underline mt-1 hover:text-red-800 dark:hover:text-red-200"
                  >
                    Dispensar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showInternalActions && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              type="button"
              onClick={onImproveKnowledge}
              className="px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-2 shadow hover:scale-105"
            >
              <MessageSquarePlus size={14} /> Complementar conhecimento
            </button>
            <button
              type="button"
              onClick={copyLastMessages}
              className="px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-2"
            >
              <Copy size={12} /> Copiar conversa atual
            </button>
          </div>
        )}
        
        {/* Input de Chat */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-400 shadow-md transition-all hover:scale-105"
            disabled={isLoading}
          >
            <ImagePlus size={20} />
          </button>
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-all hover:scale-105 disabled:hover:scale-100"
            disabled={isLoading || (!inputValue.trim() && !selectedImage)}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </motion.div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
