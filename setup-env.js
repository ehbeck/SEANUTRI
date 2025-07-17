#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  try {
    const config = {};

    console.log('🚀 Configuração do Ambiente Firebase');
    console.log('=====================================\n');

    console.log('📋 Configurações do Firebase:\n');

    // Configurações do Firebase (já configuradas)
    config.firebase = {};
    config.firebase.apiKey = "AIzaSyAVaDdDt-k_MDB7Rj_tqqHSTysrRfHEVRg";
    config.firebase.authDomain = "offshore-nutrition-tracker.firebaseapp.com";
    config.firebase.projectId = "offshore-nutrition-tracker";
    config.firebase.storageBucket = "offshore-nutrition-tracker.firebasestorage.app";
    config.firebase.messagingSenderId = "275779212119";
    config.firebase.appId = "1:275779212119:web:d51f4e06605925b1c36412";

    console.log('✅ Configurações do Firebase já definidas:');
    console.log('   Project ID:', config.firebase.projectId);
    console.log('   Auth Domain:', config.firebase.authDomain);

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

    // Gerar arquivo .env.local
    const envContent = `# ========================================
# CONFIGURAÇÕES DO FIREBASE
# ========================================

# Configurações do Firebase (já configuradas)
NEXT_PUBLIC_FIREBASE_API_KEY=${config.firebase.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.firebase.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.firebase.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.firebase.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.firebase.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${config.firebase.appId}

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
`;

    // Salvar arquivo .env.local
    fs.writeFileSync('.env.local', envContent);

    console.log('\n✅ Arquivo .env.local criado com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Verifique se o arquivo .env.local foi criado corretamente');
    console.log('2. Execute: npm run sync:users (para sincronizar usuários)');
    console.log('3. Execute: npm run dev (para iniciar a aplicação)');

    console.log('\n🔧 Comandos úteis:');
    console.log('   npm run sync:users  - Sincronizar usuários Firebase Auth <-> Firestore');
    console.log('   npm run test:firebase - Testar conexão com Firebase');
    console.log('   npm run dev         - Iniciar aplicação');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  } finally {
    rl.close();
  }
}

main(); 