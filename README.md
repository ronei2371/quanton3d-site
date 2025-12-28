# Site Quanton3D - axtonronei.online

Este repositório contém o código-fonte do site institucional da Quanton3D, desenvolvido em React.

## Visão Geral

O site apresenta a empresa, seus produtos (resinas UV SLA), serviços de suporte técnico e informações de contato. Inclui também um chatbot inteligente para atendimento inicial aos clientes.

## Como Fazer o Deploy

Recomendamos utilizar a plataforma da **Render** para hospedar frontend e backend juntos. A Netlify continua sendo uma opção apenas para o front (estático), mas o fluxo principal agora é via Render.

### Deploy na Render (backend + frontend servidos juntos)

1.  No Render, crie (ou reutilize) um **Web Service** que execute `npm install` no build e depois `npm run build` + `npm run server` no start (o script `server` já aponta para `backend/app.js`, que agora também serve a pasta `dist`).
2.  Em **Settings > Custom Domains**, adicione `axtonronei.online` e copie o CNAME ou os registros A/AAAA exibidos pelo Render.
3.  No provedor de DNS do domínio (ex.: Google Domains), remova eventuais nameservers da Netlify e crie o CNAME/A/AAAA exatamente como o Render indicou.
4.  Aguarde a propagação do DNS. Assim que o Render verificar o domínio, o certificado HTTPS será emitido automaticamente.
5.  Teste em aba anônima: `https://axtonronei.online`. Se precisar verificar DNS, use `nslookup axtonronei.online`.

### Passo 1: Crie um Repositório no GitHub

1.  Crie uma conta no [GitHub](https://github.com/) (caso ainda não tenha).
2.  Crie um novo repositório (pode ser público ou privado).
3.  Envie os arquivos deste projeto para o seu novo repositório. Você pode fazer isso via linha de comando com `git`:

    ```bash
    git init
    git add .
    git commit -m "Versão inicial do site Quanton3D"
    git branch -M main
    git remote add origin URL_DO_SEU_REPOSITORIO
    git push -u origin main
    ```

### (Opcional) Deploy na Netlify apenas para frontend estático

1.  Crie uma conta na [Netlify](https://www.netlify.com/) (você pode usar sua conta do GitHub para se registrar).
2.  No painel da Netlify, clique em **"Add new site"** e depois em **"Import an existing project"**.
3.  Conecte com o GitHub e autorize o acesso.
4.  Selecione o repositório que você acabou de criar.
5.  A Netlify detectará automaticamente que é um projeto Vite (React). As configurações padrão geralmente são suficientes:
    *   **Build command:** `npm run build` ou `pnpm build`
    *   **Publish directory:** `dist`
6.  Clique em **"Deploy site"**.

Em poucos minutos, seu site estará no ar com um endereço temporário da Netlify (ex: `nome-aleatorio.netlify.app`). Para usar o domínio principal na Render, mantenha o DNS apontando para os registros fornecidos pelo Render (não para os nameservers da Netlify).

## Configurando o Domínio `axtonronei.online`

O domínio principal deve apontar para o serviço na Render.

### Passo 1: Adicione o domínio na Render

1.  No painel do Web Service na Render, vá em **Settings > Custom Domains**.
2.  Clique em **"Add a domain"** e insira `axtonronei.online`.
3.  Copie o **CNAME** ou os registros **A/AAAA** que o Render exibir (por exemplo, `quanton3d-bot-v2.onrender.com`).

### Passo 2: Ajuste o DNS no provedor do domínio

1.  Acesse seu provedor de DNS (ex.: [Google Domains](https://domains.google.com/)).
2.  Se existirem nameservers da Netlify, remova-os e volte a usar o DNS padrão do provedor.
3.  Crie o registro **CNAME** (ou **A/AAAA**, conforme instrução do Render) exatamente como informado na etapa anterior.
4.  Salve as alterações e aguarde a propagação.

**Atenção:** A propagação do DNS pode levar de alguns minutos a 48 horas. Após esse período, acesse `https://axtonronei.online` em uma aba anônima para validar. O Render emitirá o certificado HTTPS automaticamente assim que a verificação do domínio for concluída.

### Resolvendo falhas de verificação no Render

Caso o painel do Render mostre “DNS update needed to verify domain ownership” (como na captura da tela), verifique:

1. **Registros corretos no DNS**  
   - `www.axtonronei.online` → CNAME apontando para `quanton3d-bot-v2.onrender.com`.  
   - `axtonronei.online` (raiz) → use **ALIAS/ANAME** para `quanton3d-bot-v2.onrender.com`. Se o provedor não suportar esses tipos, crie um **A** apontando para `216.24.57.1` (IP fornecido pelo Render).
2. **Remova conflitos**  
   - Apague registros antigos da Netlify (CNAMEs ou registros apex) ou qualquer outro A/AAAA/CNAME apontando para outro serviço.
3. **Propagação e cache**  
   - Aguarde 15–30 minutos e teste via `nslookup axtonronei.online` e `nslookup www.axtonronei.online` para confirmar a resolução para o host/IP da Render.  
   - Teste em aba anônima ou com `curl -I https://axtonronei.online` para evitar cache.
4. **Repetir verificação**  
   - Após confirmar a resolução, volte ao painel do Render e clique em **Verify**. O certificado HTTPS será emitido automaticamente quando o domínio for validado.

## Atualizações

- **04/11/2024:** Interface de menu e chat com imagens de circuito implementada

## Próximos Passos

- **Evoluir o Chatbot:** O chatbot atual tem respostas pré-definidas. Para o futuro, ele pode ser conectado a um serviço de Processamento de Linguagem Natural (como o da OpenAI) para se tornar verdadeiramente inteligente.
- **Banco de Dados:** As informações de contato e histórico de conversas podem ser salvas em um banco de dados para garantir a continuidade do atendimento.
