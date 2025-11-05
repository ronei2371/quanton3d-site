# Site Quanton3D - axtonronei.online

Este repositório contém o código-fonte do site institucional da Quanton3D, desenvolvido em React.

## Visão Geral

O site apresenta a empresa, seus produtos (resinas UV SLA), serviços de suporte técnico e informações de contato. Inclui também um chatbot inteligente para atendimento inicial aos clientes.

## Como Fazer o Deploy

Recomendamos utilizar a plataforma da **Netlify** para fazer o deploy de forma simples e gratuita.

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

### Passo 2: Deploy na Netlify

1.  Crie uma conta na [Netlify](https://www.netlify.com/) (você pode usar sua conta do GitHub para se registrar).
2.  No painel da Netlify, clique em **"Add new site"** e depois em **"Import an existing project"**.
3.  Conecte com o GitHub e autorize o acesso.
4.  Selecione o repositório que você acabou de criar.
5.  A Netlify detectará automaticamente que é um projeto Vite (React). As configurações padrão geralmente são suficientes:
    *   **Build command:** `npm run build` ou `pnpm build`
    *   **Publish directory:** `dist`
6.  Clique em **"Deploy site"**.

Em poucos minutos, seu site estará no ar com um endereço temporário da Netlify (ex: `nome-aleatorio.netlify.app`).

## Configurando o Domínio `axtonronei.online`

Depois que o site estiver no ar na Netlify, você pode apontar seu domínio para ele.

### Passo 1: Adicione o Domínio na Netlify

1.  No painel do seu site na Netlify, vá para **"Domain settings"**.
2.  Clique em **"Add a domain"** e insira `axtonronei.online`.
3.  Confirme que você é o dono do domínio.
4.  A Netlify fornecerá os **Nameservers (servidores de nome)** que você precisa usar. Serão algo como:
    *   `dns1.p01.nsone.net`
    *   `dns2.p01.nsone.net`
    *   `dns3.p01.nsone.net`
    *   `dns4.p01.nsone.net`

### Passo 2: Altere os Nameservers no Google Domains

1.  Acesse sua conta no [Google Domains](https://domains.google.com/).
2.  Encontre o domínio `axtonronei.online` e vá para a seção de **DNS**.
3.  Selecione a opção para usar **"Custom name servers" (Servidores de nome personalizados)**.
4.  Apague os nameservers existentes (da HostGator) e adicione os quatro nameservers fornecidos pela Netlify.
5.  Salve as alterações.

**Atenção:** A propagação do DNS pode levar de alguns minutos a 48 horas. Após esse período, seu site `axtonronei.online` estará funcionando e apontando para a versão hospedada na Netlify, com certificado de segurança (HTTPS) ativado automaticamente.

## Atualizações

- **04/11/2024:** Interface de menu e chat com imagens de circuito implementada

## Próximos Passos

- **Evoluir o Chatbot:** O chatbot atual tem respostas pré-definidas. Para o futuro, ele pode ser conectado a um serviço de Processamento de Linguagem Natural (como o da OpenAI) para se tornar verdadeiramente inteligente.
- **Banco de Dados:** As informações de contato e histórico de conversas podem ser salvas em um banco de dados para garantir a continuidade do atendimento.

