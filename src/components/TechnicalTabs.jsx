// Arquivo: quanton3d-site/src/components/TechnicalTabs.jsx
// Este é o componente que expande o conteúdo profissional dos 8 botões de suporte.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card.jsx';
// Importa os ícones
import { CheckCircle, XCircle, Phone, User, Settings, Droplet, Layers, Beaker } from 'lucide-react'; 

// Conteúdo Completo (Baseado na sua lista de tarefas)
const supportTopics = [
    {
        title: "Nivelamento de Plataforma",
        key: "nivelamento",
        content: `
            <h4 class="font-bold text-lg mb-2 text-blue-600">Guia Rápido de Nivelamento (Passo a Passo)</h4>
            <ol class="list-decimal list-inside space-y-2">
                <li><strong>Preparação:</strong> Limpe a tela LCD e a base de construção.</li>
                <li><strong>Posicionamento:</strong> Solte os parafusos da base de construção e use a função 'Home' da impressora.</li>
                <li><strong>Calibração:</strong> Coloque uma folha de papel (sulfite) dobrada duas vezes sobre a tela LCD.</li>
                <li><strong>Ajuste:</strong> Pressione 'Z=0'. A placa de construção deve prender levemente o papel.</li>
                <li><strong>Teste:</strong> Aperte os parafusos da base em cruz, removendo o papel. A placa não deve se mover.</li>
            </ol>
            <p class="mt-4 text-sm text-gray-600">⚠️ Erros de nivelamento causam falhas de adesão. Refaça a cada 10 impressões.</p>
        `,
    },
    {
        title: "Configuração de Fatiadores",
        key: "fatiadores",
        content: `
            <h4 class="font-bold text-lg mb-2 text-purple-600">Parâmetros Essenciais no Chitubox/Lychee</h4>
            <ul class="list-disc list-inside space-y-2">
                <li><strong>Altura de Camada:</strong> 0.05mm é o padrão de fábrica.</li>
                <li><strong>Camadas Menores (0.025mm):</strong> Aumentam a qualidade e o tempo de impressão.</li>
                <li><strong>Relação Camada x Exposição:</strong> Camadas mais finas (0.025mm) exigem MENOS tempo de exposição por camada. Camadas mais grossas (0.1mm) exigem MAIS tempo.</li>
                <li><strong>Tempo de Exposição Base:</strong> Deve ser de 8 a 10 vezes maior que o tempo de exposição normal (para garantir a adesão).</li>
                <li><strong>Otimização de Parâmetros:</strong> Para resinas com *alta rigidez*, use velocidades de elevação (Lift Speed) mais lentas para evitar quebra da peça.</li>
            </ul>
        `,
    },
    {
        title: "Diagnóstico de Problemas",
        key: "diagnostico",
        content: `
            <h4 class="font-bold text-lg mb-2 text-orange-600">Problemas Comuns e Soluções Rápidas</h4>
            <ul class="list-disc list-inside space-y-2">
                <li><strong>Peça não adere à plataforma:</strong> Nivelamento incorreto ou tempo de exposição base muito baixo.</li>
                <li><strong>Linhas Horizontais (Stair-stepping):</strong> Velocidade de elevação muito rápida ou eixos descalibrados.</li>
                <li><strong>Peça com bolhas/furos:</strong> Resina agitada com muita força ou tempo de repouso (rest time) insuficiente.</li>
                <li><strong>Suportes quebrando:</strong> Suportes muito finos ou tempo de exposição baixo.</li>
            </ul>
        `,
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
    { title: "Calibração de Resina", key: "calibracao", content: `<p>Conteúdo de Calibração será adicionado em breve.</p>` },
    { title: "Posicionamento de Suportes", key: "posicionamento", content: `<p>Conteúdo de Posicionamento de Suportes será adicionado em breve.</p>` },
    { title: "Otimização de Parâmetros", key: "otimizacao", content: `<p>Conteúdo de Otimização de Parâmetros será adicionado em breve.</p>` },
    { title: "Chamadas de Vídeo", key: "chamadas", content: `<p>Conteúdo de Chamadas de Vídeo será adicionado em breve.</p>` },
];


export default function TechnicalTabs() {
    const [activeTab, setActiveTab] = useState(supportTopics[0].key);
    const activeContent = supportTopics.find(topic => topic.key === activeTab)?.content;

    return (
        <section id="suporte-tecnico" className="container mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold text-center mb-10">Suporte Técnico Especializado</h2>
            
            {/* Abas/Botões */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {supportTopics.map(topic => (
                    <button
                        key={topic.key}
                        onClick={() => setActiveTab(topic.key)}
                        className={`px-4 py-2 rounded-full font-semibold transition ${
                            activeTab === topic.key 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {topic.title}
                    </button>
                ))}
            </div>

            {/* Conteúdo */}
            <Card className="p-6 md:p-8 max-w-4xl mx-auto shadow-xl">
                <div 
                    dangerouslySetInnerHTML={{ __html: activeContent }} 
                    className="prose dark:prose-invert max-w-none" 
                />
            </Card>
        </section>
    );
}
