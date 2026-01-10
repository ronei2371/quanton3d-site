# Site Quanton3D - axtonronei.online

Este repositório contém o código-fonte do sistema Quanton3D (Site + Bot IA), desenvolvido em React e Node.js.

## Visão Geral

O sistema integra:
1.  **Frontend (Site):** Apresenta a empresa, resinas UV SLA e galeria.
2.  **Backend (Bot):** Inteligência Artificial para atendimento e processamento de dados.

## Como Fazer o Deploy (Automático)

Este projeto está configurado para **Deploy Automático no Render** usando Blueprints (Infraestrutura como Código).

### A "Receita" (render.yaml)
Não é necessário configurar comandos manuais. O arquivo `render.yaml` na raiz do projeto já contém todas as instruções:

* **Build Command:** `npm install --no-package-lock && npm run build`
    *(Instala as dependências ignorando travas de versão antigas e cria a pasta do site)*
* **Start Command:** `node server.js`
    *(Inicia o servidor do Bot)*

### Passos para ativar:
1.  No painel do Render, vá em **Blueprints**.
2.  Clique em **New Blueprint Instance**.
3.  Conecte este repositório.
4.  O Render vai ler o arquivo `render.yaml` e configurar o Bot e o Site automaticamente.

## Domínio

O sistema responde pelo domínio: `https://axtonronei.online`

---
*Desenvolvido por Ronei - Quanton3D*
