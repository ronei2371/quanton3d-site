// Arquivo: quanton3d-site/src/components/TechnicalTabs.jsx
// Este é o componente que expande o conteúdo profissional dos 8 botões de suporte.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card.jsx';
// Importa os ícones
import { CheckCircle, XCircle, Phone, User, Settings, Droplet, Layers, Beaker, Wrench } from 'lucide-react'; 

// Conteúdo Completo (Baseado na sua lista de tarefas)
const supportTopics = [
    {
        title: "Nivelamento de Plataforma",
        key: "nivelamento",
        guideUrl: "/guias/guia-nivelamento.html"
    },
    {
        title: "Configuração de Fatiadores",
        key: "fatiadores",
        guideUrl: "/guias/guia-configuracao-fatiadores.html"
    },
    {
        title: "Diagnóstico de Problemas",
        key: "diagnostico",
        guideUrl: "/guias/guia-diagnostico-problemas.html"
    },
    {
        title: "Atendimento Prioritário",
        key: "prioritario",
        content: `
            <h4 class="font-bold text-lg mb-2 text-green-600">Fale com um Especialista Agora</h4>
            <p class="text-sm text-gray-700 mb-4">
                Para suporte humano direto ou chamadas de vídeo, utilize nossos canais prioritários.
            </p>
            <div class="space-y-2">
                <a href="https://wa.me/553132716935" target="_blank" class="flex items-center gap-3 bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition">
                    <Phone size={20} /> WhatsApp: (31) 3271-6935 (Suporte Humanizado)
                </a>
                <a href="mailto:suporte@quanton3d.com.br" class="flex items-center gap-3 bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition">
                    <User size={20} /> Email: suporte@quanton3d.com.br
                </a>
            </div>
        `,
    },
    { 
        title: "Calibração de Resina", 
        key: "calibracao", 
        guideUrl: "/guias/guia-calibracao-quanton3d.html"
    },
    { 
        title: "Posicionamento de Suportes", 
        key: "posicionamento", 
        guideUrl: "/guias/guia-posicionamento-suportes.html"
    },
    { 
        title: "Manutenção de Máquina", 
        key: "manutencao", 
        guideUrl: "/guias/guia-manutencao-impressora.html"
    },
    {
        title: "Otimização de Parâmetros",
        key: "otimizacao",
        guideUrl: "/guias/guia-otimizacao-parametros.html"
    },
    {
        title: "Parceiros",
        key: "parceiros",
        guideUrl: "/guias/parceiros-dinamico.html"
    },
    {
        title: "Chamadas de Vídeo",
        key: "chamadas",
        content: `
            <h4 class="font-bold text-lg mb-2 text-blue-600">Suporte por Vídeo Chamada</h4>
            <p class="text-sm text-gray-700 mb-4">
                Agende uma chamada de vídeo com nossos especialistas para resolver problemas complexos.
            </p>
            <div class="space-y-2">
                <a href="https://wa.me/553132716935?text=Gostaria%20de%20agendar%20uma%20chamada%20de%20v%C3%ADdeo" target="_blank" class="flex items-center gap-3 bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition">
                    <Phone size={20} /> Agendar via WhatsApp
                </a>
                <p class="text-xs text-gray-600 mt-2">
                    Disponível de segunda a sexta, das 9h às 18h
                </p>
            </div>
        `
    },
];


export default function TechnicalTabs() {
    const [activeTab, setActiveTab] = useState(supportTopics[0].key);
    const activeTopic = supportTopics.find(topic => topic.key === activeTab);

    const handleButtonClick = (topic) => {
        if (topic.guideUrl) {
            // Abre o guia HTML em nova aba
            window.open(topic.guideUrl, '_blank');
        } else {
            // Mostra o conteúdo inline
            setActiveTab(topic.key);
        }
    };

    return (
        <section id="suporte-tecnico" className="container mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold text-center mb-10 text-white drop-shadow-lg">Suporte Técnico Especializado</h2>
            
            {/* Abas/Botões - Estilo Neon Cyberpunk */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
                {supportTopics.map(topic => (
                    <button
                        key={topic.key}
                        onClick={() => handleButtonClick(topic)}
                        className={`neon-button px-5 py-3 text-sm ${
                            activeTab === topic.key && !topic.guideUrl
                                ? 'neon-button-active' 
                                : ''
                        }`}
                    >
                        {topic.title}
                    </button>
                ))}
            </div>

            {/* Conteúdo - Fundo transparente com moleculas visiveis - Só mostra se não for guia externo */}
            {activeTopic && !activeTopic.guideUrl && (
                <Card className="p-6 md:p-8 max-w-4xl mx-auto shadow-xl bg-white/70 backdrop-blur-sm border border-blue-200">
                    <div 
                        dangerouslySetInnerHTML={{ __html: activeTopic.content }} 
                        className="prose max-w-none [&_*]:text-black [&_h4]:text-black [&_p]:text-black [&_li]:text-black [&_strong]:text-black" 
                    />
                </Card>
            )}
        </section>
    );
}
