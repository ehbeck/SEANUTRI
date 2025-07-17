# Configuração do Ambiente Appwrite

Este guia explica como configurar o ambiente para usar o Appwrite como backend da aplicação.

## 📋 Pré-requisitos

1. **Conta no Appwrite**: Crie uma conta em [appwrite.io](https://appwrite.io)
2. **Projeto Appwrite**: Crie um novo projeto no console do Appwrite
3. **Node.js**: Versão 16 ou superior
4. **npm ou yarn**: Gerenciador de pacotes

## ✅ Dados do Seu Appwrite

Baseado na sua configuração atual:

- **Project ID**: `68757e790030748e089b`
- **API Endpoint**: `http://seanuri-appwrite-12c193-147-93-35-21.traefik.me/v1`

## 🚀 Configuração Rápida

### Opção 1: Script Automático (Recomendado)

Execute o script de configuração automática:

```bash
npm run setup:env
```

O script já está configurado com seus dados e irá criar automaticamente o arquivo `.env.local`.

### Opção 2: Configuração Manual

1. Copie o arquivo de exemplo:
```bash
cp env.appwrite.example .env.local
```

2. O arquivo já está configurado com seus dados específicos

## ⚙️ Configurações Necessárias

### 1. Configurações do Appwrite (Já Definidas)

```env
# OBRIGATÓRIAS (já configuradas)
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://seanuri-appwrite-12c193-147-93-35-21.traefik.me/v1
NEXT_PUBLIC_APPWRITE_PROJECT=68757e790030748e089b

# OPCIONAIS
NEXT_PUBLIC_APPWRITE_API_KEY=sua-api-key-aqui
NEXT_PUBLIC_APPWRITE_DATABASE_ID=seu-database-id-aqui
```

### 2. Configurações de Email (SMTP)

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@seaocean.com.br
SMTP_PASS=sua-senha-smtp
SMTP_FROM_EMAIL=admin@seaocean.com.br
SMTP_FROM_NAME=Sea Ocean
```

### 3. Configurações da Aplicação

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:9003
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:9003/dashboard
NEXT_PUBLIC_AUTH_SIGNUP_REDIRECT_URL=http://localhost:9003/dashboard
PORT=9003
```

## 🔧 Configuração do Projeto Appwrite

### 1. Configurar Autenticação

1. No console do Appwrite, vá para **Auth** > **Settings**
2. Configure os métodos de autenticação:
   - ✅ **Email/Password**: Habilitado
   - ✅ **Anonymous**: Habilitado (opcional)
3. Configure as URLs de redirecionamento:
   - **Success URL**: `http://localhost:9003/dashboard`
   - **Failure URL**: `http://localhost:9003/login`

### 2. Configurar Domínios Permitidos

1. Vá para **Settings** > **Security**
2. Adicione os domínios permitidos:
   - `localhost:9003`
   - `127.0.0.1:9003`
   - `seanuri-appwrite-12c193-147-93-35-21.traefik.me`
   - Seu domínio de produção (quando disponível)

### 3. Configurar Database (Opcional)

Se você planeja usar databases do Appwrite:

1. Vá para **Databases**
2. Crie um novo database
3. Crie as collections necessárias:
   - `users`
   - `empresas`
   - `cursos`
   - `agendamentos`
4. Configure as permissões de cada collection

## 🧪 Testando a Configuração

### 1. Teste de Conexão

Execute o script de teste:

```bash
npm run test:appwrite
```

### 2. Teste de Autenticação

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse `http://localhost:9003`
3. Tente criar uma conta e fazer login

### 3. Verificar Logs

Monitore os logs do console para identificar problemas:

```bash
DEBUG=appwrite:* npm run dev
```

## 🔍 Solução de Problemas

### Erro: "Invalid `userId` param"

**Causa**: O `userId` gerado não é válido ou já existe.

**Solução**:
- ✅ Project ID já está correto: `68757e790030748e089b`
- Limpe o cache do navegador
- Verifique se não há usuários duplicados

### Erro: "createEmailSession not found"

**Causa**: Método não disponível no ambiente Node.js.

**Solução**:
1. Use `createSession` em scripts Node.js
2. Use `createEmailSession` apenas no frontend

### Erro: "401 Unauthorized"

**Causa**: Credenciais inválidas ou configurações incorretas.

**Solução**:
- ✅ Endpoint já está correto: `http://seanuri-appwrite-12c193-147-93-35-21.traefik.me/v1`
- Verifique a API Key (se usada)
- Verifique as configurações de domínio

### Erro: "404 Not Found"

**Causa**: Endpoint incorreto ou projeto não encontrado.

**Solução**:
- ✅ Endpoint já está correto
- Verifique se o projeto está ativo
- Verifique se o servidor Appwrite está rodando

## 📚 Recursos Adicionais

- [Documentação do Appwrite](https://appwrite.io/docs)
- [SDK JavaScript](https://appwrite.io/docs/references/cloud/client-web)
- [Guia de Autenticação](https://appwrite.io/docs/tutorials/authentication)
- [Configuração de Domínios](https://appwrite.io/docs/tutorials/security)

## 🆘 Suporte

Se você encontrar problemas:

1. Verifique os logs do console
2. Execute o script de diagnóstico: `npm run diagnose:appwrite`
3. Verifique a documentação do Appwrite
4. Consulte os issues do projeto

## 📝 Notas Importantes

- **Segurança**: Nunca commite o arquivo `.env.local` no Git
- **Produção**: Use variáveis de ambiente diferentes para produção
- **Backup**: Mantenha backup das suas configurações
- **Atualizações**: Mantenha o SDK do Appwrite atualizado

## 🎯 Status da Configuração

- ✅ **Project ID**: Configurado (`68757e790030748e089b`)
- ✅ **Endpoint**: Configurado (`http://seanuri-appwrite-12c193-147-93-35-21.traefik.me/v1`)
- ⚙️ **API Key**: Opcional (configurar se necessário)
- ⚙️ **Domínios**: Configurar no console do Appwrite
- ⚙️ **Database**: Opcional (configurar se necessário) 