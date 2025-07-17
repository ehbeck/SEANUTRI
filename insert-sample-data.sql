-- =====================================================
-- SCRIPT PARA INSERIR DADOS DE EXEMPLO
-- Execute este script APÓS executar o create-supabase-database.sql
-- =====================================================

-- ⚠️  IMPORTANTE: Execute este script no SQL Editor do Supabase
-- ⚠️  Este script insere dados de exemplo para testar o sistema

-- =====================================================
-- 1. INSERIR EMPRESAS DE EXEMPLO
-- =====================================================

INSERT INTO z_companies (id, name, contact, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sea Ocean Ltda', 'contato@seaocean.com.br', 'Ativa', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Tech Solutions', 'contato@techsolutions.com', 'Ativa', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Inovação Digital', 'contato@inovacao.com', 'Ativa', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Educação Futuro', 'contato@educacaofuturo.com', 'Ativa', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. INSERIR INSTRUTORES DE EXEMPLO
-- =====================================================

INSERT INTO z_instructors (id, name, email, specialization, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'João Silva', 'joao.silva@exemplo.com', 'Desenvolvimento Web', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Maria Santos', 'maria.santos@exemplo.com', 'Design UX/UI', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Pedro Costa', 'pedro.costa@exemplo.com', 'Marketing Digital', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'Ana Oliveira', 'ana.oliveira@exemplo.com', 'Gestão de Projetos', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', 'Carlos Ferreira', 'carlos.ferreira@exemplo.com', 'Análise de Dados', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. INSERIR CURSOS DE EXEMPLO
-- =====================================================

INSERT INTO z_courses (id, title, description, instructor_id, syllabus, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Introdução ao React', 'Curso básico de React para iniciantes. Aprenda os fundamentos da biblioteca mais popular do JavaScript.', '660e8400-e29b-41d4-a716-446655440001', ARRAY['Fundamentos do React', 'Componentes', 'Hooks', 'Estado e Props', 'Roteamento', 'Integração com APIs'], NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', 'Design de Interfaces', 'Princípios de design para interfaces modernas e responsivas.', '660e8400-e29b-41d4-a716-446655440002', ARRAY['Princípios de Design', 'Ferramentas de Design', 'Prototipagem', 'Testes de Usabilidade', 'Design System'], NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', 'Marketing Digital', 'Estratégias de marketing para o mundo digital.', '660e8400-e29b-41d4-a716-446655440003', ARRAY['Fundamentos do Marketing', 'Redes Sociais', 'SEO', 'Analytics', 'Email Marketing'], NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440004', 'Gestão de Projetos', 'Metodologias e ferramentas para gerenciar projetos com eficiência.', '660e8400-e29b-41d4-a716-446655440004', ARRAY['Metodologias Ágeis', 'Planejamento', 'Execução', 'Monitoramento', 'Encerramento'], NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440005', 'Análise de Dados', 'Técnicas e ferramentas para análise e visualização de dados.', '660e8400-e29b-41d4-a716-446655440005', ARRAY['Coleta de Dados', 'Limpeza de Dados', 'Análise Exploratória', 'Visualização', 'Storytelling'], NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440006', 'TypeScript Avançado', 'Aprofunde seus conhecimentos em TypeScript.', '660e8400-e29b-41d4-a716-446655440001', ARRAY['Tipos Avançados', 'Generics', 'Decorators', 'Modules', 'Integração com Frameworks'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. INSERIR TURMAS AGENDADAS
-- =====================================================

INSERT INTO z_scheduled_classes (id, course_id, instructor_id, scheduled_date, start_time, end_time, location_type, location, status, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-02-15', '14:00:00', '16:00:00', 'Online', 'Zoom Meeting', 'Agendada', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2024-02-20', '09:00:00', '12:00:00', 'Presencial', 'Sala de Treinamento A', 'Agendada', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-02-25', '19:00:00', '21:00:00', 'Online', 'Google Meet', 'Agendada', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '2024-03-01', '10:00:00', '13:00:00', 'Presencial', 'Sala de Treinamento B', 'Agendada', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', '2024-03-05', '15:00:00', '17:00:00', 'Online', 'Microsoft Teams', 'Agendada', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. INSERIR LOGS DE EXEMPLO
-- =====================================================

INSERT INTO z_login_log (user_name, company_name, timestamp) VALUES
('Sistema', 'Sistema', NOW() - INTERVAL '1 day'),
('Sistema', 'Sistema', NOW() - INTERVAL '2 days'),
('Sistema', 'Sistema', NOW() - INTERVAL '3 days'),
('Sistema', 'Sistema', NOW() - INTERVAL '4 days'),
('Sistema', 'Sistema', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

-- Verificar contagem de registros em cada tabela
SELECT 'z_companies' as tabela, COUNT(*) as total FROM z_companies
UNION ALL
SELECT 'z_instructors' as tabela, COUNT(*) as total FROM z_instructors
UNION ALL
SELECT 'z_courses' as tabela, COUNT(*) as total FROM z_courses
UNION ALL
SELECT 'z_scheduled_classes' as tabela, COUNT(*) as total FROM z_scheduled_classes
UNION ALL
SELECT 'z_login_log' as tabela, COUNT(*) as total FROM z_login_log
ORDER BY tabela;

-- =====================================================
-- 7. COMANDOS ÚTEIS PARA TESTE
-- =====================================================

-- Verificar cursos e seus instrutores
SELECT 
    c.title,
    c.description,
    i.name as instructor,
    i.specialization
FROM z_courses c
JOIN z_instructors i ON c.instructor_id = i.id
ORDER BY c.title;

-- Verificar turmas agendadas
SELECT 
    c.title as course,
    i.name as instructor,
    sc.scheduled_date,
    sc.start_time,
    sc.end_time,
    sc.location_type,
    sc.location
FROM z_scheduled_classes sc
JOIN z_courses c ON sc.course_id = c.id
JOIN z_instructors i ON sc.instructor_id = i.id
ORDER BY sc.scheduled_date, sc.start_time;

-- Verificar empresas
SELECT 
    name,
    contact,
    status,
    created_at
FROM z_companies
ORDER BY name;

-- =====================================================
-- DADOS DE EXEMPLO INSERIDOS COM SUCESSO!
-- =====================================================

/*
PRÓXIMOS PASSOS:

1. ✅ Execute este script no SQL Editor do Supabase
2. 👤 Crie usuários no Supabase Auth
3. 🔗 Associe os usuários aos perfis na tabela z_profiles
4. 📝 Crie matrículas para testar o sistema
5. 🧪 Teste todas as funcionalidades

DADOS INSERIDOS:

✅ 4 Empresas
✅ 5 Instrutores
✅ 6 Cursos com syllabus completo
✅ 5 Turmas agendadas
✅ 5 Logs de sistema
✅ Dados de teste para todas as funcionalidades

NOTA: Os usuários e matrículas devem ser criados manualmente
após a criação dos usuários no Supabase Auth.
*/ 