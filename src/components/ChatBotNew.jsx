// Arquivo: quanton3d-site/src/components/ChatBotNew.jsx
// (Este é o código ATUALIZADO. O "Botão Roxo" agora abre o MODAL)

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Mic, Bulb, ChevronsUpDown, User, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import robotIcon from '../assets/robot-icon.png';

const API_URL = import.meta.env.VITE_API_URL;

// ===== MUDANÇA IMPORTANTE =====
// O App.jsx agora controla se o chat está aberto (isOpen)
// E também se o modal está aberto (isModalOpen)
// E também a função para ABRIR o modal (onOpenModal)
export function ChatBot({ isOpen, setIsOpen, mode = 'suporte', isModalOpen, onOpenModal }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  
  const endOfMessagesRef = useRef(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Define a mensagem inicial com base no modo
  useEffect(() => {
    let initialText = '';
    if (mode === 'suporte') {
      initialText = 'Olá! Sou o QuantonBot3D IA. Como posso ajudar com seu problema técnico ou dúvida sobre resinas?';
    } else if (mode === 'vendas') {
      initialText = 'Olá! Você está no modo "Vendas e Produtos". Posso ajudar a encontrar a resina ideal ou falar sobre nossos produtos?';
    } else {
      initialText = 'Olá! Sou o QuantonBot3D. Como posso ajudar?';
    }
    setMessages([{ id: 1, sender: 'bot', text: initialText }]);
  }, [mode]);


  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // (O código de handleSubmit e handleSuggestionSubmit é o mesmo)
  // ... (Cole o código das funções handleSubmit e handleSuggestionSubmit da minha mensagem anterior aqui) ...
  // ...
  
  // (Colando a versão completa para garantir)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const userMessage = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue, sessionId: sessionId }),
      });
      if (!response.ok) { throw new Error('Ocorreu um erro ao conectar com a IA.'); }
      const data = await response.json();
      const botMessage = { id: Date.now() + 1, sender: 'bot', text: data.reply || 'Não consegui processar sua resposta.' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro na API:', error);
      const errorMessage = { id: Date.now() + 1, sender: 'bot', text: 'Ocorreu um erro ao conectar com a IA. Tente novamente em instantes.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSuggestionSubmit = async () => {
    if (!suggestionText.trim() || isLoading) { alert('Por favor, descreva sua sugestão.'); return; }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/suggest-knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion: suggestionText, userName: "Usuário do Site" }),
      });
      if (!response.ok) { throw new Error('Não foi possível enviar sua sugestão.'); }
      const data = await response.json();
      alert(data.message || 'Obrigado! Sua sugestão foi enviada.');
      setSuggestionText('');
      setShowSuggestion(false);
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  // ===== LÓGICA TROCADA =====
  // Se o CHAT está aberto, mostra o chat.
  // Se NÃO, mostra o "Botão Roxo" (contanto que o MODAL também não esteja aberto)
  if (!isOpen) {
    
    // Se o modal estiver aberto, não mostre nada (para não ter dois botões flutuantes)
    if (isModalOpen) {
      return null;
    }
    
    // Se o chat E o modal estiverem fechados, mostre o "Botão Roxo"
    return (
      <button
        onClick={onOpenModal} // <-- MUDANÇA: AGORA CHAMA A FUNÇÃO PARA ABRIR O MODAL
        className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="Abrir menu de opções"
        style={{ width: '80px', height: '80px' }} // Mantém o botão grande
      >
        <img src={robotIcon} alt="Bot" className="h-12 w-12" />
      </button>
    );
  }
  // ===== FIM DA LÓGICA TROCADA =====


  // (O resto do código é o mesmo: a janela de chat grande)
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 right-0 md:bottom-8 md:right-8 w-full h-full md:w-[440px] md:h-[75vh] md:max-h-[700px] bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col z-50"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-700 to-purple-700 text-white flex justify-between items-center rounded-t-lg">
        {/* ... (código do Header) ... */}
      </div>

      {/* Fundo de Circuito */}
      <div 
        className="flex-1 p-4 overflow-y-auto space-y-4 relative"
        style={{ backgroundImage: "url('/chat-bg.gif')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* ... (código dos Balões de Mensagem) ... */}
      </div>

      {/* Botão de Sugestão (o "💡") */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        {/* ... (código do Formulário de Sugestão) ... */}
        {/* Input de Chat */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          {/* ... (código do Input de Chat) ... */}
        </form>
      </div>
    </motion.div>
  );
}
