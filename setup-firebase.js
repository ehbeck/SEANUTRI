#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Configuração do Firebase');
console.log('============================\n');

// Função para fazer perguntas ao usuário
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Função para gerar o conteúdo do .env.local
function generateEnvContent(config) {
  return `# ========================================
# CONFIGURAÇÕES DO FIREBASE
# ========================================

# Configurações do Firebase (obrigatórias)
NEXT_PUBLIC_FIREBASE_API_KEY=${config.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${config.appId}

# ========================================
# CONFIGURAÇÕES DE EMAIL (SMTP)
# ========================================

# Configurações SMTP para envio de emails
SMTP_HOST=${config.smtp.host}
SMTP_PORT=${config.smtp.port}
SMTP_USER=${config.smtp.user}
SMTP_PASS=${config.smtp.pass}
SMTP_FROM_EMAIL=${config.smtp.fromEmail}
SMTP_FROM_NAME=${config.smtp.fromName}

# ========================================
# CONFIGURAÇÕES DA APLICAÇÃO
# ========================================

# Ambiente de execução
NODE_ENV=development

# URL da aplicação
NEXT_PUBLIC_APP_URL=${config.appUrl}

# URLs de redirecionamento após autenticação
NEXT_PUBLIC_AUTH_REDIRECT_URL=${config.appUrl}/dashboard
NEXT_PUBLIC_AUTH_SIGNUP_REDIRECT_URL=${config.appUrl}/dashboard

# ========================================
# CONFIGURAÇÕES DE SEGURANÇA
# ========================================

# Chave secreta para JWT (se necessário)
JWT_SECRET=${config.jwtSecret}

# ========================================
# CONFIGURAÇÕES DE DESENVOLVIMENTO
# ========================================

# Porta do servidor de desenvolvimento
PORT=${config.port}

# Configurações de debug
DEBUG=firebase:*
NEXT_PUBLIC_DEBUG=true

# ========================================
# CONFIGURAÇÕES DE LOG
# ========================================

# Nível de log
LOG_LEVEL=info

# ========================================
# CONFIGURAÇÃO GERADA EM: ${new Date().toISOString()}
# ========================================
`;
}

async function main() {
  try {
    const config = {};

    console.log('📋 Configurações do Firebase:\n');

    // API Key (já configurada)
    config.apiKey = await question('API Key do Firebase (padrão: AIzaSyAVaDdDt-k_MDB7Rj_tqqHSTysrRfHEVRg): ') || 'AIzaSyAVaDdDt-k_MDB7Rj_tqqHSTysrRfHEVRg';

    // Auth Domain (já configurado)
    config.authDomain = await question('Auth Domain do Firebase (padrão: offshore-nutrition-tracker.firebaseapp.com): ') || 'offshore-nutrition-tracker.firebaseapp.com';

    // Project ID (já configurado)
    config.projectId = await question('Project ID do Firebase (padrão: offshore-nutrition-tracker): ') || 'offshore-nutrition-tracker';

    // Storage Bucket (já configurado)
    config.storageBucket = await question('Storage Bucket do Firebase (padrão: offshore-nutrition-tracker.firebasestorage.app): ') || 'offshore-nutrition-tracker.firebasestorage.app';

    // Messaging Sender ID (já configurado)
    config.messagingSenderId = await question('Messaging Sender ID do Firebase (padrão: 275779212119): ') || '275779212119';

    // App ID (já configurado)
    config.appId = await question('App ID do Firebase (padrão: 1:275779212119:web:d51f4e06605925b1c36412): ') || '1:275779212119:web:d51f4e06605925b1c36412';

    console.log('\n📧 Configurações de Email (SMTP):\n');

    // Configurações SMTP
    config.smtp = {};
    config.smtp.host = await question('Host SMTP (padrão: smtp.hostinger.com): ') || 'smtp.hostinger.com';
    config.smtp.port = await question('Porta SMTP (padrão: 465): ') || '465';
    config.smtp.user = await question('Usuário SMTP (padrão: admin@seaocean.com.br): ') || 'admin@seaocean.com.br';
    config.smtp.pass = await question('Senha SMTP: ') || 'ifoP@(ie09jasp';
    config.smtp.fromEmail = await question('Email remetente (padrão: admin@seaocean.com.br): ') || 'admin@seaocean.com.br';
    config.smtp.fromName = await question('Nome remetente (padrão: Sea Ocean): ') || 'Sea Ocean';

    console.log('\n🌐 Configurações da Aplicação:\n');

    // URL da aplicação
    config.appUrl = await question('URL da aplicação (padrão: http://localhost:9003): ') || 'http://localhost:9003';

    // Porta
    config.port = await question('Porta do servidor (padrão: 9003): ') || '9003';

    // JWT Secret
    config.jwtSecret = await question('Chave secreta JWT (padrão: chave-secreta-aleatoria): ') || 'chave-secreta-aleatoria-' + Math.random().toString(36).substring(2);

    // Gerar o conteúdo do arquivo
    const envContent = generateEnvContent(config);

    // Salvar o arquivo .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Arquivo .env.local criado com sucesso!');
    console.log(`📁 Localização: ${envPath}`);
    console.log('\n📝 Configurações definidas:');
    console.log(`   • Project ID: ${config.projectId}`);
    console.log(`   • Auth Domain: ${config.authDomain}`);
    console.log(`   • URL da aplicação: ${config.appUrl}`);
    console.log('\n📝 Próximos passos:');
    console.log('1. Verifique se as configurações estão corretas');
    console.log('2. Execute: npm run dev');
    console.log('3. Teste a conexão com o Firebase');
    console.log('\n🔧 Para testar a conexão, execute: npm run test:firebase');

  } catch (error) {
    console.error('❌ Erro ao configurar o Firebase:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar o script
if (require.main === module) {
  main();
}

module.exports = { generateEnvContent }; 