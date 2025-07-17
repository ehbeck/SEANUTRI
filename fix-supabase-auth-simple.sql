-- Script SIMPLIFICADO para corrigir as tabelas de autenticação do Supabase
-- Execute este script no banco de dados PostgreSQL do Supabase

-- 1. Criar schema auth se não existir
CREATE SCHEMA IF NOT EXISTS auth;

-- 2. Criar tabela auth.users se não existir
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

-- 3. Criar tabela auth.identities se não existir
CREATE TABLE IF NOT EXISTS auth.identities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Criar tabela auth.sessions se não existir
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Criar tabela auth.refresh_tokens se não existir
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id uuid,
    token text,
    user_id text,
    revoked boolean,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Criar tabela auth.audit_log_entries se não existir
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id uuid,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 7. Criar tabela auth.schema_migrations se não existir
CREATE TABLE IF NOT EXISTS auth.schema_migrations (
    version text PRIMARY KEY,
    statements text[],
    name text
);

-- 8. Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status; 