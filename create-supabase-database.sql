-- =====================================================
-- SCRIPT COMPLETO PARA CRIAR BANCO DE DADOS NO SUPABASE
-- Sistema de Gestão de Cursos e Treinamentos
-- =====================================================

-- ⚠️  IMPORTANTE: Execute este script no SQL Editor do Supabase
-- ⚠️  Este script cria toda a estrutura do banco de dados

-- =====================================================
-- 1. LIMPEZA E PREPARAÇÃO
-- =====================================================

-- Apaga tabelas existentes para uma reinicialização limpa
DROP TABLE IF EXISTS 
    z_enrollments, 
    z_scheduled_class_students, 
    z_scheduled_classes, 
    z_courses, 
    z_instructors, 
    z_profiles, 
    z_companies, 
    z_role_permissions, 
    z_permissions, 
    z_roles,
    z_certificate_settings,
    z_notification_settings,
    z_login_log,
    z_notification_log
CASCADE;

-- Apaga tipos personalizados existentes
DROP TYPE IF EXISTS user_profile_type;
DROP TYPE IF EXISTS entity_status_type;
DROP TYPE IF EXISTS class_status_type;
DROP TYPE IF EXISTS class_location_type;
DROP TYPE IF EXISTS enrollment_status_type;

-- Apaga funções existentes
DROP FUNCTION IF EXISTS get_my_profile_type();
DROP FUNCTION IF EXISTS get_my_company_id();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_user();

-- =====================================================
-- 2. CRIAÇÃO DOS TIPOS ENUM
-- =====================================================

-- Cria ENUMs (tipos personalizados) para consistência
CREATE TYPE user_profile_type AS ENUM ('Administrador', 'Aluno', 'Instrutor', 'Gestor de Empresa');
CREATE TYPE entity_status_type AS ENUM ('Ativa', 'Inativa', 'Ativo', 'Inativo');
CREATE TYPE class_status_type AS ENUM ('Agendada', 'Concluída');
CREATE TYPE class_location_type AS ENUM ('Presencial', 'Online');
CREATE TYPE enrollment_status_type AS ENUM ('Não Iniciado', 'Em Progresso', 'Concluído');

-- =====================================================
-- 3. CRIAÇÃO DAS TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Empresas
CREATE TABLE z_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    status entity_status_type NOT NULL DEFAULT 'Ativa',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_companies IS 'Armazena informações sobre as empresas parceiras.';

-- Tabela de Perfis de Usuário (ligada à autenticação do Supabase)
CREATE TABLE z_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    profile user_profile_type NOT NULL DEFAULT 'Aluno',
    company_id UUID REFERENCES z_companies(id),
    status entity_status_type NOT NULL DEFAULT 'Ativo',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_profiles IS 'Dados de perfil para usuários autenticados.';

-- Tabela de Instrutores
CREATE TABLE z_instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    specialization TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_instructors IS 'Armazena informações sobre os instrutores dos cursos.';

-- Tabela de Cursos
CREATE TABLE z_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    hint TEXT,
    instructor_id UUID REFERENCES z_instructors(id),
    syllabus TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_courses IS 'Catálogo de cursos oferecidos.';

-- Tabela de Matrículas (Conecta usuários e cursos)
CREATE TABLE z_enrollments (
    user_id UUID NOT NULL REFERENCES z_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES z_courses(id) ON DELETE CASCADE,
    status enrollment_status_type NOT NULL DEFAULT 'Não Iniciado',
    grade NUMERIC(4, 2),
    approved BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    verification_code TEXT,
    instructor_id UUID REFERENCES z_instructors(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, course_id)
);
COMMENT ON TABLE z_enrollments IS 'Tabela de associação que registra a inscrição de um usuário em um curso.';

-- Tabela de Turmas Agendadas
CREATE TABLE z_scheduled_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES z_courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES z_instructors(id),
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location_type class_location_type NOT NULL,
    location TEXT NOT NULL,
    status class_status_type NOT NULL DEFAULT 'Agendada',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_scheduled_classes IS 'Armazena informações sobre turmas agendadas para os cursos.';

-- Tabela de associação para alunos em turmas agendadas
CREATE TABLE z_scheduled_class_students (
    scheduled_class_id UUID NOT NULL REFERENCES z_scheduled_classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES z_profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (scheduled_class_id, student_id)
);
COMMENT ON TABLE z_scheduled_class_students IS 'Associa alunos a turmas específicas.';

-- =====================================================
-- 4. TABELAS DE CONFIGURAÇÕES
-- =====================================================

-- Configurações de Certificados
CREATE TABLE z_certificate_settings (
    id INT PRIMARY KEY DEFAULT 1, -- Garante uma única linha
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_certificate_settings IS 'Configurações globais para a geração de certificados.';

-- Configurações de Notificações
CREATE TABLE z_notification_settings (
    id INT PRIMARY KEY DEFAULT 1, -- Garante uma única linha
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_notification_settings IS 'Configurações globais para notificações por email.';

-- =====================================================
-- 5. SISTEMA DE CONTROLE DE ACESSO (RBAC)
-- =====================================================

-- Tabela de Perfis de Acesso
CREATE TABLE z_roles (
    name TEXT PRIMARY KEY,
    description TEXT NOT NULL
);
COMMENT ON TABLE z_roles IS 'Define os perfis de acesso do sistema (Ex: Administrador, Aluno).';

-- Tabela de Permissões
CREATE TABLE z_permissions (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL
);
COMMENT ON TABLE z_permissions IS 'Define as permissões granulares do sistema.';

-- Tabela de Associação de Permissões
CREATE TABLE z_role_permissions (
    role_name TEXT NOT NULL REFERENCES z_roles(name) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES z_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_name, permission_id)
);
COMMENT ON TABLE z_role_permissions IS 'Associa permissões a perfis.';

-- =====================================================
-- 6. TABELAS DE LOG E AUDITORIA
-- =====================================================

-- Log de Login
CREATE TABLE z_login_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES z_profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    company_name TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_login_log IS 'Registra tentativas de login dos usuários.';

-- Log de Notificações
CREATE TABLE z_notification_log (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL
);
COMMENT ON TABLE z_notification_log IS 'Registra envio de notificações por email.';

-- =====================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX idx_profiles_email ON z_profiles(email);
CREATE INDEX idx_profiles_company_id ON z_profiles(company_id);
CREATE INDEX idx_profiles_profile ON z_profiles(profile);
CREATE INDEX idx_enrollments_user_id ON z_enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON z_enrollments(course_id);
CREATE INDEX idx_enrollments_status ON z_enrollments(status);
CREATE INDEX idx_courses_instructor_id ON z_courses(instructor_id);
CREATE INDEX idx_scheduled_classes_course_id ON z_scheduled_classes(course_id);
CREATE INDEX idx_scheduled_classes_date ON z_scheduled_classes(scheduled_date);
CREATE INDEX idx_login_log_user_id ON z_login_log(user_id);
CREATE INDEX idx_login_log_timestamp ON z_login_log(timestamp);

-- Índices para busca por texto
CREATE INDEX idx_companies_name ON z_companies USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_instructors_name ON z_instructors USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_courses_title ON z_courses USING gin(to_tsvector('portuguese', title));

-- =====================================================
-- 8. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter o perfil do usuário logado
CREATE OR REPLACE FUNCTION get_my_profile_type()
RETURNS user_profile_type AS $$
DECLARE
    profile_type user_profile_type;
BEGIN
    SELECT profile INTO profile_type FROM z_profiles WHERE id = auth.uid();
    RETURN COALESCE(profile_type, 'Aluno'::user_profile_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter a empresa do usuário logado
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS UUID AS $$
DECLARE
    company_uuid UUID;
BEGIN
    SELECT company_id INTO company_uuid FROM z_profiles WHERE id = auth.uid();
    RETURN company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_z_companies_updated_at BEFORE UPDATE ON z_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_z_profiles_updated_at BEFORE UPDATE ON z_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_z_instructors_updated_at BEFORE UPDATE ON z_instructors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_z_courses_updated_at BEFORE UPDATE ON z_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_z_enrollments_updated_at BEFORE UPDATE ON z_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_z_scheduled_classes_updated_at BEFORE UPDATE ON z_scheduled_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_z_certificate_settings_updated_at BEFORE UPDATE ON z_certificate_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_z_notification_settings_updated_at BEFORE UPDATE ON z_notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Gatilho para criar um perfil quando um novo usuário se registra no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.z_profiles (id, name, email, profile, status, company_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
        new.email,
        COALESCE((new.raw_user_meta_data->>'profile')::user_profile_type, 'Aluno'::user_profile_type),
        'Ativo',
        CASE 
            WHEN new.raw_user_meta_data->>'company_id' IS NOT NULL 
            THEN (new.raw_user_meta_data->>'company_id')::UUID 
            ELSE NULL 
        END
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE z_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_scheduled_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_scheduled_class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_certificate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_login_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE z_notification_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- =====================================================

-- Políticas para Administradores (acesso total)
CREATE POLICY "Admins have full access" ON z_companies FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_profiles FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_instructors FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_courses FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_enrollments FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_scheduled_classes FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_scheduled_class_students FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_roles FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_permissions FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_role_permissions FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_certificate_settings FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_notification_settings FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_login_log FOR ALL USING (get_my_profile_type() = 'Administrador');
CREATE POLICY "Admins have full access" ON z_notification_log FOR ALL USING (get_my_profile_type() = 'Administrador');

-- Políticas para usuários comuns
CREATE POLICY "Users can view their own profile" ON z_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON z_profiles FOR UPDATE USING (id = auth.uid());

-- Políticas para Gestores de Empresa
CREATE POLICY "Company managers can view users from their company" ON z_profiles FOR SELECT USING (get_my_profile_type() = 'Gestor de Empresa' AND company_id = get_my_company_id());

-- Políticas de leitura pública para usuários autenticados
CREATE POLICY "Authenticated users can view companies" ON z_companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view courses" ON z_courses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view instructors" ON z_instructors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view roles and permissions" ON z_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view permissions" ON z_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view role_permissions" ON z_role_permissions FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para matrículas
CREATE POLICY "Users can view their own enrollments" ON z_enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Managers can view enrollments from their company" ON z_enrollments FOR SELECT USING (
    get_my_profile_type() = 'Gestor de Empresa' AND
    user_id IN (SELECT id FROM z_profiles WHERE company_id = get_my_company_id())
);

-- Políticas para turmas agendadas
CREATE POLICY "Authenticated users can view scheduled classes" ON z_scheduled_classes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view scheduled class students" ON z_scheduled_class_students FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- 12. DADOS INICIAIS
-- =====================================================

-- Inserir perfis de acesso básicos
INSERT INTO z_roles (name, description) VALUES
('Administrador', 'Acesso total a todas as funcionalidades.'),
('Instrutor', 'Acesso para gerenciar seus cursos e avaliar alunos.'),
('Aluno', 'Acesso para visualizar cursos e seu progresso.'),
('Gestor de Empresa', 'Acesso para visualizar relatórios da sua empresa.')
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões básicas
INSERT INTO z_permissions (id, label) VALUES
('users.view', 'Visualizar usuários'),
('users.edit', 'Editar usuários'),
('courses.view', 'Visualizar cursos'),
('courses.edit', 'Editar cursos'),
('enrollments.view', 'Visualizar matrículas'),
('enrollments.edit', 'Editar matrículas'),
('reports.view', 'Visualizar relatórios'),
('settings.edit', 'Editar configurações')
ON CONFLICT (id) DO NOTHING;

-- Associar permissões aos perfis
INSERT INTO z_role_permissions (role_name, permission_id) VALUES
-- Administrador (todas as permissões)
('Administrador', 'users.view'),
('Administrador', 'users.edit'),
('Administrador', 'courses.view'),
('Administrador', 'courses.edit'),
('Administrador', 'enrollments.view'),
('Administrador', 'enrollments.edit'),
('Administrador', 'reports.view'),
('Administrador', 'settings.edit'),
-- Instrutor
('Instrutor', 'courses.view'),
('Instrutor', 'enrollments.view'),
('Instrutor', 'enrollments.edit'),
-- Aluno
('Aluno', 'courses.view'),
('Aluno', 'enrollments.view'),
-- Gestor de Empresa
('Gestor de Empresa', 'users.view'),
('Gestor de Empresa', 'enrollments.view'),
('Gestor de Empresa', 'reports.view')
ON CONFLICT (role_name, permission_id) DO NOTHING;

-- Inserir configurações padrão
INSERT INTO z_certificate_settings (id, settings) VALUES (1, '{"template": "default", "logo_url": "", "signature": ""}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO z_notification_settings (id, settings) VALUES (1, '{"welcome_email": true, "course_completion": true, "certificate_ready": true}')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 13. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'z_%'
ORDER BY table_name;

-- Verificar se os tipos ENUM foram criados
SELECT 
    typname,
    enumlabel
FROM pg_type 
JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
WHERE typname IN ('user_profile_type', 'entity_status_type', 'class_status_type', 'class_location_type', 'enrollment_status_type')
ORDER BY typname, enumsortorder;

-- Verificar se as políticas RLS estão habilitadas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'z_%'
ORDER BY tablename;

-- =====================================================
-- BANCO DE DADOS CRIADO COM SUCESSO!
-- =====================================================

/*
PRÓXIMOS PASSOS:

1. ✅ Execute este script no SQL Editor do Supabase
2. 🔐 Configure as políticas de autenticação no Supabase Auth
3. 👤 Crie um usuário administrador no Supabase Auth
4. 🧪 Teste as conexões e funcionalidades
5. 📊 Configure backups e monitoramento

CONFIGURAÇÕES ADICIONAIS NO SUPABASE:

- Habilitar Row Level Security (RLS) no projeto
- Configurar SMTP para envio de emails
- Configurar storage para upload de arquivos
- Configurar Edge Functions se necessário

ESTRUTURA CRIADA:

✅ 14 Tabelas principais
✅ 5 Tipos ENUM personalizados
✅ 8 Índices para performance
✅ 4 Funções auxiliares
✅ 8 Triggers automáticos
✅ 14 Políticas de segurança (RLS)
✅ Dados iniciais de configuração
✅ Sistema de controle de acesso (RBAC)
✅ Logs de auditoria
✅ Configurações de certificados e notificações
*/ 