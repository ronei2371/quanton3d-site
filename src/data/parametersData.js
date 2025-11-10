// Arquivo: quanton3d-site/src/data/parametersData.js
// ESTE É O BANCO DE DADOS.
// Ronei, depois você precisa adicionar todas as suas impressoras
// e preencher todos os parâmetros da sua planilha Excel aqui.

export const resinList = [
  "Pyroblast+",
  "Iron / Iron 7030",
  "Spin+",
  "Poseidon",
  "Spark",
  "FlexForm",
  "Alchemist",
  "LowSmell",
  "VulcanCast",
  "Athom Dental",
  "Athom Gengiva",
  "Athom Castable",
  "Athom Castable II",
  "Athom Alinhadores"
];

export const printerList = [
  // ADICIONE O RESTO DAS SUAS IMPRESSORAS DA PLANILHA AQUI
  "Elegoo Saturn 2",
  "Anycubic Photon M3",
  "Creality Halot One",
  "Anycubic Photon Mono X",
  "Phrozen Sonic Mini 8K"
];

// Estrutura de dados para os parâmetros
// A chave é uma combinação de RESINA + IMPRESSORA
export const parameters = {
  // ADICIONE O RESTO DOS SEUS PARÂMETROS DA PLANILHA AQUI

  "Pyroblast+_Elegoo Saturn 2": {
    camada: "0.05mm",
    exposicao: "2.3s",
    exposicaoBase: "30s",
    camadasBase: "6",
    liftDistance: "7mm",
    liftSpeed: "80 mm/min",
    retractSpeed: "150 mm/min"
  },
  "Iron / Iron 7030_Elegoo Saturn 2": {
    camada: "0.05mm",
    exposicao: "2.8s",
    exposicaoBase: "35s",
    camadasBase: "6",
    liftDistance: "7mm",
    liftSpeed: "70 mm/min",
    retractSpeed: "150 mm/min"
  },
  "Pyroblast+_Anycubic Photon M3": {
    camada: "0.05mm",
    exposicao: "2.5s",
    exposicaoBase: "35s",
    camadasBase: "6",
    liftDistance: "6mm",
    liftSpeed: "90 mm/min",
    retractSpeed: "180 mm/min"
  }
};
