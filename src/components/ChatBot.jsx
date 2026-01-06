diff --git a/src/components/ChatBot.jsx b/src/components/ChatBot.jsx
index 7014135566ac78a098f4ddc838fa7cda7f4273bd..e0c8f4e294a617fe6500b50dedbd893c3fd1f092 100644
--- a/src/components/ChatBot.jsx
+++ b/src/components/ChatBot.jsx
@@ -1,43 +1,44 @@
 // Arquivo: quanton3d-site/src/components/ChatBot.jsx
 // (Código com correção de caminho do robot-icon.png)
 
 import { useState, useRef, useEffect } from 'react';
 import { Bot, Send, X, Mic, Lightbulb, ChevronsUpDown, User, BrainCircuit, ImagePlus, RefreshCcw } from 'lucide-react';
 import { motion, AnimatePresence } from 'framer-motion';
 // import robotIcon from '../assets/robot-icon.png'; // <-- LINHA DELETADA (A QUE CAUSAVA O ERRO)
 
 // URL do backend - usa variavel de ambiente ou fallback para producao
 const normalizeApiUrl = (rawUrl) => {
   const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
   if (!trimmed) return 'https://quanton3d-bot-v2.onrender.com/api';
   return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
 };
 
 const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || 'https://quanton3d-bot-v2.onrender.com/api');
 const PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
-const CHAT_ENDPOINTS = Array.from(new Set([`${API_BASE_URL}/chat`, `${PUBLIC_BASE_URL}/chat`]));
+const ASK_ENDPOINTS = Array.from(new Set([`${API_BASE_URL}/ask`, `${PUBLIC_BASE_URL}/ask`]));
+const ASK_IMAGE_ENDPOINTS = Array.from(new Set([`${API_BASE_URL}/ask-with-image`, `${PUBLIC_BASE_URL}/ask-with-image`]));
 const REGISTER_ENDPOINT = `${API_BASE_URL}/register-user`;
 const SUGGESTION_ENDPOINT = `${API_BASE_URL}/suggest-knowledge`;
 const STORAGE_KEY = 'quanton3d-chat-state';
 const initialUserData = { name: '', phone: '', email: '', resin: '', problemType: '' };
 
 const getInitialMessageText = (mode) => {
   if (mode === 'suporte') {
     return 'Olá! Sou o QuantonBot3D IA. Como posso ajudar com seu problema técnico ou dúvida sobre resinas?';
   }
   if (mode === 'vendas') {
     return 'Olá! Você está no modo "Vendas e Produtos". Posso ajudar a encontrar a resina ideal ou falar sobre nossos produtos?';
   }
   return 'Olá! Sou o QuantonBot3D. Como posso ajudar?';
 };
 
 export function ChatBot({ isOpen, setIsOpen, mode = 'suporte' }) {
   const [messages, setMessages] = useState([]);
   const [inputValue, setInputValue] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);
   const [showSuggestion, setShowSuggestion] = useState(false);
   const [suggestionText, setSuggestionText] = useState('');
   const [selectedImage, setSelectedImage] = useState(null);
   const fileInputRef = useRef(null);
   const [showUserForm, setShowUserForm] = useState(false);
@@ -135,126 +136,124 @@ export function ChatBot({ isOpen, setIsOpen, mode = 'suporte' }) {
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
 
   useEffect(() => () => {
     if (registrationTimeoutRef.current) {
       clearTimeout(registrationTimeoutRef.current);
     }
     if (persistTimeoutRef.current) {
       clearTimeout(persistTimeoutRef.current);
     }
   }, []);
 
 
   useEffect(() => {
     endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);
 
-  const fileToBase64 = (file) => new Promise((resolve, reject) => {
-    const reader = new FileReader();
-    reader.onload = () => {
-      const result = reader.result || '';
-      const base64 = result.toString().split(',').pop();
-      resolve(base64 || '');
-    };
-    reader.onerror = reject;
-    reader.readAsDataURL(file);
-  });
-
-  const callChatApi = async (payload) => {
+  const callChatApi = async (payload, hasImage = false) => {
     let lastError = new Error('Chat indisponível no momento.');
 
-    for (const endpoint of CHAT_ENDPOINTS) {
+    const targets = hasImage ? ASK_IMAGE_ENDPOINTS : ASK_ENDPOINTS;
+    for (const endpoint of targets) {
       try {
-        const response = await fetch(endpoint, {
-          method: 'POST',
-          headers: { 'Content-Type': 'application/json' },
-          body: JSON.stringify(payload),
-        });
+        const response = await fetch(
+          endpoint,
+          hasImage
+            ? {
+                method: 'POST',
+                body: payload,
+              }
+            : {
+                method: 'POST',
+                headers: { 'Content-Type': 'application/json' },
+                body: JSON.stringify(payload),
+              }
+        );
 
         if (!response.ok) {
           lastError = new Error(`HTTP ${response.status}`);
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
     setError(null); // Limpar erro anterior
     
     try {
-      let imagePayload = {};
+      const messageText = inputValue || (selectedImage ? 'Analise esta imagem' : '');
+      let data;
+
       if (selectedImage) {
-        const base64 = await fileToBase64(selectedImage);
-        imagePayload = {
-          image: base64,
-          hasImage: true,
-          filename: selectedImage.name,
-          contentType: selectedImage.type,
-        };
+        const formData = new FormData();
+        formData.append('message', messageText);
+        formData.append('sessionId', sessionId);
+        formData.append('image', selectedImage);
+
+        data = await callChatApi(formData, true);
         setSelectedImage(null);
+      } else {
+        data = await callChatApi({
+          message: messageText,
+          sessionId,
+        });
       }
 
-      const data = await callChatApi({
-        message: inputValue || (selectedImage ? 'Analise esta imagem' : ''),
-        sessionId,
-        ...imagePayload,
-      });
-
       const botText = data.reply || data.response || 'Não consegui processar sua resposta.';
       const botMessage = { id: Date.now() + 1, sender: 'bot', text: botText };
       setMessages((prev) => [...prev, botMessage]);
       
       // Armazenar ultima pergunta e resposta para uso nas sugestoes
       setLastUserMessage(userMessage.text);
       setLastBotReply(botText);
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
       
       // Limpar erro após 5 segundos
       setTimeout(() => setError(null), 5000);
     } finally {
