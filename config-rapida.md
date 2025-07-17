# 🚀 Configuração Rápida - Appwrite

## ✅ Dados do Seu Appwrite

Baseado na sua configuração:

- **Project ID**: `68757e790030748e089b`
- **API Endpoint**: `http://seanuri-appwrite-12c193-147-93-35-21.traefik.me/v1`

## Passo 1: Configuração Automática

Execute o comando para configuração automática:

```bash
npm run setup:env
```

O script já está configurado com seus dados e irá criar o arquivo `.env.local` automaticamente.

## Passo 2: Configuração Manual (Alternativa)

Se preferir configurar manualmente:

1. **Crie o arquivo `.env.local`** na raiz do projeto
2. **Adicione as configurações mínimas**:

```env
# CONFIGURAÇÕES DO APPWRITE (seus dados)
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://seanuri-appwrite-12c193-147-93-35-21.traefik.me/v1
NEXT_PUBLIC_APPWRITE_PROJECT=68757e790030748e089b

# OPCIONAL - Chave da API (para operações server-side)
NEXT_PUBLIC_APPWRITE_API_KEY=

# Configurações da aplicação
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:9003
PORT=9003

# Configurações de email (usar as existentes)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@seaocean.com.br
SMTP_PASS=ifoP@(ie09jasp
SMTP_FROM_EMAIL=admin@seaocean.com.br
SMTP_FROM_NAME=Sea Ocean
```

## Passo 3: Testar Configuração

```bash
# Teste de conexão
npm run test:appwrite

# Diagnóstico completo
npm run diagnose:appwrite

# Iniciar aplicação
npm run dev
```

## Passo 4: Configurar Appwrite

1. **Autenticação**: Console > Auth > Settings
   - ✅ Habilitar Email/Password
   - ✅ Configurar URLs de redirecionamento

2. **Domínios**: Console > Settings > Security
   - Adicionar: `localhost:9003`
   - Adicionar: `127.0.0.1:9003`
   - Adicionar: `seanuri-appwrite-12c193-147-93-35-21.traefik.me`

## 🔧 Comandos Úteis

```bash
# Configuração automática (já com seus dados)
npm run setup:env

# Teste de conexão
npm run test:appwrite

# Diagnóstico completo
npm run diagnose:appwrite

# Limpar e reinstalar dependências
npm run clean

# Iniciar desenvolvimento
npm run dev
```

## ❗ Problemas Comuns

### "Invalid `userId` param"
- ✅ Project ID já está correto: `68757e790030748e089b`
- Limpe o cache do navegador

### "createEmailSession not found"
- Use apenas no frontend (browser)
- Para Node.js, use `createSession`

### "401 Unauthorized"
- ✅ Endpoint já está correto: `http://seanuri-appwrite-12c193-147-93-35-21.traefik.me/v1`
- Verifique se o projeto está ativo no console

### "404 Not Found"
- ✅ Endpoint já está correto
- Verifique se o projeto está ativo
- Verifique se o servidor Appwrite está rodando

## 📞 Suporte

- Execute: `npm run diagnose:appwrite`
- Verifique os logs do console
- Consulte: `CONFIGURACAO_APPWRITE.md`

## 🎯 Status da Configuração

- ✅ **Project ID**: Configurado (`68757e790030748e089b`)
- ✅ **Endpoint**: Configurado (`http://seanuri-appwrite-12c193-147-93-35-21.traefik.me/v1`)
- ⚙️ **API Key**: Opcional (configurar se necessário)
- ⚙️ **Domínios**: Configurar no console do Appwrite 