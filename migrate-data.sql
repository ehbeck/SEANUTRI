-- =====================================================
-- SCRIPT DE MIGRAÇÃO DE DADOS PARA SUPABASE
-- Use este script para migrar dados existentes
-- =====================================================

-- ⚠️  IMPORTANTE: Execute este script APÓS executar o supabase-migration.sql
-- ⚠️  Ajuste os dados conforme necessário para seu ambiente

-- =====================================================
-- 1. MIGRAÇÃO DE EMPRESAS
-- =====================================================

-- Exemplo de inserção de empresas (ajuste conforme seus dados)
INSERT INTO z_companies (id, name, contact, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sea Ocean Ltda', 'contato@seaocean.com.br', 'Ativa', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Tech Solutions', 'contato@techsolutions.com', 'Ativa', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Inovação Digital', 'contato@inovacao.com', 'Ativa', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. MIGRAÇÃO DE INSTRUTORES
-- =====================================================

-- Exemplo de inserção de instrutores (ajuste conforme seus dados)
INSERT INTO z_instructors (id, name, email, specialization, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'João Silva', 'joao.silva@exemplo.com', 'Desenvolvimento Web', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Maria Santos', 'maria.santos@exemplo.com', 'Design UX/UI', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Pedro Costa', 'pedro.costa@exemplo.com', 'Marketing Digital', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. MIGRAÇÃO DE CURSOS
-- =====================================================

-- Exemplo de inserção de cursos (ajuste conforme seus dados)
INSERT INTO z_courses (id, title, description, instructor_id, syllabus, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Introdução ao React', 'Curso básico de React para iniciantes', '660e8400-e29b-41d4-a716-446655440001', ARRAY['Fundamentos do React', 'Componentes', 'Hooks', 'Estado e Props'], NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', 'Design de Interfaces', 'Princípios de design para interfaces modernas', '660e8400-e29b-41d4-a716-446655440002', ARRAY['Princípios de Design', 'Ferramentas', 'Prototipagem', 'Testes de Usabilidade'], NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', 'Marketing Digital', 'Estratégias de marketing para o mundo digital', '660e8400-e29b-41d4-a716-446655440003', ARRAY['Fundamentos do Marketing', 'Redes Sociais', 'SEO', 'Analytics'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. MIGRAÇÃO DE USUÁRIOS/PERFIS
-- =====================================================

-- ⚠️  IMPORTANTE: Os usuários devem ser criados primeiro no Supabase Auth
-- ⚠️  Use o UUID retornado pelo Supabase Auth para inserir o perfil

-- Exemplo de inserção de perfis (substitua pelos UUIDs reais dos usuários)
/*
INSERT INTO z_profiles (id, name, email, profile, company_id, status, updated_at) VALUES
('UUID_DO_USUARIO_1', 'Ana Silva', 'ana.silva@exemplo.com', 'Aluno', '550e8400-e29b-41d4-a716-446655440001', 'Ativo', NOW()),
('UUID_DO_USUARIO_2', 'Carlos Oliveira', 'carlos.oliveira@exemplo.com', 'Aluno', '550e8400-e29b-41d4-a716-446655440001', 'Ativo', NOW()),
('UUID_DO_USUARIO_3', 'Lucia Ferreira', 'lucia.ferreira@exemplo.com', 'Gestor de Empresa', '550e8400-e29b-41d4-a716-446655440002', 'Ativo', NOW())
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- 5. MIGRAÇÃO DE MATRÍCULAS
-- =====================================================

-- Exemplo de inserção de matrículas (substitua pelos UUIDs reais)
/*
INSERT INTO z_enrollments (user_id, course_id, status, grade, approved, created_at, updated_at) VALUES
('UUID_DO_USUARIO_1', '770e8400-e29b-41d4-a716-446655440001', 'Em Progresso', 85.5, TRUE, NOW(), NOW()),
('UUID_DO_USUARIO_1', '770e8400-e29b-41d4-a716-446655440002', 'Não Iniciado', NULL, FALSE, NOW(), NOW()),
('UUID_DO_USUARIO_2', '770e8400-e29b-41d4-a716-446655440001', 'Concluído', 92.0, TRUE, NOW(), NOW()),
('UUID_DO_USUARIO_2', '770e8400-e29b-41d4-a716-446655440003', 'Em Progresso', 78.0, FALSE, NOW(), NOW())
ON CONFLICT (user_id, course_id) DO NOTHING;
*/

-- =====================================================
-- 6. MIGRAÇÃO DE TURMAS AGENDADAS
-- =====================================================

-- Exemplo de inserção de turmas agendadas
INSERT INTO z_scheduled_classes (id, course_id, instructor_id, scheduled_date, start_time, end_time, location_type, location, status, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-01-15', '14:00:00', '16:00:00', 'Online', 'Zoom Meeting', 'Agendada', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2024-01-20', '09:00:00', '12:00:00', 'Presencial', 'Sala de Treinamento A', 'Agendada', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-01-25', '19:00:00', '21:00:00', 'Online', 'Google Meet', 'Agendada', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. MIGRAÇÃO DE ALUNOS EM TURMAS
-- =====================================================

-- Exemplo de associação de alunos às turmas (substitua pelos UUIDs reais)
/*
INSERT INTO z_scheduled_class_students (scheduled_class_id, student_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'UUID_DO_USUARIO_1'),
('880e8400-e29b-41d4-a716-446655440001', 'UUID_DO_USUARIO_2'),
('880e8400-e29b-41d4-a716-446655440002', 'UUID_DO_USUARIO_1'),
('880e8400-e29b-41d4-a716-446655440003', 'UUID_DO_USUARIO_2')
ON CONFLICT (scheduled_class_id, student_id) DO NOTHING;
*/

-- =====================================================
-- 8. MIGRAÇÃO DE LOGS
-- =====================================================

-- Exemplo de inserção de logs (opcional)
INSERT INTO z_login_log (user_name, company_name, timestamp) VALUES
('Sistema', 'Sistema', NOW() - INTERVAL '1 day'),
('Sistema', 'Sistema', NOW() - INTERVAL '2 days'),
('Sistema', 'Sistema', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. VERIFICAÇÃO DOS DADOS MIGRADOS
-- =====================================================

-- Verificar contagem de registros em cada tabela
SELECT 'z_companies' as tabela, COUNT(*) as total FROM z_companies
UNION ALL
SELECT 'z_instructors' as tabela, COUNT(*) as total FROM z_instructors
UNION ALL
SELECT 'z_courses' as tabela, COUNT(*) as total FROM z_courses
UNION ALL
SELECT 'z_profiles' as tabela, COUNT(*) as total FROM z_profiles
UNION ALL
SELECT 'z_enrollments' as tabela, COUNT(*) as total FROM z_enrollments
UNION ALL
SELECT 'z_scheduled_classes' as tabela, COUNT(*) as total FROM z_scheduled_classes
UNION ALL
SELECT 'z_scheduled_class_students' as tabela, COUNT(*) as total FROM z_scheduled_class_students
UNION ALL
SELECT 'z_roles' as tabela, COUNT(*) as total FROM z_roles
UNION ALL
SELECT 'z_permissions' as tabela, COUNT(*) as total FROM z_permissions
UNION ALL
SELECT 'z_role_permissions' as tabela, COUNT(*) as total FROM z_role_permissions
ORDER BY tabela;

-- =====================================================
-- 10. SCRIPT PARA CRIAR USUÁRIO ADMINISTRADOR
-- =====================================================

/*
-- Execute este comando no Supabase Auth para criar um usuário administrador:

-- 1. Vá para Authentication > Users no painel do Supabase
-- 2. Clique em "Add User"
-- 3. Preencha os dados:
--    Email: admin@exemplo.com
--    Password: (senha segura)
--    User Metadata: {"name": "Administrador", "profile": "Administrador"}

-- 4. Após criar o usuário, copie o UUID e execute:

INSERT INTO z_profiles (id, name, email, profile, status) VALUES (
    'UUID_DO_USUARIO_ADMIN', -- Substitua pelo UUID real
    'Administrador',
    'admin@exemplo.com',
    'Administrador',
    'Ativo'
);

-- 5. Verifique se o usuário foi criado:
SELECT * FROM z_profiles WHERE email = 'admin@exemplo.com';
*/

-- =====================================================
-- MIGRAÇÃO DE DADOS CONCLUÍDA!
-- =====================================================

/*
PRÓXIMOS PASSOS APÓS A MIGRAÇÃO:

1. ✅ Verifique se todos os dados foram migrados corretamente
2. 🔐 Teste o login com o usuário administrador
3. 🧪 Teste as funcionalidades principais do sistema
4. 📊 Verifique se as políticas de segurança estão funcionando
5. 🔄 Configure backups automáticos
6. 📈 Configure monitoramento e alertas

COMANDOS ÚTEIS PARA VERIFICAÇÃO:

-- Verificar usuários e seus perfis
SELECT p.name, p.email, p.profile, c.name as company 
FROM z_profiles p 
LEFT JOIN z_companies c ON p.company_id = c.id;

-- Verificar matrículas
SELECT p.name, c.title, e.status, e.grade 
FROM z_enrollments e 
JOIN z_profiles p ON e.user_id = p.id 
JOIN z_courses c ON e.course_id = c.id;

-- Verificar turmas agendadas
SELECT c.title, i.name as instructor, sc.scheduled_date, sc.location 
FROM z_scheduled_classes sc 
JOIN z_courses c ON sc.course_id = c.id 
JOIN z_instructors i ON sc.instructor_id = i.id;
*/ 