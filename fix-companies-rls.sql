-- Script para corrigir políticas RLS da tabela z_companies
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe e tem dados
SELECT COUNT(*) as total_companies FROM z_companies;

-- 2. Verificar políticas RLS atuais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'z_companies';

-- 3. Desabilitar RLS temporariamente para inserir dados
ALTER TABLE z_companies DISABLE ROW LEVEL SECURITY;

-- 4. Inserir dados de exemplo se a tabela estiver vazia
INSERT INTO z_companies (id, name, contact, status, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Offshore Solutions Inc.',
    'contato@offshore.com',
    'Ativa',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM z_companies WHERE name = 'Offshore Solutions Inc.');

INSERT INTO z_companies (id, name, contact, status, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Petrobras',
    'rh@petrobras.com',
    'Ativa',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM z_companies WHERE name = 'Petrobras');

INSERT INTO z_companies (id, name, contact, status, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Shell Brasil',
    'contato@shell.com',
    'Ativa',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM z_companies WHERE name = 'Shell Brasil');

INSERT INTO z_companies (id, name, contact, status, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'ExxonMobil',
    'rh@exxonmobil.com',
    'Ativa',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM z_companies WHERE name = 'ExxonMobil');

INSERT INTO z_companies (id, name, contact, status, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Chevron',
    'contato@chevron.com',
    'Ativa',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM z_companies WHERE name = 'Chevron');

-- 5. Verificar dados inseridos
SELECT id, name, contact, status, created_at FROM z_companies ORDER BY name;

-- 6. Recriar políticas RLS adequadas
-- Política para permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON z_companies;
CREATE POLICY "Permitir leitura para usuários autenticados" ON z_companies
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para permitir inserção para administradores
DROP POLICY IF EXISTS "Permitir inserção para administradores" ON z_companies;
CREATE POLICY "Permitir inserção para administradores" ON z_companies
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM z_profiles 
            WHERE id = auth.uid() 
            AND profile = 'Administrador'
        )
    );

-- Política para permitir atualização para administradores
DROP POLICY IF EXISTS "Permitir atualização para administradores" ON z_companies;
CREATE POLICY "Permitir atualização para administradores" ON z_companies
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM z_profiles 
            WHERE id = auth.uid() 
            AND profile = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM z_profiles 
            WHERE id = auth.uid() 
            AND profile = 'Administrador'
        )
    );

-- Política para permitir exclusão para administradores
DROP POLICY IF EXISTS "Permitir exclusão para administradores" ON z_companies;
CREATE POLICY "Permitir exclusão para administradores" ON z_companies
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM z_profiles 
            WHERE id = auth.uid() 
            AND profile = 'Administrador'
        )
    );

-- 7. Reabilitar RLS
ALTER TABLE z_companies ENABLE ROW LEVEL SECURITY;

-- 8. Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'z_companies'
ORDER BY policyname;

-- 9. Teste final - verificar se os dados estão acessíveis
SELECT COUNT(*) as total_companies FROM z_companies; 