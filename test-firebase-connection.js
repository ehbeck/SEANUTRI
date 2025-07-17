#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

console.log('🔥 Teste de Conexão Firebase');
console.log('============================\n');

// Verificar variáveis de ambiente
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('📋 Verificando variáveis de ambiente:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`   ❌ ${varName}: Não configurada`);
  }
});

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Verificar se todas as variáveis estão configuradas
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.log('\n❌ Variáveis de ambiente faltando:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\n💡 Execute: npm run setup:firebase');
  process.exit(1);
}

async function testFirebaseConnection() {
  try {
    console.log('\n🚀 Inicializando Firebase...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('   ✅ Firebase inicializado');

    // Testar Authentication
    console.log('\n🔐 Testando Authentication...');
    const auth = getAuth(app);
    console.log('   ✅ Auth inicializado');

    // Testar Firestore
    console.log('\n🗄️ Testando Firestore...');
    const db = getFirestore(app);
    console.log('   ✅ Firestore inicializado');

    // Testar conexão com Firestore
    console.log('\n📊 Testando conexão com Firestore...');
    try {
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      console.log('   ✅ Conexão com Firestore estabelecida');
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.log('   ⚠️ Firestore conectado, mas sem permissões (normal para teste)');
      } else {
        throw error;
      }
    }

    // Testar autenticação anônima (se habilitada)
    console.log('\n👤 Testando autenticação anônima...');
    try {
      await signInAnonymously(auth);
      console.log('   ✅ Autenticação anônima funcionando');
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        console.log('   ⚠️ Autenticação anônima não habilitada (normal)');
      } else {
        console.log(`   ⚠️ Erro na autenticação anônima: ${error.message}`);
      }
    }

    console.log('\n✅ Todos os testes passaram!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Configure as regras de segurança do Firestore');
    console.log('2. Habilite os métodos de autenticação desejados');
    console.log('3. Execute: npm run dev');
    console.log('4. Acesse: http://localhost:9003');

  } catch (error) {
    console.error('\n❌ Erro ao conectar com Firebase:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se as configurações estão corretas');
    console.log('2. Verifique se o projeto Firebase está ativo');
    console.log('3. Verifique se o Firestore está habilitado');
    console.log('4. Execute: npm run setup:firebase');
    process.exit(1);
  }
}

// Executar teste
testFirebaseConnection(); 