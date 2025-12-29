import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Send, User, Bot, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'quanton3d_conv_v1';

export default function ChatBot({ mode = 'technical' }) {
  // --- Estados Corrigidos (Pai, adicionei os que faltavam aqui) ---
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [userRegistered, setUserRegistered] = useState(false);
  const [showUserForm, setShowUserForm] = useState(true);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [selectedImage, setSelectedImage] = useState(null); // Corrigido!
  const [suggestionText, setSuggestionText] = useState(''); // Corrigido!
  const [error, setError] = useState(null); // Corrigido!
  const [isTyping, setIsTyping] = useState(false);

  const initializedRef = useRef(false);

  // --- 1. Restauração Robusta (Evita que o site quebre se houver lixo no navegador) ---
  useEffect(() => {
    if (initializedRef.current) return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.messages)) {
          setMessages(parsed.messages);
          setUserData(parsed.userData || { name: '', email: '', phone: '' });
          setUserRegistered(!!parsed.userRegistered);
          setShowUserForm(!!parsed.showUserForm);
          if (parsed.sessionId) setSessionId(parsed.sessionId);
        }
      } else {
        // Mensagem inicial padrão se não houver nada salvo
        setMessages([{
          id: Date.now(),
          sender: 'bot',
          text: 'Olá! Sou o assistente técnico da Quanton3D. Como posso ajudar?'
        }]);
      }
    } catch (err) {
      console.error('Erro ao restaurar sessão:', err);
    }
    initializedRef.current = true;
  }, []);

  // --- 2. Gravação com "Debounce" (Não trava o site enquanto você digita) ---
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        const stateToPersist = {
          v: 1,
          messages,
          userData,
          userRegistered,
          showUserForm,
          sessionId
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
      } catch (err) {
        console.error('Erro ao salvar no localStorage:', err);
      }
    }, 800); // Espera 800ms de silêncio para salvar

    return () => clearTimeout(handler);
  }, [messages, userData, userRegistered, showUserForm, sessionId]);

  // --- 3. Função de Reset (Limpa tudo para uma nova consulta) ---
  const resetConversation = () => {
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setSessionId(newId);
    setMessages([{
      id: Date.now(),
      sender: 'bot',
      text: 'Conversa reiniciada. Em que posso ser útil agora?'
    }]);
    setUserRegistered(false);
    setShowUserForm(true);
    setSelectedImage(null);
    setSuggestionText('');
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ... (restante das funções de envio de mensagem)
  
  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-4 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bot size={24} className="text-blue-400" /> QuantonBot3D
        </h2>
        <button 
          onClick={resetConversation}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          title="Nova Conversa"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* Interface das mensagens e formulário aqui... */}
    </div>
  );
}
