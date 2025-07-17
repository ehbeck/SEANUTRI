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

async function testAgendamentos() {
  try {
    console.log('Testando correção dos problemas de agendamentos...');
    
    // Teste 1: Verificar se a coleção agendamentos existe
    console.log('\n1. Verificando coleção agendamentos...');
    const agendamentosRef = collection(db, 'agendamentos');
    const snapshot = await getDocs(agendamentosRef);
    console.log(`Encontrados ${snapshot.size} agendamentos na coleção`);
    
    // Mostrar os dados dos agendamentos existentes
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\nAgendamento ${doc.id}:`);
      console.log(`  - CourseId: ${data.courseId}`);
      console.log(`  - CourseName: ${data.courseName || 'NÃO PREENCHIDO'}`);
      console.log(`  - InstructorId: ${data.instructorId}`);
      console.log(`  - InstructorName: ${data.instructorName || 'NÃO PREENCHIDO'}`);
      console.log(`  - Data: ${data.scheduledDate?.toDate?.() || data.scheduledDate}`);
      console.log(`  - Horário: ${data.startTime} - ${data.endTime}`);
    });
    
    // Teste 2: Adicionar um agendamento de teste com nomes preenchidos
    console.log('\n2. Adicionando agendamento de teste com nomes...');
    const novoAgendamento = {
      courseId: "test-course-id",
      courseName: "Curso de Teste",
      instructorId: "test-instructor-id", 
      instructorName: "Instrutor Teste",
      studentIds: ["student1", "student2"],
      scheduledDate: new Date(),
      startTime: "09:00",
      endTime: "12:00",
      locationType: "Presencial",
      location: "Sala de Teste",
      status: "Agendada",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(agendamentosRef, novoAgendamento);
    console.log('✅ Agendamento adicionado com ID:', docRef.id);
    
    // Teste 3: Atualizar o agendamento
    console.log('\n3. Testando atualização de agendamento...');
    const agendamentoRef = doc(db, 'agendamentos', docRef.id);
    await updateDoc(agendamentoRef, {
      courseName: "Curso de Teste Atualizado",
      instructorName: "Instrutor Teste Atualizado",
      updatedAt: new Date()
    });
    console.log('✅ Agendamento atualizado com sucesso');
    
    // Teste 4: Verificar se os nomes foram salvos corretamente
    console.log('\n4. Verificando se os nomes foram salvos...');
    const updatedSnapshot = await getDocs(agendamentosRef);
    const updatedDoc = updatedSnapshot.docs.find(doc => doc.id === docRef.id);
    if (updatedDoc) {
      const updatedData = updatedDoc.data();
      console.log('Dados atualizados:', {
        courseName: updatedData.courseName,
        instructorName: updatedData.instructorName
      });
      
      if (updatedData.courseName && updatedData.instructorName) {
        console.log('✅ SUCESSO: Nomes foram salvos corretamente!');
      } else {
        console.log('❌ ERRO: Nomes ainda não estão sendo salvos!');
      }
    }
    
    // Teste 5: Limpar o agendamento de teste
    console.log('\n5. Removendo agendamento de teste...');
    await deleteDoc(agendamentoRef);
    console.log('✅ Agendamento de teste removido');
    
    console.log('\n🎉 Teste concluído! Verifique se os problemas foram resolvidos.');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

testAgendamentos(); 