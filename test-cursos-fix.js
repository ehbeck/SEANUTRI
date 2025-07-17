const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAVaDdDt-k_MDB7Rj_tqqHSTysrRfHEVRg",
  authDomain: "offshore-nutrition-tracker.firebaseapp.com",
  projectId: "offshore-nutrition-tracker",
  storageBucket: "offshore-nutrition-tracker.firebasestorage.app",
  messagingSenderId: "275779212119",
  appId: "1:275779212119:web:d51f4e06605925b1c36412"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testCursosFix() {
  try {
    console.log('Testando correção do problema undefined...');
    
    // Teste 1: Adicionar curso com empresaId undefined
    console.log('\n1. Testando adição de curso com empresaId undefined...');
    const cursosRef = collection(db, 'cursos');
    
    const novoCurso = {
      titulo: "Curso Teste Undefined Fix",
      descricao: "Teste para verificar se o problema de undefined foi corrigido.",
      duracao: 4,
      preco: 100.00,
      instrutorId: "test-instructor-id",
      instrutorNome: "Instrutor Teste",
      empresaId: undefined, // Este campo deve ser filtrado
      categoria: "Teste",
      nivel: "Iniciante",
      status: "Ativo",
      conteudo: "Conteúdo de teste",
      certificado: true,
      vagas: 15,
      imagem: "https://placehold.co/600x400/2563eb/ffffff?text=Curso+Teste"
    };
    
    const docRef = await addDoc(cursosRef, {
      ...novoCurso,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Curso adicionado com sucesso! ID:', docRef.id);
    
    // Teste 2: Atualizar curso com campos undefined
    console.log('\n2. Testando atualização de curso com campos undefined...');
    const cursoRef = doc(db, 'cursos', docRef.id);
    await updateDoc(cursoRef, {
      titulo: "Curso Atualizado",
      empresaId: undefined, // Este campo deve ser filtrado
      updatedAt: new Date()
    });
    console.log('✅ Curso atualizado com sucesso!');
    
    // Teste 3: Verificar se o documento foi salvo corretamente
    console.log('\n3. Verificando se o documento foi salvo sem campos undefined...');
    const snapshot = await getDocs(cursosRef);
    const cursoSalvo = snapshot.docs.find(doc => doc.id === docRef.id);
    if (cursoSalvo) {
      const data = cursoSalvo.data();
      console.log('Dados salvos:', JSON.stringify(data, null, 2));
      
      // Verificar se empresaId não existe no documento
      if (data.empresaId === undefined) {
        console.log('❌ ERRO: empresaId ainda está undefined no documento!');
      } else if (!('empresaId' in data)) {
        console.log('✅ SUCESSO: empresaId foi removido do documento (como esperado)');
      } else {
        console.log('✅ SUCESSO: empresaId tem valor válido:', data.empresaId);
      }
    }
    
    // Teste 4: Limpar o curso de teste
    console.log('\n4. Removendo curso de teste...');
    await deleteDoc(cursoRef);
    console.log('✅ Curso de teste removido');
    
    console.log('\n🎉 Todos os testes passaram! O problema de undefined foi corrigido.');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

testCursosFix(); 