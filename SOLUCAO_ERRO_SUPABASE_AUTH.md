# Solução para Erro de Autenticação do Supabase

## Problema Identificado
O erro "Error running SQL query" estava sendo causado por uma coluna duplicada `id` na tabela `auth.audit_log_entries`.

## Soluções Disponíveis

### Opção 1: Script Simplificado (RECOMENDADO)
Use o arquivo `fix-supabase-auth-simple.sql` que foi corrigido e simplificado.

### Opção 2: Script Completo Corrigido
Use o arquivo `fix-supabase-auth.sql` que foi corrigido.

## Como Executar

### Passo 1: Acesse o Dashboard do Supabase
1. Abra o dashboard do Supabase
2. Vá para a seção "SQL Editor"
3. Clique em "New query"

### Passo 2: Execute o Script
1. Copie o conteúdo do arquivo `fix-supabase-auth-simple.sql`
2. Cole no editor SQL
3. Clique em "Run" para executar

### Passo 3: Verifique o Resultado
O script deve retornar: "Tabelas criadas com sucesso!"

## Se Ainda Houver Erro

### Verificação Manual das Tabelas
Execute este comando para verificar quais tabelas já existem:

```sql
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'auth' 
ORDER BY table_name;
```

### Execução em Partes
Se o script completo falhar, execute cada parte separadamente:

#### Parte 1: Schema e Tabela Users
```sql
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id uuid,
    aud text,
    role text,
    email text,
    encrypted_password text,
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token text,
    confirmation_sent_at timestamp with time zone,
    recovery_token text,
    recovery_sent_at timestamp with time zone,
    email_change_token_new text,
    email_change text,
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    phone text,
    phone_confirmed_at timestamp with time zone,
    phone_change text,
    phone_change_token text,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    email_change_token_current text,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token text,
    reauthentication_sent_at timestamp with time zone
);
```

#### Parte 2: Tabela Identities
```sql
CREATE TABLE IF NOT EXISTS auth.identities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

#### Parte 3: Outras Tabelas
```sql
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id uuid,
    token text,
    user_id text,
    revoked boolean,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id uuid,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);
```

## Verificação Final

Após executar o script, verifique se as tabelas foram criadas:

```sql
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'auth' 
ORDER BY table_name;
```

Você deve ver as seguintes tabelas:
- auth.audit_log_entries
- auth.identities
- auth.refresh_tokens
- auth.schema_migrations
- auth.sessions
- auth.users

## Teste de Autenticação

Após criar as tabelas, teste o login no sistema:
1. Acesse a página de login
2. Use o email: `ehbeckman@gmail.com`
3. Use a senha: `123456`

## Se o Problema Persistir

1. **Verifique os logs do Supabase**:
   - Acesse o dashboard do Supabase
   - Vá para "Logs" > "Database"
   - Procure por erros relacionados às tabelas auth

2. **Reinicie o Supabase**:
   ```bash
   # Se estiver usando Docker
   docker-compose restart
   ```

3. **Verifique as configurações**:
   - Confirme que as variáveis de ambiente estão corretas
   - Verifique se a URL do Supabase está acessível

## Contato para Suporte

Se o problema persistir, forneça:
- O erro exato que aparece
- O resultado da verificação das tabelas
- Os logs do Supabase 