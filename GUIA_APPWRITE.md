# 🚀 Guia Completo de Configuração do Appwrite

Este guia irá ajudá-lo a configurar o Appwrite para o sistema de gestão de cursos.

## 📋 Pré-requisitos

- ✅ Conta no Appwrite Cloud (https://cloud.appwrite.io)
- ✅ Projeto Appwrite criado
- ✅ Node.js 18+ instalado

## 🔧 Passo 1: Criar Projeto no Appwrite

### 1.1 Acessar Appwrite Cloud
1. Acesse https://cloud.appwrite.io
2. Faça login ou crie uma conta
3. Clique em "Create Project"

### 1.2 Configurar Projeto
1. **Nome do Projeto**: `Sistema de Gestão de Cursos`
2. **Project ID**: Anote o ID gerado (ex: `64f8a1b2c3d4e5f6g7h8i9`)
3. Clique em "Create"

## 🔑 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Criar arquivo .env.local
```bash
# Windows
copy env.example .env.local

# Linux/macOS
cp env.example .env.local
```

### 2.2 Editar .env.local
Adicione as seguintes variáveis:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=seu-project-id-aqui

# Configurações de desenvolvimento
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:9002

# Configurações de autenticação
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:9002/dashboard
NEXT_PUBLIC_AUTH_SIGNUP_REDIRECT_URL=http://localhost:9002/dashboard

# Email Configuration - SMTP Direto
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@seaocean.com.br
SMTP_PASS=ifoP@(ie09jasp
SMTP_FROM_EMAIL=admin@seaocean.com.br
SMTP_FROM_NAME=Sea Ocean
```

## 🗄️ Passo 3: Configurar Banco de Dados

### 3.1 Criar Database
1. No painel do Appwrite, vá para "Databases"
2. Clique em "Create Database"
3. **Nome**: `Sistema de Cursos`
4. **Database ID**: `687583ef000280878c7c`

### 3.2 Criar Collections

#### Collection: Empresas
1. Clique em "Create Collection"
2. **Nome**: `Empresas`
3. **Collection ID**: `687588487791c0bc9b16`
4. **Permissions**: 
   - Read: `role:all`
   - Write: `role:all`

#### Collection: Usuários
1. Clique em "Create Collection"
2. **Nome**: `Usuários`
3. **Collection ID**: `users`
4. **Permissions**:
   - Read: `role:all`
   - Write: `role:all`

#### Collection: Cursos
1. Clique em "Create Collection"
2. **Nome**: `Cursos`
3. **Collection ID**: `courses`
4. **Permissions**:
   - Read: `role:all`
   - Write: `role:all`

## 🔐 Passo 4: Configurar Autenticação

### 4.1 Habilitar Auth
1. No painel do Appwrite, vá para "Auth"
2. Clique em "Settings"
3. Habilite "Email/Password"

### 4.2 Configurar URLs
1. **Site URL**: `http://localhost:9002`
2. **Success URL**: `http://localhost:9002/dashboard`
3. **Failure URL**: `http://localhost:9002`

## 🧪 Passo 5: Testar Configuração

### 5.1 Executar Script de Setup
```bash
node scripts/setup-appwrite.js
```

### 5.2 Verificar Saída
O script deve mostrar:
- ✅ Conexão com Appwrite estabelecida
- ✅ Usuário criado com sucesso
- ✅ Login bem-sucedido

### 5.3 Credenciais de Teste
- **Email**: `admin@test.com`
- **Senha**: `123456`

## 🚀 Passo 6: Executar Aplicação

### 6.1 Instalar Dependências
```bash
npm install
```

### 6.2 Executar em Desenvolvimento
```bash
npm run dev
```

### 6.3 Acessar Sistema
- URL: http://localhost:9002
- Use as credenciais de teste criadas

## 🔧 Configurações Avançadas

### Configurar Email
1. No painel do Appwrite, vá para "Auth" > "Settings"
2. Configure SMTP:
   - **Host**: `smtp.hostinger.com`
   - **Port**: `465`
   - **Username**: `admin@seaocean.com.br`
   - **Password**: `ifoP@(ie09jasp`

### Configurar Storage (Opcional)
1. Vá para "Storage"
2. Crie um bucket para certificados
3. Configure permissões adequadas

## 🚨 Solução de Problemas

### Erro: "Client is not a constructor"
- Verifique se o Appwrite está instalado: `npm list appwrite`
- Verifique as variáveis de ambiente no `.env.local`

### Erro: "Project not found"
- Verifique se o Project ID está correto
- Confirme se o projeto existe no Appwrite Cloud

### Erro: "Unauthorized"
- Verifique se as chaves de API estão corretas
- Confirme se o projeto está ativo

### Erro: "Collection not found"
- Verifique se as collections foram criadas
- Confirme os IDs das collections no código

## 📞 Suporte

Para problemas técnicos:
- 📖 [Documentação do Appwrite](https://appwrite.io/docs)
- 🛠️ [Scripts de Setup](scripts/)
- 🔧 [Configuração](src/lib/)

---

**✅ Appwrite configurado e pronto para uso!** 