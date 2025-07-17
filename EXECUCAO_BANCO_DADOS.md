# 🗄️ Guia de Execução - Criação do Banco de Dados no Supabase

Este guia irá ajudá-lo a criar todo o banco de dados no Supabase de forma organizada e segura.

## 📋 Pré-requisitos

- ✅ Acesso ao painel do Supabase
- ✅ Projeto Supabase criado
- ✅ URL e chaves de API configuradas
- ✅ Permissões de administrador no projeto

## 🚀 Passo a Passo

### Passo 1: Acessar o SQL Editor

1. Faça login no [painel do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor** no menu lateral
4. Clique em **"New query"**

### Passo 2: Executar Script Principal

1. **Copie todo o conteúdo** do arquivo `create-supabase-database.sql`
2. **Cole no SQL Editor** do Supabase
3. **Clique em "Run"** para executar
4. **Aguarde a conclusão** (pode levar alguns minutos)

**✅ Resultado esperado:**
- 14 tabelas criadas
- 5 tipos ENUM criados
- 8 índices criados
- 4 funções criadas
- 8 triggers criados
- 14 políticas de segurança criadas

### Passo 3: Verificar a Estrutura

Execute esta query para verificar se tudo foi criado:

```sql
-- Verificar tabelas criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'z_%'
ORDER BY table_name;
```

**Resultado esperado:**
```
z_certificate_settings
z_companies
z_courses
z_enrollments
z_instructors
z_login_log
z_notification_log
z_notification_settings
z_permissions
z_profiles
z_role_permissions
z_roles
z_scheduled_class_students
z_scheduled_classes
```

### Passo 4: Executar Script de Dados de Exemplo

1. **Crie uma nova query** no SQL Editor
2. **Copie todo o conteúdo** do arquivo `insert-sample-data.sql`
3. **Cole no SQL Editor** e execute
4. **Verifique os dados inseridos**

### Passo 5: Criar Usuário Administrador

1. Vá para **Authentication > Users**
2. Clique em **"Add User"**
3. Preencha os dados:
   - **Email**: admin@exemplo.com
   - **Password**: (senha segura)
   - **User Metadata**: 
     ```json
     {
       "name": "Administrador",
       "profile": "Administrador"
     }
     ```
4. Clique em **"Create User"**
5. **Copie o UUID** do usuário criado

### Passo 6: Inserir Perfil do Administrador

Execute no SQL Editor:

```sql
INSERT INTO z_profiles (id, name, email, profile, status) VALUES (
    'UUID_DO_USUARIO_ADMIN', -- Substitua pelo UUID real
    'Administrador',
    'admin@exemplo.com',
    'Administrador',
    'Ativo'
);
```

### Passo 7: Verificar Configurações

Execute estas queries para verificar:

```sql
-- Verificar tipos ENUM
SELECT 
    typname,
    enumlabel
FROM pg_type 
JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
WHERE typname IN ('user_profile_type', 'entity_status_type', 'class_status_type', 'class_location_type', 'enrollment_status_type')
ORDER BY typname, enumsortorder;

-- Verificar políticas RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'z_%'
ORDER BY tablename;

-- Verificar dados de exemplo
SELECT 'z_companies' as tabela, COUNT(*) as total FROM z_companies
UNION ALL
SELECT 'z_instructors' as tabela, COUNT(*) as total FROM z_instructors
UNION ALL
SELECT 'z_courses' as tabela, COUNT(*) as total FROM z_courses
ORDER BY tabela;
```

## 🔐 Configurações de Segurança

### Verificar RLS

Certifique-se de que o Row Level Security está habilitado:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'z_%';
```

### Testar Políticas

```sql
-- Testar função de perfil
SELECT get_my_profile_type();

-- Verificar se as políticas estão funcionando
SELECT * FROM z_profiles LIMIT 5;
```

## 🧪 Testes de Funcionalidade

### 1. Testar Login

1. Acesse sua aplicação
2. Tente fazer login com o usuário administrador
3. Verifique se o redirecionamento funciona
4. Teste o logout

### 2. Testar Funcionalidades

- ✅ **Dashboard**: Carregamento e exibição de dados
- ✅ **Cursos**: Listagem, criação, edição
- ✅ **Usuários**: Gerenciamento de perfis
- ✅ **Matrículas**: Inscrição em cursos
- ✅ **Relatórios**: Geração de relatórios

### 3. Testar Email

1. Vá para **Configurações**
2. Teste o envio de email
3. Verifique se as configurações SMTP estão funcionando

## 📊 Estrutura Criada

### Tabelas Principais
- `z_companies` - Empresas parceiras
- `z_profiles` - Perfis de usuários
- `z_instructors` - Instrutores
- `z_courses` - Cursos
- `z_enrollments` - Matrículas
- `z_scheduled_classes` - Turmas agendadas

### Tabelas de Sistema
- `z_roles` & `z_permissions` - Controle de acesso
- `z_certificate_settings` - Configurações de certificados
- `z_notification_settings` - Configurações de notificações
- `z_login_log` & `z_notification_log` - Logs do sistema

### Recursos de Segurança
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acesso baseadas em perfis
- ✅ Funções auxiliares para controle
- ✅ Triggers automáticos
- ✅ Índices otimizados

## 🚨 Solução de Problemas

### Erro de Permissão

Se aparecer erro de permissão:
1. Verifique se você tem acesso de administrador
2. Confirme se o RLS está habilitado
3. Verifique se as políticas foram criadas

### Erro de Sintaxe

Se aparecer erro de sintaxe:
1. Verifique se está usando PostgreSQL 15+
2. Confirme se não há caracteres especiais
3. Execute o script em partes menores

### Erro de Dependência

Se aparecer erro de dependência:
1. Execute o script na ordem correta
2. Verifique se as tabelas foram criadas
3. Confirme se os tipos ENUM existem

## ✅ Checklist de Verificação

- [ ] Script principal executado sem erros
- [ ] 14 tabelas criadas
- [ ] 5 tipos ENUM criados
- [ ] 8 índices criados
- [ ] 4 funções criadas
- [ ] 8 triggers criados
- [ ] 14 políticas de segurança criadas
- [ ] Dados de exemplo inseridos
- [ ] Usuário administrador criado
- [ ] Perfil do administrador inserido
- [ ] RLS habilitado em todas as tabelas
- [ ] Login testado com sucesso
- [ ] Funcionalidades principais testadas

## 🎉 Banco de Dados Criado!

Após completar todos os passos, seu banco de dados estará totalmente configurado com:

- ✅ **Estrutura completa** de tabelas e relacionamentos
- ✅ **Sistema de segurança** com RLS e políticas
- ✅ **Dados de exemplo** para testes
- ✅ **Usuário administrador** configurado
- ✅ **Performance otimizada** com índices
- ✅ **Logs e auditoria** funcionando

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Consulte a documentação oficial
3. Teste as conexões individualmente
4. Verifique as configurações de ambiente

---

**Boa sorte com sua configuração! 🚀** 