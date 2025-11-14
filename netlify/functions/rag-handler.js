// netlify/functions/rag-handler.js

import { AstraDB } from "@datastax/astra-db-ts";
import { OpenAI } from "@langchain/openai";

// -----------------------------------------------------------
// 1. Configuração do Ambiente
// As chaves são lidas automaticamente das Variáveis de Ambiente do Netlify!
// -----------------------------------------------------------

const ASTRA_DB_API_ENDPOINT = process.env.ASTRA_DB_API_ENDPOINT;
const ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 

const COLLECTION_NAME = "rag_quanton_collection";
const CHAT_MODEL = "gpt-4o"; // Modelo que você deseja usar
const EMBEDDING_MODEL = "text-embedding-3-small"; 

// Inicializa a conexão com o Astra DB e o OpenAI
const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT);
const chatModel = new OpenAI({ apiKey: OPENAI_API_KEY, modelName: CHAT_MODEL });

// -----------------------------------------------------------
// 2. Lógica Principal do RAG
// -----------------------------------------------------------

export async function handler(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Método Não Permitido" };
    }

    try {
        const { query } = JSON.parse(event.body);
        if (!query) {
            return { statusCode: 400, body: "Pergunta (query) é obrigatória." };
        }

        // 1. Busca os documentos relevantes no Astra DB
        const collection = astraDb.collection(COLLECTION_NAME);
        
        // Usa a busca vetorial (RAG) para encontrar o contexto
        const results = await collection.vectorSearch(query, {
            limit: 3, // Busca os 3 documentos mais relevantes
            fields: ['text', 'metadata'],
        });

        // 2. Extrai o texto dos documentos encontrados para criar o CONTEXTO
        const contextText = results.map(doc => doc.text).join('\n---\n');

        // Se nenhum contexto foi encontrado, podemos retornar.
        let foundContext = contextText.length > 0;
        
        // 3. Cria o Prompt para o GPT-4o (Geração Aumentada por Recuperação)
        let prompt;
        if (foundContext) {
            prompt = `Você é um assistente de IA especialista em resinas fotopolimerizáveis da Quanton3D.
            Responda à pergunta do usuário APENAS com base no CONTEXTO fornecido abaixo.
            Se a resposta não estiver no CONTEXTO, diga 'Não tenho informações suficientes em minha base de conhecimento para responder a essa pergunta.'
            
            CONTEXTO:
            ---
            ${contextText}
            ---
            
            PERGUNTA DO USUÁRIO: ${query}`;
        } else {
            // Se não encontrou contexto, deixa o GPT-4o responder de forma geral (ou você pode pedir para ele dizer que não sabe)
             prompt = `PERGUNTA DO USUÁRIO: ${query}`;
             // Aqui você pode mudar a lógica para, por exemplo, chamar a IA original do Manus se ele ainda estiver ativo.
        }


        // 4. Chama o GPT-4o com o Prompt de Contexto
        const response = await chatModel.invoke(prompt);
        
        // 5. Retorna a resposta
        return {
            statusCode: 200,
            body: JSON.stringify({
                answer: response,
                foundContext: foundContext,
                source: foundContext ? results.map(doc => doc.metadata.source) : []
            }),
        };

    } catch (error) {
        console.error("Erro na função RAG:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erro interno no processamento RAG." }),
        };
    }
}
