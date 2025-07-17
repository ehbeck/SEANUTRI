# 🚀 Guia Completo de Migração para Supabase

Este guia irá ajudá-lo a migrar seu sistema de gestão de cursos para o Supabase de forma segura e organizada.

## 📋 Pré-requisitos

- ✅ Acesso ao painel do Supabase
- ✅ Projeto Supabase criado
- ✅ URL e chaves de API do Supabase configuradas
- ✅ Backup dos dados existentes (se houver)

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` está configurado corretamente:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://seanutri-supabase-e9da51-147-93-35-21.traefik.me
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Email Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@seaocean.com.br
SMTP_PASS=sua_senha_smtp
SMTP_FROM_EMAIL=admin@seaocean.com.br
SMTP_FROM_NAME=Sea Ocean
```

### 2. Verificar Configurações do Supabase

No painel do Supabase, verifique:

- ✅ **Authentication**: Habilitado
- ✅ **Row Level Security (RLS)**: Habilitado
- ✅ **Database**: PostgreSQL 15+
- ✅ **Storage**: Configurado (se necessário)

## 🗄️ Migração do Banco de Dados

### Passo 1: Executar Schema Principal

1. Acesse o **SQL Editor** no painel do Supabase
2. Copie e cole o conteúdo do arquivo `supabase-migration.sql`
3. Execute o script completo
4. Verifique se não há erros

### Passo 2: Verificar Estrutura Criada

Execute esta query para verificar se todas as tabelas foram criadas:

```sql
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'z_%'
ORDER BY table_name;
```

**Resultado esperado:**
- z_certificate_settings
- z_companies
- z_courses
- z_enrollments
- z_instructors
- z_login_log
- z_notification_log
- z_notification_settings
- z_permissions
- z_profiles
- z_role_permissions
- z_roles
- z_scheduled_class_students
- z_scheduled_classes

### Passo 3: Verificar Tipos ENUM

```sql
SELECT 
    typname,
    enumlabel
FROM pg_type 
JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
WHERE typname IN ('user_profile_type', 'entity_status_type', 'class_status_type', 'class_location_type', 'enrollment_status_type')
ORDER BY typname, enumsortorder;
```

## 👥 Criação de Usuários

### 1. Criar Usuário Administrador

1. Vá para **Authentication > Users** no painel do Supabase
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
5. Copie o **UUID** do usuário criado

### 2. Inserir Perfil do Administrador

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

### 3. Verificar Criação

```sql
SELECT * FROM z_profiles WHERE email = 'admin@exemplo.com';
```

## 📊 Migração de Dados (Opcional)

Se você tem dados existentes para migrar:

1. Execute o arquivo `migrate-data.sql` no SQL Editor
2. Ajuste os dados conforme necessário
3. Descomente as seções relevantes
4. Substitua os UUIDs pelos valores reais

## 🔐 Configuração de Segurança

### 1. Verificar RLS

Certifique-se de que o RLS está habilitado em todas as tabelas:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'z_%';
```

### 2. Testar Políticas de Segurança

```sql
-- Testar acesso de administrador
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

### 2. Testar Funcionalidades Principais

- ✅ **Dashboard**: Carregamento e exibição de dados
- ✅ **Cursos**: Listagem, criação, edição
- ✅ **Usuários**: Gerenciamento de perfis
- ✅ **Matrículas**: Inscrição em cursos
- ✅ **Relatórios**: Geração de relatórios

### 3. Testar Email

1. Vá para **Configurações**
2. Teste o envio de email
3. Verifique se as configurações SMTP estão funcionando

## 🔍 Verificações Finais

### 1. Status da Conexão

O componente de status deve mostrar:
- ✅ **Supabase**: Online
- ✅ **URL**: http://seanutri-supabase-e9da51-147-93-35-21.traefik.me
- ✅ **Última verificação**: Data/hora atual

### 2. Logs de Sistema

Verifique se os logs estão sendo registrados:

```sql
SELECT * FROM z_login_log ORDER BY timestamp DESC LIMIT 10;
```

### 3. Performance

Execute queries de teste para verificar performance:

```sql
-- Teste de performance básico
EXPLAIN ANALYZE SELECT * FROM z_profiles WHERE profile = 'Administrador';
```

## 🚨 Solução de Problemas

### Erro de CORS

Se aparecer erro de CORS:
1. Verifique se a URL do Supabase está correta
2. Confirme se está usando HTTP ou HTTPS conforme necessário
3. Verifique as configurações de CORS no Supabase

### Erro de Autenticação

Se houver problemas de login:
1. Verifique se o usuário foi criado corretamente no Supabase Auth
2. Confirme se o perfil foi inserido na tabela `z_profiles`
3. Verifique se as políticas RLS estão permitindo acesso

### Erro de Email

Se o email não funcionar:
1. Verifique as configurações SMTP no `.env.local`
2. Teste as credenciais do Hostinger
3. Verifique se o serviço de email está configurado corretamente

## 📈 Monitoramento e Manutenção

### 1. Backups

Configure backups automáticos no Supabase:
- **Frequência**: Diária
- **Retenção**: 7 dias
- **Localização**: Região escolhida

### 2. Logs e Monitoramento

Monitore regularmente:
- Logs de autenticação
- Performance das queries
- Uso de recursos
- Erros do sistema

### 3. Atualizações

Mantenha o sistema atualizado:
- Dependências do Next.js
- SDK do Supabase
- Configurações de segurança

## ✅ Checklist de Migração

- [ ] Schema do banco criado
- [ ] Usuário administrador criado
- [ ] Políticas de segurança configuradas
- [ ] Dados migrados (se aplicável)
- [ ] Login testado
- [ ] Funcionalidades principais testadas
- [ ] Email configurado e testado
- [ ] Status da conexão funcionando
- [ ] Logs sendo registrados
- [ ] Backup configurado

## 🎉 Migração Concluída!

Após completar todos os passos, seu sistema estará totalmente migrado para o Supabase e funcionando com:

- ✅ **Autenticação segura** via Supabase Auth
- ✅ **Banco de dados PostgreSQL** com RLS
- ✅ **Email funcional** via SMTP
- ✅ **Monitoramento** de status em tempo real
- ✅ **Backup automático** dos dados

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Verifique os logs do console do navegador
2. Consulte os logs do Supabase
3. Teste as conexões individualmente
4. Verifique as configurações de ambiente

---

**Boa sorte com sua migração! 🚀** 