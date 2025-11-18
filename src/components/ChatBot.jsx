// Arquivo: quanton3d-site/src/components/ChatBotNew.jsx
// (Este é o código CORRIGIDO. Eu consertei o caminho do robot-icon.png)

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Mic, Lightbulb, ChevronsUpDown, User, BrainCircuit, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import robotIcon from '../assets/robot-icon.png'; // <-- LINHA DELETADA (A QUE CAUSAVA O ERRO)

const API_URL = import.meta.env.VITE_API_URL;

export function ChatBot({ isOpen, setIsOpen, mode = 'suporte', isModalOpen, onOpenModal }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userData, setUserData] = useState({ name: '', phone: '', email: '' });
  const [userRegistered, setUserRegistered] = useState(false);
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
    // Mostrar formulário de cadastro imediatamente ao abrir o chat
    if (!userRegistered) {
      setTimeout(() => setShowUserForm(true), 500);
    }
  }, [mode, userRegistered]);


  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;
    
    // Bloquear envio se usuário não estiver registrado
    if (!userRegistered) {
      setShowUserForm(true);
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
    
    try {
      let response;
      
      if (selectedImage) {
        // Upload com imagem
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('message', inputValue || 'Analise esta imagem');
        formData.append('sessionId', sessionId);
        
        response = await fetch(`${API_URL}/ask-with-image`, {
          method: 'POST',
          body: formData,
        });
        setSelectedImage(null);
      } else {
        // Mensagem normal
        response = await fetch(`${API_URL}/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputValue, sessionId: sessionId }),
        });
      }
      
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
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    if (!userData.name || !userData.phone || !userData.email) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/register-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, sessionId }),
      });
      
      if (response.ok) {
        setUserRegistered(true);
        setShowUserForm(false);
        const botMessage = { 
          id: Date.now(), 
          sender: 'bot', 
          text: `Obrigado, ${userData.name}! Agora posso te atender melhor. Como posso ajudar?` 
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
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


  if (!isOpen) {
    if (isModalOpen) {
      return null;
    }
    
    return (
      <button
        onClick={onOpenModal} // <-- Abre o MODAL
        className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="Abrir menu de opções"
        style={{ width: '80px', height: '80px' }} // Botão grande
      >
        {/* ===== LINHA CORRIGIDA (caminho público) ===== */}
        <img src="/assets/robot-icon.png" alt="Bot" className="h-12 w-12" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 right-0 md:bottom-8 md:right-8 w-full h-full md:w-[520px] md:h-[85vh] md:max-h-[850px] bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col z-50"
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
        <button onClick={toggleOpen} className="text-white opacity-70 hover:opacity-100">
          <X size={20} />
        </button>
      </div>

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
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl max-w-md w-full"
            >
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
                <input
                  type="tel"
                  placeholder="Seu telefone (com DDD)"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
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

      {/* Fundo de Circuito - SEMPRE VISÍVEL */}
      <div 
        className="flex-1 p-4 overflow-y-auto space-y-4 relative"
        style={{ 
          backgroundImage: "url('/circuit-bg.gif')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          minHeight: '400px' // Garantir altura mínima
        }}
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"></div>
        
        <div className="relative z-10 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3 rounded-lg max-w-[80%] shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {msg.image && (
                  <img src={msg.image} alt="Imagem enviada" className="w-full rounded-lg mb-2" />
                )}
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-md">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
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
                <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium mb-2">
                  Descreva a informação que você gostaria que fosse adicionada.
                </p>
                <textarea
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                  placeholder="Ex: A resina X funciona bem com..."
                  disabled={isLoading}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button 
                    onClick={() => setShowSuggestion(false)}
                    className="text-xs px-3 py-1 rounded bg-gray-200 dark:bg-gray-600"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSuggestionSubmit}
                    className="text-xs px-3 py-1 rounded bg-yellow-500 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Sugestão'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowSuggestion(!showSuggestion)}
          className={`flex items-center gap-1.5 text-xs mb-2 ${showSuggestion ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Lightbulb size={14} /> Sugerir Conhecimento <ChevronsUpDown size={14} />
        </button>
        
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
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ×
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
            className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            disabled={isLoading}
            title="Enviar imagem"
          >
            <ImagePlus size={20} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
