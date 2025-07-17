# 🔧 Configuração do Ambiente - Supabase Self-Hosted

## 📋 Passos para Configuração

### 1. **Configurar Variáveis de Ambiente**

Copie o arquivo `env.local.config` para `.env.local`:

```bash
# Windows
copy env.local.config .env.local

# Linux/macOS
cp env.local.config .env.local
```

### 2. **Verificar Configurações**

O arquivo `.env.local` deve conter:

```bash
# Supabase Configuration - Self-Hosted
NEXT_PUBLIC_SUPABASE_URL=http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTIwNzg0NjUsImV4cCI6MTc4MzYxNDQ2NSwiaXNzIjoic3VwYWJhc2UiLCJyb2xlIjoiYW5vbiJ9.g7ryZ6Qp2oHoTbcp5VmGxR0o_WR9QEMxeWxJ38N1eIg

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTIwNzg0NjUsImV4cCI6MTc4MzYxNDQ2NSwiaXNzIjoic3VwYWJhc2UiLCJyb2xlIjoic2VydmljZV9yb2xlIn0.H2zdpbLf-jFt4G9iuP8DdOovaZwysTjvAOnZykpOZKo

# Email Configuration - SMTP Direto (usando configurações do Supabase)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@seaocean.com.br
SMTP_PASS=ifoP@(ie09jasp
SMTP_FROM_EMAIL=admin@seaocean.com.br
SMTP_FROM_NAME=Sea Ocean

# Configurações adicionais do Supabase
SUPABASE_JWT_SECRET=1shkeuhjsrcyvvfhqnpezauxxjvpmfku
SUPABASE_DASHBOARD_URL=http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me:3000

# Configurações de desenvolvimento
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:9002

# Configurações de autenticação
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:9002/dashboard
NEXT_PUBLIC_AUTH_SIGNUP_REDIRECT_URL=http://localhost:9002/dashboard
```

### 3. **Credenciais de Login**

#### ✅ **Usuário Principal (Configurado)**
- **Email**: `ehbeckman@gmail.com`
- **Senha**: `123456`
- **Perfil**: Administrador

#### 📝 **Outros Usuários Disponíveis**
- **Email**: `admin@offshore.com`
- **Senha**: `password123`
- **Perfil**: Administrador

- **Email**: `ana.silva@offshore.com`
- **Senha**: `password123`
- **Perfil**: Aluno

### 4. **Testar Aplicação**

```bash
# Iniciar aplicação
npm run dev

# Acessar no navegador
http://localhost:9002
```

### 5. **Migração para Supabase (Opcional)**

Quando o Supabase estiver funcionando corretamente:

```bash
# Criar usuário no Supabase
node scripts/create-user.js create

# Migrar dados
node scripts/migrate-to-supabase.js full
```

## 🔗 URLs Importantes

- **Aplicação**: http://localhost:9002
- **Supabase Studio**: http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me:3000
- **API REST**: http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me/
- **Email de Teste**: http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me:54324

## 🛠️ Troubleshooting

### Problema: Erro de Conexão com Supabase
```bash
# Verificar se o Supabase está rodando
curl http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me/

# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Problema: Erro de Login
- Verificar se o arquivo `.env.local` existe
- Verificar se as credenciais estão corretas
- Verificar se o usuário existe no sistema

### Problema: Email não funciona
- Verificar configurações SMTP no `.env.local`
- Testar conexão SMTP
- Verificar logs do servidor

## 📞 Suporte

Para problemas técnicos:
- 📖 [Documentação de Migração](docs/migracao-supabase.md)
- 🛠️ [Scripts de Setup](scripts/)
- 🔧 [Configuração](supabase/config.toml)

---

**✅ Ambiente configurado e pronto para uso!** 