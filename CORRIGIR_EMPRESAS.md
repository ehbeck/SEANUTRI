# 🔧 Correção do Módulo Empresas

## Problema Identificado
A tabela `z_companies` no Supabase está vazia (0 registros) e as políticas RLS (Row Level Security) estão bloqueando o acesso aos dados.

## Solução

### 1. Execute o Script SQL no Supabase

1. Acesse o **Dashboard do Supabase**
2. Vá para **SQL Editor**
3. Execute o script `fix-companies-rls.sql` completo

### 2. Verificação dos Resultados

Após executar o script, você deve ver:

```sql
-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_companies FROM z_companies;
-- Deve retornar: 5 empresas

-- Verificar as empresas
SELECT id, name, contact, status FROM z_companies ORDER BY name;
-- Deve mostrar as 5 empresas inseridas
```

### 3. Teste no Frontend

1. **Reinicie o servidor Next.js**:
   ```bash
   npm run dev
   ```

2. **Acesse o módulo Empresas**:
   - Faça login como administrador
   - Vá para `/empresas`
   - Abra o console do navegador (F12)

3. **Verifique os logs no console**:
   - Deve aparecer: "🔍 Buscando empresas do Supabase..."
   - Deve aparecer: "✅ Empresas encontradas: 5"

### 4. Se Ainda Não Funcionar

#### Verificar Autenticação
O problema pode ser que o usuário não está autenticado no Supabase. Verifique:

1. **No console do navegador**, procure por erros de autenticação
2. **Verifique se o usuário existe na tabela `z_profiles`**:
   ```sql
   SELECT * FROM z_profiles WHERE email = 'ehbeckman@gmail.com';
   ```

#### Criar Usuário Administrador no Supabase
Se o usuário não existir, execute:

```sql
-- Inserir usuário administrador
INSERT INTO z_profiles (id, name, email, profile, status, updated_at)
VALUES (
    'ehbeckman@gmail.com', -- usar email como ID
    'Administrador',
    'ehbeckman@gmail.com',
    'Administrador',
    'Ativa',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    profile = 'Administrador',
    status = 'Ativa',
    updated_at = NOW();
```

### 5. Políticas RLS Criadas

O script cria as seguintes políticas:

- **Leitura**: Todos os usuários autenticados podem ler empresas
- **Inserção**: Apenas administradores podem inserir
- **Atualização**: Apenas administradores podem atualizar
- **Exclusão**: Apenas administradores podem excluir

### 6. Dados de Exemplo Inseridos

- Offshore Solutions Inc. (contato@offshore.com)
- Petrobras (rh@petrobras.com)
- Shell Brasil (contato@shell.com)
- ExxonMobil (rh@exxonmobil.com)
- Chevron (contato@chevron.com)

## Próximos Passos

1. Execute o script SQL
2. Reinicie o servidor
3. Teste o módulo empresas
4. Se houver problemas, verifique os logs no console do navegador

## Logs de Debug

O código foi atualizado para mostrar logs detalhados no console do navegador. Isso ajudará a identificar qualquer problema restante. 