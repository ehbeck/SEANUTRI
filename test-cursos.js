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

async function testCursos() {
  try {
    console.log('Testando operações de cursos...');
    
    // Teste 1: Verificar se a coleção cursos existe
    console.log('\n1. Verificando coleção cursos...');
    const cursosRef = collection(db, 'cursos');
    const snapshot = await getDocs(cursosRef);
    console.log(`Encontrados ${snapshot.size} cursos na coleção`);
    
    // Teste 2: Adicionar um curso de teste
    console.log('\n2. Adicionando curso de teste...');
    const novoCurso = {
      titulo: "Curso de Teste",
      descricao: "Este é um curso de teste para verificar se o sistema está funcionando corretamente.",
      duracao: 8,
      preco: 150.00,
      instrutorId: "test-instructor-id",
      instrutorNome: "Instrutor Teste",
      categoria: "Teste",
      nivel: "Iniciante",
      status: "Ativo",
      conteudo: "Conteúdo programático de teste",
      certificado: true,
      vagas: 20,
      imagem: "https://placehold.co/600x400/2563eb/ffffff?text=Curso+Teste",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(cursosRef, novoCurso);
    console.log('Curso adicionado com ID:', docRef.id);
    
    // Teste 3: Atualizar o curso
    console.log('\n3. Atualizando curso...');
    const cursoRef = doc(db, 'cursos', docRef.id);
    await updateDoc(cursoRef, {
      titulo: "Curso de Teste Atualizado",
      updatedAt: new Date()
    });
    console.log('Curso atualizado com sucesso');
    
    // Teste 4: Deletar o curso
    console.log('\n4. Deletando curso...');
    await deleteDoc(cursoRef);
    console.log('Curso deletado com sucesso');
    
    console.log('\n✅ Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

testCursos(); 