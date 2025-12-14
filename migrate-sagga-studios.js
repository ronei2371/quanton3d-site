// Script para migrar o parceiro Sagga Studios para o banco de dados
// Executar uma vez após o deploy

const saggaStudiosData = {
    name: "Curso Básico de Pintura Realista",
    description: "Aprenda técnicas profissionais de pintura realista para action figures e miniaturas com os mestres Arthur Monteiro e Carol Ottolini, reconhecidos como os melhores pintores de action figures realistas do Brasil! Este curso completo ensina desde os fundamentos até técnicas avançadas de pintura, weathering e acabamentos profissionais.",
    phone: "",
    email: "",
    website_url: "",
    course_url: "https://hotmart.com/pt-br/marketplace/produtos/curso-basico-pintura-realista/O98034119J",
    instructor_1_name: "Arthur Monteiro",
    instructor_1_description: "Especialista em pintura hiper-realista de action figures e bustos. Reconhecido internacionalmente por seu trabalho excepcional em detalhes faciais e texturas de pele.",
    instructor_1_phone: "(21) 99487-3812",
    instructor_2_name: "Carol Ottolini",
    instructor_2_description: "Mestre em técnicas de weathering, envelhecimento e acabamentos especiais. Referência em pintura de dioramas e peças em escala.",
    instructor_2_phone: "(21) 97655-0050",
    highlights: [
        "Técnicas de pintura hiper-realista",
        "Detalhamento facial profissional",
        "Weathering e envelhecimento",
        "Acabamentos especiais",
        "Dioramas e cenários",
        "Texturas de pele realistas",
        "Pintura de action figures",
        "Suporte direto dos instrutores"
    ],
    images: [
        "/guias/parceiros-images/art2.jpg",
        "/guias/parceiros-images/art4.jpg",
        "/guias/parceiros-images/art1.jpg",
        "/guias/parceiros-images/art3.jpg",
        "/guias/parceiros-images/art5.jpg",
        "/guias/parceiros-images/art6.jpg",
        "/guias/parceiros-images/art7.jpg"
    ],
    is_active: true,
    display_order: 1
};

async function migrateSaggaStudios() {
    try {
        const response = await fetch('/.netlify/functions/partners', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saggaStudiosData)
        });

        if (!response.ok) {
            throw new Error('Erro ao criar parceiro');
        }

        const result = await response.json();
        console.log('Sagga Studios migrado com sucesso!', result);
        return result;
    } catch (error) {
        console.error('Erro na migração:', error);
        throw error;
    }
}

// Para executar no console do navegador ou via Node.js
if (typeof window !== 'undefined') {
    // Browser
    console.log('Execute: migrateSaggaStudios()');
} else {
    // Node.js
    migrateSaggaStudios().then(() => {
        console.log('Migração concluída!');
        process.exit(0);
    }).catch(err => {
        console.error('Falha na migração:', err);
        process.exit(1);
    });
}
