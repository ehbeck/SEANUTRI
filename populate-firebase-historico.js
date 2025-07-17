const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } = require('firebase/firestore');

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

async function main() {
  // 1. Empresa
  const companyData = {
    name: 'Empresa Exemplo',
    contact: 'contato@empresaexemplo.com',
    status: 'Ativa',
  };
  let companyId;
  const companiesRef = collection(db, 'companies');
  const companiesSnap = await getDocs(query(companiesRef, where('name', '==', companyData.name)));
  if (!companiesSnap.empty) {
    companyId = companiesSnap.docs[0].id;
    console.log('Empresa já existe:', companyId);
  } else {
    const companyDoc = await addDoc(companiesRef, companyData);
    companyId = companyDoc.id;
    console.log('Empresa criada:', companyId);
  }

  // 2. Curso
  const courseData = {
    title: 'Curso de Segurança Offshore',
    description: 'Treinamento obrigatório para trabalho offshore.',
    image: '',
    hint: 'Curso obrigatório',
    instructorId: '',
    feedback: [],
    syllabus: ['Módulo 1', 'Módulo 2'],
  };
  let courseId;
  const coursesRef = collection(db, 'courses');
  const coursesSnap = await getDocs(query(coursesRef, where('title', '==', courseData.title)));
  if (!coursesSnap.empty) {
    courseId = coursesSnap.docs[0].id;
    console.log('Curso já existe:', courseId);
  } else {
    const courseDoc = await addDoc(coursesRef, courseData);
    courseId = courseDoc.id;
    console.log('Curso criado:', courseId);
  }

  // 3. Usuário aluno
  const userData = {
    name: 'Aluno Exemplo',
    email: 'aluno@empresaexemplo.com',
    role: 'user',
    avatar: '',
    profile: 'Aluno',
    companyId,
    status: 'Ativo',
    hint: 'Usuário de teste',
    enrollments: [],
  };
  let userId;
  const usersRef = collection(db, 'users');
  const usersSnap = await getDocs(query(usersRef, where('email', '==', userData.email)));
  if (!usersSnap.empty) {
    userId = usersSnap.docs[0].id;
    console.log('Usuário já existe:', userId);
  } else {
    const userDoc = await addDoc(usersRef, userData);
    userId = userDoc.id;
    console.log('Usuário criado:', userId);
  }

  // 4. Matrícula
  const enrollmentData = {
    courseId,
    userId,
    status: 'Concluído',
    grade: 9.5,
    approved: true,
    completionDate: Timestamp.fromDate(new Date()),
    verificationCode: 'ABC123',
    instructorId: '',
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  };
  const enrollmentsRef = collection(db, 'enrollments');
  const enrollmentsSnap = await getDocs(query(enrollmentsRef, where('userId', '==', userId), where('courseId', '==', courseId)));
  if (!enrollmentsSnap.empty) {
    console.log('Matrícula já existe:', enrollmentsSnap.docs[0].id);
  } else {
    const enrollmentDoc = await addDoc(enrollmentsRef, enrollmentData);
    console.log('Matrícula criada:', enrollmentDoc.id);
  }

  console.log('\n✅ Dados de exemplo inseridos com sucesso!');
}

main().catch(console.error); 