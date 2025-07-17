const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = 'http://seanutri-supabase-2fbf63-147-93-35-21.traefik.me';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTIwNzg0NjUsImV4cCI6MTc4MzYxNDQ2NSwiaXNzIjoic3VwYWJhc2UiLCJyb2xlIjoiYW5vbiJ9.g7ryZ6Qp2oHoTbcp5VmGxR0o_WR9QEMxeWxJ38N1eIg';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const adminEmail = 'ehbeckman@gmail.com';

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

async function main() {
  console.log('🔍 Verificando tabela z_companies...');
  const { data: companies, error: companiesError } = await supabase
    .from('z_companies')
    .select('*');
  if (companiesError) {
    console.error('❌ Erro ao acessar z_companies:', companiesError.message);
    process.exit(1);
  }
  console.log(`✅ Empresas encontradas: ${companies.length}`);

  if (companies.length === 0) {
    console.log('⚠️  Nenhuma empresa encontrada. Inserindo dados de exemplo...');
    const exemplos = [
      { name: 'Sea Ocean Ltda', contact: 'contato@seaocean.com.br', status: 'Ativa' },
      { name: 'Tech Solutions', contact: 'contato@techsolutions.com', status: 'Ativa' },
      { name: 'Inovação Digital', contact: 'contato@inovacao.com', status: 'Ativa' },
      { name: 'Educação Futuro', contact: 'contato@educacaofuturo.com', status: 'Ativa' },
    ];
    for (const ex of exemplos) {
      await supabase.from('z_companies').insert(ex);
    }
    console.log('✅ Dados de exemplo inseridos.');
  }

  // Verificar políticas RLS
  console.log('🔒 Verificando políticas RLS...');
  const { data: policies, error: policiesError } = await supabase.rpc('pg_get_policies', { table_name: 'z_companies' });
  if (policiesError) {
    console.log('⚠️  Não foi possível listar políticas via RPC. Corrija manualmente se necessário.');
  } else {
    console.log('Políticas encontradas:', policies);
  }

  // Tentar forçar política de leitura
  console.log('🛠️  Corrigindo política de leitura (se necessário)...');
  const sql = `
    ALTER TABLE z_companies DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON z_companies;
    CREATE POLICY "Permitir leitura para usuários autenticados" ON z_companies
      FOR SELECT TO authenticated USING (true);
    ALTER TABLE z_companies ENABLE ROW LEVEL SECURITY;
  `;
  const { error: sqlError } = await supabase.rpc('execute_sql', { sql });
  if (sqlError) {
    console.log('⚠️  Não foi possível corrigir políticas automaticamente. Execute o script SQL manualmente.');
  } else {
    console.log('✅ Política de leitura corrigida!');
  }

  // Verificar usuário administrador
  console.log('👤 Verificando usuário administrador...');
  const { data: admin, error: adminError } = await supabase
    .from('z_profiles')
    .select('*')
    .eq('email', adminEmail)
    .single();
  if (adminError || !admin) {
    console.log('⚠️  Usuário administrador não encontrado. Criando...');
    await supabase.from('z_profiles').insert({
      id: adminEmail,
      name: 'Administrador',
      email: adminEmail,
      profile: 'Administrador',
      status: 'Ativa',
      updated_at: new Date().toISOString(),
    });
    console.log('✅ Usuário administrador criado.');
  } else {
    console.log('✅ Usuário administrador já existe.');
  }

  console.log('\n🎉 Processo automático concluído! Reinicie o servidor Next.js e teste o módulo Empresas.');
}

main(); 