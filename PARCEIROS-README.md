# Sistema de Gerenciamento de Parceiros - Quanton3D

## 📋 Visão Geral

Sistema completo para gerenciar parceiros, cursos e serviços recomendados pela Quanton3D. Permite adicionar, editar e remover parceiros através do painel administrativo.

## 🚀 Funcionalidades

### Painel Admin
- ✅ Criar novo parceiro
- ✅ Editar parceiro existente
- ✅ Excluir parceiro
- ✅ Upload de múltiplas imagens
- ✅ Ativar/Desativar parceiro
- ✅ Ordenar parceiros (display_order)
- ✅ Adicionar até 2 instrutores/responsáveis com contatos
- ✅ Lista de destaques do curso/serviço
- ✅ Links para curso, website, email, telefone

### Página Pública
- ✅ Carrega parceiros ativos do banco de dados
- ✅ Design responsivo e profissional
- ✅ Galeria de imagens
- ✅ Informações de contato
- ✅ Botão de CTA para curso/serviço

## 📁 Arquivos Criados

### Backend (Netlify Functions)
- `netlify/functions/partners.js` - API CRUD completa
- `netlify/functions/upload-partner-image.js` - Upload de imagens
- `netlify/functions/db-schema.sql` - Schema do banco (documentação)

### Frontend
- `src/components/PartnersManager.jsx` - Interface admin
- `src/components/AdminPanel.jsx` - Atualizado com aba Parceiros
- `public/guias/parceiros-dinamico.html` - Página pública dinâmica

### Utilitários
- `migrate-sagga-studios.js` - Script de migração do parceiro atual

## 🔧 Como Usar

### 1. Acessar o Painel Admin

1. Acesse: `https://axtonronei.online/admin.html`
2. Faça login com a senha de admin
3. Clique na aba **"PARCEIROS"**

### 2. Adicionar Novo Parceiro

1. Clique em **"Novo Parceiro"**
2. Preencha os campos:
   - **Nome do Parceiro*** (obrigatório)
   - **Descrição*** (obrigatório)
   - Telefone, Email, Website
   - Link do Curso/Serviço
   
3. **Instrutores** (opcional):
   - Nome, Descrição e Telefone de até 2 instrutores
   
4. **Destaques**:
   - Digite um destaque e clique em "+"
   - Adicione quantos destaques quiser
   
5. **Imagens**:
   - Clique na área de upload
   - Selecione múltiplas imagens (PNG, JPG)
   - Preview aparecerá automaticamente
   
6. **Configurações**:
   - ☑️ Parceiro ativo (visível no site)
   - Ordem de exibição (número menor aparece primeiro)
   
7. Clique em **"Salvar Parceiro"**

### 3. Editar Parceiro

1. Na lista de parceiros, clique no botão **✏️ Editar**
2. Modifique os campos desejados
3. Clique em **"Salvar Parceiro"**

### 4. Excluir Parceiro

1. Na lista de parceiros, clique no botão **🗑️ Excluir**
2. Confirme a exclusão

### 5. Ativar/Desativar

- Edite o parceiro e desmarque "Parceiro ativo"
- Parceiros inativos não aparecem na página pública

## 🌐 URLs

- **Página Pública**: `https://axtonronei.online/guias/parceiros-dinamico.html`
- **API Endpoint**: `/.netlify/functions/partners`
- **Painel Admin**: `https://axtonronei.online/admin.html` (aba Parceiros)

## 📊 Estrutura de Dados

```javascript
{
  _id: "uuid",
  name: "Nome do Parceiro",
  description: "Descrição completa...",
  phone: "(21) 99999-9999",
  email: "contato@parceiro.com",
  website_url: "https://...",
  course_url: "https://...",
  instructor_1_name: "Nome Instrutor 1",
  instructor_1_description: "Descrição...",
  instructor_1_phone: "(21) 99999-9999",
  instructor_2_name: "Nome Instrutor 2",
  instructor_2_description: "Descrição...",
  instructor_2_phone: "(21) 99999-9999",
  highlights: ["Destaque 1", "Destaque 2", ...],
  images: ["url1.jpg", "url2.jpg", ...],
  is_active: true,
  display_order: 1,
  created_at: "2024-12-14T...",
  updated_at: "2024-12-14T..."
}
```

## 🔐 Variáveis de Ambiente Necessárias

Já configuradas no Netlify:
- `ASTRA_DB_API_ENDPOINT`
- `ASTRA_DB_APPLICATION_TOKEN`
- `CLOUDINARY_CLOUD_NAME` (para upload de imagens)
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 📝 Migração do Parceiro Atual

O parceiro **Sagga Studios** (Arthur e Carol) já está migrado para o banco de dados com:
- Nome do curso
- Descrição completa
- Telefones dos instrutores
- 7 imagens da galeria
- 8 destaques do curso
- Link para a Hotmart

## 🎨 Personalização

### Cores do Tema
- Primária: `#667eea` (azul)
- Secundária: `#764ba2` (roxo)
- Gradiente: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### Layout
- Responsivo (mobile-first)
- Grid adaptativo para imagens
- Cards com hover effects
- Animações suaves

## 🐛 Troubleshooting

### Parceiros não aparecem na página
1. Verifique se o parceiro está **ativo** (is_active = true)
2. Verifique o console do navegador para erros de API
3. Confirme que o Astra DB está configurado

### Upload de imagens falha
1. Verifique as credenciais do Cloudinary
2. Confirme o tamanho das imagens (máx 5MB)
3. Use formatos suportados (PNG, JPG, JPEG)

### Erro ao salvar parceiro
1. Nome e descrição são obrigatórios
2. Verifique a conexão com o banco de dados
3. Veja os logs no Netlify Functions

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do Netlify
- Inspecione o console do navegador
- Revise as variáveis de ambiente

## 🔄 Atualizações Futuras

Possíveis melhorias:
- [ ] Drag & drop para reordenar parceiros
- [ ] Categorias de parceiros
- [ ] Sistema de avaliações
- [ ] Estatísticas de cliques
- [ ] Integração com CRM

---

**Desenvolvido para Quanton3D** 🚀
Última atualização: Dezembro 2024
