-- Apaga tabelas existentes para uma reinicialização limpa
DROP TABLE IF EXISTS z_enrollments, z_scheduled_class_students, z_scheduled_classes, z_courses, z_instructors, z_profiles, z_companies, z_role_permissions, z_permissions, z_roles CASCADE;

-- Apaga tipos personalizados existentes
DROP TYPE IF EXISTS user_profile_type;
DROP TYPE IF EXISTS entity_status_type;
DROP TYPE IF EXISTS class_status_type;
DROP TYPE IF EXISTS class_location_type;
DROP TYPE IF EXISTS enrollment_status_type;

-- Cria ENUMs (tipos personalizados) para consistência
CREATE TYPE user_profile_type AS ENUM ('Administrador', 'Aluno', 'Instrutor', 'Gestor de Empresa');
CREATE TYPE entity_status_type AS ENUM ('Ativa', 'Inativa', 'Ativo', 'Inativo');
CREATE TYPE class_status_type AS ENUM ('Agendada', 'Concluída');
CREATE TYPE class_location_type AS ENUM ('Presencial', 'Online');
CREATE TYPE enrollment_status_type AS ENUM ('Não Iniciado', 'Em Progresso', 'Concluído');

-- Tabela de Empresas
CREATE TABLE z_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    status entity_status_type NOT NULL,
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
    profile user_profile_type NOT NULL,
    company_id UUID REFERENCES z_companies(id),
    status entity_status_type NOT NULL,
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
    status enrollment_status_type NOT NULL,
    grade NUMERIC(4, 2),
    approved BOOLEAN,
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
    status class_status_type NOT NULL,
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

-- Tabelas de Configurações
CREATE TABLE z_certificate_settings (
    id INT PRIMARY KEY DEFAULT 1, -- Garante uma única linha
    settings JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_certificate_settings IS 'Configurações globais para a geração de certificados.';

CREATE TABLE z_notification_settings (
    id INT PRIMARY KEY DEFAULT 1, -- Garante uma única linha
    settings JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE z_notification_settings IS 'Configurações globais para notificações por email.';

-- Tabelas de Controle de Acesso (RBAC)
CREATE TABLE z_roles (
    name TEXT PRIMARY KEY,
    description TEXT NOT NULL
);
COMMENT ON TABLE z_roles IS 'Define os perfis de acesso do sistema (Ex: Administrador, Aluno).';

CREATE TABLE z_permissions (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL
);
COMMENT ON TABLE z_permissions IS 'Define as permissões granulares do sistema.';

CREATE TABLE z_role_permissions (
    role_name TEXT NOT NULL REFERENCES z_roles(name) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES z_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_name, permission_id)
);
COMMENT ON TABLE z_role_permissions IS 'Associa permissões a perfis.';

-- Tabelas de Log
CREATE TABLE z_login_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES z_profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    company_name TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE z_notification_log (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL
);


-- Habilitar Row Level Security (RLS) em todas as tabelas
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

-- Função para obter o perfil do usuário logado
CREATE OR REPLACE FUNCTION get_my_profile_type()
RETURNS user_profile_type AS $$
DECLARE
    profile_type user_profile_type;
BEGIN
    SELECT profile INTO profile_type FROM z_profiles WHERE id = auth.uid();
    RETURN profile_type;
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


-- Políticas de Segurança (RLS Policies)
-- Admins podem fazer tudo
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

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view their own profile" ON z_profiles FOR SELECT USING (id = auth.uid());
-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile" ON z_profiles FOR UPDATE USING (id = auth.uid());

-- Gestores podem ver usuários da sua própria empresa
CREATE POLICY "Company managers can view users from their company" ON z_profiles FOR SELECT USING (get_my_profile_type() = 'Gestor de Empresa' AND company_id = get_my_company_id());

-- Todos os usuários logados podem ver empresas, cursos e instrutores (leitura pública)
CREATE POLICY "Authenticated users can view companies" ON z_companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view courses" ON z_courses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view instructors" ON z_instructors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view roles and permissions" ON z_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view permissions" ON z_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view role_permissions" ON z_role_permissions FOR SELECT USING (auth.role() = 'authenticated');


-- Usuários podem ver suas próprias matrículas
CREATE POLICY "Users can view their own enrollments" ON z_enrollments FOR SELECT USING (user_id = auth.uid());

-- Gestores podem ver matrículas de usuários da sua empresa
CREATE POLICY "Managers can view enrollments from their company" ON z_enrollments FOR SELECT USING (
    get_my_profile_type() = 'Gestor de Empresa' AND
    user_id IN (SELECT id FROM z_profiles WHERE company_id = get_my_company_id())
);

-- Gatilho para criar um perfil quando um novo usuário se registra no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.z_profiles (id, name, email, profile, status, company_id)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'name',
        new.email,
        (new.raw_user_meta_data->>'profile')::user_profile_type,
        'Ativo',
        (new.raw_user_meta_data->>'company_id')::UUID
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Dados iniciais para perfis de acesso
INSERT INTO z_roles (name, description) VALUES
('Administrador', 'Acesso total a todas as funcionalidades.'),
('Instrutor', 'Acesso para gerenciar seus cursos e avaliar alunos.'),
('Aluno', 'Acesso para visualizar cursos e seu progresso.'),
('Gestor de Empresa', 'Acesso para visualizar relatórios da sua empresa.')
ON CONFLICT (name) DO NOTHING;

      