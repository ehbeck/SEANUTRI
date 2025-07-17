const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAVaDdDt-k_MDB7Rj_tqqHSTysrRfHEVRg",
  authDomain: "offshore-nutrition-tracker.firebaseapp.com",
  projectId: "offshore-nutrition-tracker",
  storageBucket: "offshore-nutrition-tracker.firebasestorage.app",
  messagingSenderId: "275779212119",
  appId: "1:275779212119:web:d51f4e06605925b1c36412"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testHistoricoData() {
  console.log('🔍 Testando dados do módulo de histórico...\n');

  try {
    // Testar matrículas
    console.log('📝 Verificando matrículas...');
    const enrollmentsRef = collection(db, 'enrollments');
    const enrollmentsQuery = query(enrollmentsRef, orderBy('createdAt', 'desc'));
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    
    console.log(`✅ Encontradas ${enrollmentsSnapshot.size} matrículas:`);
    enrollmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    UserId: ${data.userId}`);
      console.log(`    CourseId: ${data.courseId}`);
      console.log(`    Status: ${data.status}`);
      console.log(`    Grade: ${data.grade}`);
      console.log(`    Approved: ${data.approved}`);
      console.log(`    CompletionDate: ${data.completionDate?.toDate()}`);
      console.log(`    CreatedAt: ${data.createdAt?.toDate()}`);
      console.log('');
    });

    // Testar usuários
    console.log('👥 Verificando usuários...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`✅ Encontrados ${usersSnapshot.size} usuários:`);
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Name: ${data.name}`);
      console.log(`    Email: ${data.email}`);
      console.log(`    Profile: ${data.profile}`);
      console.log(`    CompanyId: ${data.companyId}`);
      console.log('');
    });

    // Testar cursos
    console.log('📚 Verificando cursos...');
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    console.log(`✅ Encontrados ${coursesSnapshot.size} cursos:`);
    coursesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Title: ${data.title || data.titulo}`);
      console.log(`    InstructorId: ${data.instructorId}`);
      console.log('');
    });

    // Testar empresas
    console.log('🏢 Verificando empresas...');
    const companiesRef = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesRef);
    
    console.log(`✅ Encontradas ${companiesSnapshot.size} empresas:`);
    companiesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Name: ${data.name}`);
      console.log(`    Status: ${data.status}`);
      console.log('');
    });

    // Análise de relacionamentos
    console.log('🔗 Análise de relacionamentos...');
    const enrollments = [];
    const users = [];
    const courses = [];
    const companies = [];

    enrollmentsSnapshot.forEach((doc) => {
      enrollments.push({ id: doc.id, ...doc.data() });
    });

    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    coursesSnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });

    companiesSnapshot.forEach((doc) => {
      companies.push({ id: doc.id, ...doc.data() });
    });

    console.log('📊 Estatísticas:');
    console.log(`  - Matrículas: ${enrollments.length}`);
    console.log(`  - Usuários: ${users.length}`);
    console.log(`  - Cursos: ${courses.length}`);
    console.log(`  - Empresas: ${companies.length}`);

    // Verificar matrículas com dados válidos
    let validEnrollments = 0;
    let missingUsers = 0;
    let missingCourses = 0;

    enrollments.forEach(enrollment => {
      const user = users.find(u => u.id === enrollment.userId);
      const course = courses.find(c => c.id === enrollment.courseId);
      
      if (user && course) {
        validEnrollments++;
      } else {
        if (!user) missingUsers++;
        if (!course) missingCourses++;
      }
    });

    console.log('\n🔍 Validação de dados:');
    console.log(`  - Matrículas válidas: ${validEnrollments}`);
    console.log(`  - Matrículas com usuário ausente: ${missingUsers}`);
    console.log(`  - Matrículas com curso ausente: ${missingCourses}`);

    if (validEnrollments > 0) {
      console.log('\n✅ Dados válidos encontrados! O histórico deve funcionar.');
    } else {
      console.log('\n❌ Nenhuma matrícula válida encontrada. Verifique os relacionamentos.');
    }

  } catch (error) {
    console.error('❌ Erro ao testar dados:', error);
  }
}

testHistoricoData(); 