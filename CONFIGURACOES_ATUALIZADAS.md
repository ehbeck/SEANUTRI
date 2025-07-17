# Configurações Atualizadas do Supabase

## 📋 Resumo das Alterações

O arquivo `.env.local` foi atualizado com as novas configurações do Supabase self-hosted. Todas as URLs, chaves e configurações foram atualizadas para usar o novo domínio `seanutri-supabase-2fbf63-147-93-35-21.traefik.me`.

## 🔧 Configurações Principais

### URLs do Supabase
- **URL Principal**: `http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me`
- **URL do Dashboard**: `http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me:3000`
- **URL da API**: `http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me`

### Chaves de Autenticação
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTIwNzg0NjUsImV4cCI6MTc4MzYxNDQ2NSwiaXNzIjoic3VwYWJhc2UiLCJyb2xlIjoiYW5vbiJ9.g7ryZ6Qp2oHoTbcp5VmGxR0o_WR9QEMxeWxJ38N1eIg`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTIwNzg0NjUsImV4cCI6MTc4MzYxNDQ2NSwiaXNzIjoic3VwYWJhc2UiLCJyb2xlIjoic2VydmljZV9yb2xlIn0.H2zdpbLf-jFt4G9iuP8DdOovaZwysTjvAOnZykpOZKo`
- **JWT Secret**: `1shkeuhjsrcyvvfhqnpezauxxjvpmfku`

### Configurações do Banco de Dados
- **Host**: `seanutri-supabase-2fbf63-147-93-35-21.traefik.me`
- **Porta**: `5432`
- **Database**: `postgres`
- **Usuário**: `postgres`
- **Senha**: `3usnin88ocgnowvpfuaiz4zfkbjnr6cs`

### Configurações SMTP (Hostinger)
- **Host**: `smtp.hostinger.com`
- **Porta**: `465` (SSL/TLS)
- **Usuário**: `admin@seaocean.com.br`
- **Senha**: `ifoP@(ie09jasp`
- **Remetente**: `Sea Ocean`

### Credenciais do Dashboard
- **Usuário**: `supabase`
- **Senha**: `svvocankqzmfqztw0xivqtuqh11afxaj`

## 🔐 Configurações de Segurança

### Chaves de Segurança
- **Secret Key Base**: `0mecakkmgjaqylmszxpox540xlfwvqnaqyxcj08b5f3d1esfsffkxchmkza4kxkw`
- **Vault Enc Key**: `sxrz4tdjc2qatwy5xp5cjnyjvacmx7ux`

### Configurações do Kong (Proxy)
- **HTTP Port**: `8000`
- **HTTPS Port**: `8443`

### Configurações do Pooler
- **Porta**: `6543`
- **Pool Size**: `20`
- **Max Connections**: `100`

## 📧 Configurações de Email

### URLs do Mailer
- **Confirmação**: `/auth/v1/verify`
- **Convite**: `/auth/v1/verify`
- **Recuperação**: `/auth/v1/verify`
- **Mudança de Email**: `/auth/v1/verify`

### Configurações GoTrue SMTP
- **Host**: `smtp.hostinger.com`
- **Porta**: `465`
- **TLS**: Habilitado
- **Email Externo**: Habilitado

## 🔄 Configurações de Autenticação

### URLs de Redirecionamento
- **Site URL**: `http://localhost:9002`
- **Redirect URLs**: 
  - `http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me/*`
  - `http://localhost:9002/*`

### Configurações de Telefone
- **Signup por Telefone**: Habilitado
- **Auto-confirmação**: Habilitado

## 📊 Configurações de Logs

### Logflare
- **API Key**: `kftyx2fynanoko5uaacwytl37xxoihye`
- **Backend API Key**: `your-super-secret-and-long-logflare-key`

## 🐳 Configurações do Docker

### Socket Location
- **Docker Socket**: `/var/run/docker.sock`

## 📝 Variáveis de Ambiente Atualizadas

O arquivo `.env.local` contém todas as seguintes variáveis:

```bash
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configurações do Banco de Dados
SUPABASE_DB_HOST=seanutri-supabase-2fbf63-147-93-35-21.traefik.me
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=3usnin88ocgnowvpfuaiz4zfkbjnr6cs

# JWT Secret
SUPABASE_JWT_SECRET=1shkeuhjsrcyvvfhqnpezauxxjvpmfku

# Configurações SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@seaocean.com.br
SMTP_PASS=ifoP@(ie09jasp
SMTP_FROM_EMAIL=admin@seaocean.com.br
SMTP_FROM_NAME=Sea Ocean

# E muito mais...
```

## ✅ Status das Atualizações

- ✅ Arquivo `.env.local` atualizado
- ✅ Configuração do Supabase (`src/lib/supabase.ts`) atualizada
- ✅ Hook de status do Supabase mantido (já estava correto)
- ✅ Pacote `nodemailer` instalado
- ✅ Todas as URLs atualizadas para o novo domínio

## 🚀 Próximos Passos

1. **Reiniciar o servidor** para carregar as novas variáveis de ambiente
2. **Testar a conexão** com o Supabase através do componente de status
3. **Verificar o envio de emails** usando as configurações SMTP
4. **Executar os scripts SQL** para criar o banco de dados
5. **Testar a autenticação** com o usuário administrador

## 🔍 Verificação

Para verificar se tudo está funcionando:

1. Acesse `http://localhost:9002`
2. Verifique o badge de status do Supabase no cabeçalho
3. Tente fazer login com `ehbeckman@gmail.com` e senha `123456`
4. Verifique se o dashboard carrega corretamente

## 📞 Suporte

Se houver problemas:
1. Verifique os logs do servidor
2. Confirme se o Supabase está rodando
3. Teste a conectividade com `ping seanutri-supabase-2fbf63-147-93-35-21.traefik.me`
4. Verifique as configurações de firewall e rede 