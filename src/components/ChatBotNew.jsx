// Arquivo: quanton3d-site/src/components/ChatBotNew.jsx

// ... (Mantenha todo o código antes de 'const handleSubmit' inalterado) ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const userMessage = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    let botResponseText = 'Não consegui processar sua resposta.'; 

    try {
        // =================================================================
        // INCLUSÃO DO RAG (1. Tenta o Conhecimento de Especialista)
        // =================================================================
        const RAG_ENDPOINT = '/.netlify/functions/rag-handler'; // Endpoint da Função Netlify rag-handler.js
        
        let ragAnswer = null;

        try {
            const ragResponse = await fetch(RAG_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage.text }),
            });

            if (ragResponse.ok) {
                const ragData = await ragResponse.json();
                
                // Se a função RAG encontrou informação nos 185 chunks (foundContext: true):
                if (ragData.foundContext) {
                    ragAnswer = ragData.answer; // Usa a resposta do RAG
                }
            } else {
                 console.warn('Função RAG retornou erro, caindo para IA básica:', ragResponse.status);
            }
        } catch(ragError) {
             console.error('Erro de rede/execução da Função RAG, caindo para IA básica:', ragError);
        }

        // SE O RAG RETORNOU UMA RESPOSTA VÁLIDA (CONHECIMENTO DE ESPECIALISTA)
        if (ragAnswer) {
            botResponseText = ragAnswer;
        } 
        
        // =================================================================
        // CÓDIGO ORIGINAL DO MANUS (2. Fallback para IA Básica) - PRESERVADO
        // =================================================================
        else { 
            // Se o RAG NÃO encontrou contexto (ragAnswer é null), EXECUTAMOS O CÓDIGO ORIGINAL
            
            const response = await fetch(`${API_URL}/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.text, sessionId: sessionId }),
            });
            
            if (!response.ok) { 
                throw new Error('Ocorreu um erro ao conectar com a IA original.'); 
            }
            
            const data = await response.json();
            botResponseText = data.reply || 'Não consegui processar sua resposta na IA básica.';
        }
        
        // =================================================================
        // FINALIZAÇÃO (Exibe a resposta)
        // =================================================================
        
        const botMessage = { id: Date.now() + 1, sender: 'bot', text: botResponseText };
        setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Erro na API:', error);
      const errorMessage = { id: Date.now() + 1, sender: 'bot', text: 'Ocorreu um erro ao conectar com a IA. Tente novamente em instantes.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
// ... (Mantenha todo o código após 'const handleSubmit' inalterado) ...
