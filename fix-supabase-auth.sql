-- Script para corrigir as tabelas de autenticação do Supabase
-- Execute este script no banco de dados PostgreSQL do Supabase

-- 1. Verificar se o schema auth existe
CREATE SCHEMA IF NOT EXISTS auth;

-- 2. Criar a tabela auth.identities se não existir
CREATE TABLE IF NOT EXISTS auth.identities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(provider, identity_data)
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS identities_user_id_idx ON auth.identities(user_id);
CREATE INDEX IF NOT EXISTS identities_provider_idx ON auth.identities(provider);

-- 4. Verificar se a tabela auth.users existe
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

-- 5. Criar índices para auth.users
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users(instance_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users(email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON auth.users(phone);

-- 6. Verificar se a tabela auth.sessions existe
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 7. Criar índices para auth.sessions
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON auth.sessions(expires_at);

-- 8. Verificar se a tabela auth.refresh_tokens existe
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id uuid,
    token text,
    user_id text,
    revoked boolean,
    created_at timestamp with time zone DEFAULT now()
);

-- 9. Criar índices para auth.refresh_tokens
CREATE INDEX IF NOT EXISTS refresh_tokens_instance_id_idx ON auth.refresh_tokens(instance_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON auth.refresh_tokens(token);

-- 10. Verificar se a tabela auth.audit_log_entries existe
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id uuid,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 11. Criar índices para auth.audit_log_entries
CREATE INDEX IF NOT EXISTS audit_log_entries_instance_id_idx ON auth.audit_log_entries(instance_id);
CREATE INDEX IF NOT EXISTS audit_log_entries_created_at_idx ON auth.audit_log_entries(created_at);

-- 12. Verificar se a tabela auth.schema_migrations existe
CREATE TABLE IF NOT EXISTS auth.schema_migrations (
    version text PRIMARY KEY,
    statements text[],
    name text
);

-- 13. Inserir migrações básicas se não existirem
INSERT INTO auth.schema_migrations (version, statements, name) 
VALUES 
    ('20171026211338', ARRAY['CREATE SCHEMA IF NOT EXISTS auth;'], 'initial'),
    ('20171026212642', ARRAY['CREATE TABLE IF NOT EXISTS auth.users (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, instance_id uuid, aud text, role text, email text, encrypted_password text, email_confirmed_at timestamp with time zone, invited_at timestamp with time zone, confirmation_token text, confirmation_sent_at timestamp with time zone, recovery_token text, recovery_sent_at timestamp with time zone, email_change_token_new text, email_change text, email_change_sent_at timestamp with time zone, last_sign_in_at timestamp with time zone, raw_app_meta_data jsonb, raw_user_meta_data jsonb, is_super_admin boolean, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(), phone text, phone_confirmed_at timestamp with time zone, phone_change text, phone_change_token text, phone_change_sent_at timestamp with time zone, confirmed_at timestamp with time zone, email_change_token_current text, email_change_confirm_status smallint DEFAULT 0, banned_until timestamp with time zone, reauthentication_token text, reauthentication_sent_at timestamp with time zone);'], 'create_users_table'),
    ('20171026212643', ARRAY['CREATE TABLE IF NOT EXISTS auth.identities (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, identity_data jsonb NOT NULL, provider text NOT NULL, last_sign_in_at timestamp with time zone, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(), UNIQUE(provider, identity_data));'], 'create_identities_table')
ON CONFLICT (version) DO NOTHING;

-- 14. Verificar se as tabelas foram criadas corretamente
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'auth' 
ORDER BY table_name;

-- 15. Verificar se há dados nas tabelas
SELECT 'users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'identities' as table_name, COUNT(*) as count FROM auth.identities
UNION ALL
SELECT 'sessions' as table_name, COUNT(*) as count FROM auth.sessions; 