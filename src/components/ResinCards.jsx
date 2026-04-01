import React, { useState } from 'react';
import { X } from 'lucide-react';

const RESINS_DATA = {
  'Pyroblast+': {
    name: 'Pyroblast+',
    shortDesc: 'Resina de alta resistência térmica',
    color: 'Cinza escuro',
    applications: 'Moldes de injeção, peças expostas a calor',
    characteristics: [
      'Resistência térmica até 238°C (HDT)',
      'Alta rigidez e resistência mecânica',
      'Excelente estabilidade dimensional',
      'Ideal para moldes de fundição',
      'Baixa contração pós-cura'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-8s',
      baseExposure: '35-70s',
      baseLayers: '6-10'
    }
  },
  'Iron 7030': {
    name: 'Iron / Iron 7030',
    shortDesc: 'Resina rígida de alta resistência mecânica',
    color: 'Cinza',
    applications: 'Peças funcionais, protótipos mecânicos',
    characteristics: [
      'Alta dureza e resistência ao impacto',
      'Excelente para peças funcionais',
      'Boa resistência química',
      'Acabamento fosco profissional',
      'Fácil pós-processamento'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-6s',
      baseExposure: '30-60s',
      baseLayers: '8-10'
    }
  },
  'Spin+': {
    name: 'Spin+',
    shortDesc: 'Resina para fundição (castable)',
    color: 'Azul translúcido',
    applications: 'Joalheria, odontologia (fundição por cera perdida)',
    characteristics: [
      'Queima limpa sem resíduos',
      'Expansão controlada',
      'Alta precisão de detalhes',
      'Ideal para fundição em ouro e prata',
      'Baixa cinza residual'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-5s',
      baseExposure: '30-50s',
      baseLayers: '6-8'
    }
  },
  'Poseidon': {
    name: 'Poseidon',
    shortDesc: 'Resina lavável em água',
    color: 'Diversas cores disponíveis',
    applications: 'Prototipagem geral, modelos conceituais',
    characteristics: [
      'Limpeza com água, sem IPA',
      'Ecológica e econômica',
      'Boa precisão dimensional',
      'Diversas cores vibrantes',
      'Fácil pós-processamento'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-4s',
      baseExposure: '30-45s',
      baseLayers: '6-8'
    }
  },
  'Spark': {
    name: 'Spark',
    shortDesc: 'Resina padrão de uso geral',
    color: 'Diversas cores',
    applications: 'Protótipos, miniaturas, modelos',
    characteristics: [
      'Ótimo custo-benefício',
      'Boa precisão e acabamento',
      'Versátil para diversas aplicações',
      'Fácil de usar',
      'Ampla gama de cores'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-4s',
      baseExposure: '30-40s',
      baseLayers: '6-8'
    }
  },
  'FlexForm': {
    name: 'FlexForm',
    shortDesc: 'Resina flexível',
    color: 'Natural/translúcida',
    applications: 'Juntas, vedações, peças que exigem elasticidade',
    characteristics: [
      'Flexibilidade Shore A 70-80',
      'Resistente a rasgos',
      'Mantém elasticidade após cura',
      'Boa resistência ao desgaste',
      'Ideal para borrachas e vedações'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '3-6s',
      baseExposure: '35-50s',
      baseLayers: '6-8'
    }
  },
  'Alchemist': {
    name: 'Alchemist',
    shortDesc: 'Resina de alta precisão',
    color: 'Cinza claro',
    applications: 'Miniaturas, joias, peças com detalhes finos',
    characteristics: [
      'Resolução excepcional',
      'Acabamento liso e detalhado',
      'Ideal para miniaturas RPG',
      'Excelente para joalheria',
      'Baixa viscosidade'
    ],
    parameters: {
      layer: '0.025mm',
      exposure: '2-4s',
      baseExposure: '30-40s',
      baseLayers: '6-8'
    }
  },
  'LowSmell': {
    name: 'LowSmell',
    shortDesc: 'Resina com baixo odor',
    color: 'Branco/cinza',
    applications: 'Ambientes fechados, uso doméstico',
    characteristics: [
      'Odor reduzido significativamente',
      'Boa precisão dimensional',
      'Ideal para ambientes fechados',
      'Fácil pós-processamento',
      'Acabamento de qualidade'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-4s',
      baseExposure: '30-40s',
      baseLayers: '6-8'
    }
  },
  'VulcanCast': {
    name: 'VulcanCast',
    shortDesc: 'Resina para fundição de alta performance',
    color: 'Azul',
    applications: 'Joalheria profissional, peças de precisão',
    characteristics: [
      'Queima ultra-limpa',
      'Detalhamento excepcional',
      'Expansão controlada',
      'Ideal para fundição profissional',
      'Baixíssima cinza residual'
    ],
    parameters: {
      layer: '0.025mm',
      exposure: '2-4s',
      baseExposure: '30-45s',
      baseLayers: '6-8'
    }
  },
  'Athom Dental': {
    name: 'Athom Dental',
    shortDesc: 'Resina odontológica para modelos',
    color: 'Bege',
    applications: 'Modelos dentários, guias cirúrgicos',
    characteristics: [
      'Precisão dimensional excepcional',
      'Biocompatível após cura completa',
      'Cor similar a dentes naturais',
      'Resistente a deformações',
      'Certificada para uso odontológico'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-4s',
      baseExposure: '30-40s',
      baseLayers: '6-8'
    }
  },
  'Athom Gengiva': {
    name: 'Athom Gengiva',
    shortDesc: 'Resina para simulação de gengiva',
    color: 'Rosa gengiva',
    applications: 'Próteses, modelos de apresentação',
    characteristics: [
      'Cor e textura similar à gengiva natural',
      'Flexibilidade controlada',
      'Ideal para próteses dentárias',
      'Biocompatível após cura',
      'Excelente acabamento'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-4s',
      baseExposure: '30-40s',
      baseLayers: '6-8'
    }
  },
  'Athom Castable': {
    name: 'Athom Castable',
    shortDesc: 'Resina odontológica para fundição',
    color: 'Roxo',
    applications: 'Coroas, pontes, inlays (fundição)',
    characteristics: [
      'Queima limpa sem resíduos',
      'Expansão controlada',
      'Alta precisão dimensional',
      'Ideal para fundição odontológica',
      'Certificada para uso dental'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-4s',
      baseExposure: '30-40s',
      baseLayers: '6-8'
    }
  },
  'Athom Castable II': {
    name: 'Athom Castable II',
    shortDesc: 'Resina odontológica para fundição (versão 2)',
    color: 'Roxo escuro',
    applications: 'Coroas, pontes, estruturas complexas',
    characteristics: [
      'Queima ultra-limpa',
      'Expansão otimizada',
      'Maior resistência pré-fundição',
      'Detalhamento superior',
      'Certificada para uso profissional'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-4s',
      baseExposure: '30-40s',
      baseLayers: '6-8'
    }
  },
  'Athom Alinhadores': {
    name: 'Athom Alinhadores',
    shortDesc: 'Resina para alinhadores transparentes',
    color: 'Transparente',
    applications: 'Alinhadores ortodônticos, placas de bruxismo',
    characteristics: [
      'Transparência excepcional',
      'Flexibilidade controlada',
      'Biocompatível após cura',
      'Resistente ao desgaste',
      'Certificada para uso ortodôntico'
    ],
    parameters: {
      layer: '0.05mm',
      exposure: '2-4s',
      baseExposure: '30-40s',
      baseLayers: '6-8'
    }
  }
};

const ResinCard = ({ resin, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    <h3 className="text-xl font-bold text-blue-600 mb-2">{resin.name}</h3>
    <p className="text-gray-600 mb-4">{resin.shortDesc}</p>
    <div className="space-y-2 text-sm">
      <p><span className="font-semibold">Cor:</span> {resin.color}</p>
      <p><span className="font-semibold">Aplicações:</span> {resin.applications}</p>
    </div>
    <button className="mt-4 text-blue-600 font-semibold hover:text-blue-800">
      Ver detalhes →
    </button>
  </div>
);

const ResinModal = ({ resin, onClose }) => {
  if (!resin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{resin.name}</h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Descrição</h3>
            <p className="text-gray-600">{resin.shortDesc}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Cor</p>
                <p className="font-semibold">{resin.color}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Aplicações</p>
                <p className="font-semibold">{resin.applications}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Características Principais</h3>
            <ul className="space-y-2">
              {resin.characteristics.map((char, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">{char}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Parâmetros Recomendados</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Altura de Camada</p>
                <p className="font-semibold text-blue-600">{resin.parameters.layer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tempo de Exposição</p>
                <p className="font-semibold text-blue-600">{resin.parameters.exposure}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Exposição Base</p>
                <p className="font-semibold text-blue-600">{resin.parameters.baseExposure}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Camadas de Base</p>
                <p className="font-semibold text-blue-600">{resin.parameters.baseLayers}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Parâmetros variam conforme impressora. Use o seletor de parâmetros para valores específicos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResinCards() {
  const [selectedResin, setSelectedResin] = useState(null);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Nossas Resinas
          </h2>
          <p className="text-gray-600 text-lg">
            Soluções especializadas para cada aplicação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.values(RESINS_DATA).map((resin) => (
            <ResinCard
              key={resin.name}
              resin={resin}
              onClick={() => setSelectedResin(resin)}
            />
          ))}
        </div>
      </div>

      <ResinModal
        resin={selectedResin}
        onClose={() => setSelectedResin(null)}
      />
    </section>
  );
}
