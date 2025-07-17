import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { users as allUsers } from './data';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  profile: string;
  companyId: string;
  status: 'Ativo' | 'Inativo';
  hint: string;
  enrollments: Enrollment[];
}

export interface Company {
  id: string;
  name: string;
  contact: string;
  status: 'Ativa' | 'Inativa';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  hint: string;
  instructorId: string;
  feedback: string[];
  syllabus: string[];
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  avatar: string;
  hint: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  status: 'Não Iniciado' | 'Em Progresso' | 'Concluído';
  grade: number | null;
  approved: boolean | null;
  completionDate: Date | null;
  verificationCode: string | null;
  instructorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledClass {
  id: string;
  courseId: string;
  courseName?: string;
  instructorId: string;
  instructorName?: string;
  studentIds: string[];
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  locationType: 'Presencial' | 'Online';
  location: string;
  status: 'Agendada' | 'Concluída';
  observacoes?: string;
  maxStudents?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Função utilitária para remover valores undefined
function removeUndefinedValues(obj: any): any {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Funções genéricas para CRUD
async function createDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<T> {
  try {
    const cleanedData = removeUndefinedValues(data);
    const docRef = await addDoc(collection(db, collectionName), {
      ...cleanedData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...cleanedData } as T;
  } catch (error) {
    console.error(`Erro ao criar documento em ${collectionName}:`, error);
    throw error;
  }
}

async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar documento em ${collectionName}:`, error);
    throw error;
  }
}

async function updateDocument<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    const cleanedData = removeUndefinedValues(data);
    await updateDoc(docRef, {
      ...cleanedData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error(`Erro ao atualizar documento em ${collectionName}:`, error);
    throw error;
  }
}

async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Erro ao deletar documento em ${collectionName}:`, error);
    throw error;
  }
}

async function getDocuments<T>(collectionName: string, filters?: Array<[string, string, any]>): Promise<T[]> {
  try {
    let q: any = collection(db, collectionName);
    
    if (filters) {
      filters.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator as any, value));
      });
    }
    
    const querySnapshot = await getDocs(q);
    const documents: T[] = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...(doc.data() as any) } as T);
    });
    
    return documents;
  } catch (error) {
    console.error(`Erro ao buscar documentos em ${collectionName}:`, error);
    throw error;
  }
}

// Serviços específicos
export const userService = {
  create: (data: Omit<User, 'id'>) => createDocument<User>('users', data),
  get: (id: string) => getDocument<User>('users', id),
  update: (id: string, data: Partial<User>) => updateDocument<User>('users', id, data),
  delete: (id: string) => deleteDocument('users', id),
  getAll: () => getDocuments<User>('users'),
  getByCompany: (companyId: string) => getDocuments<User>('users', [['companyId', '==', companyId]]),
  getByProfile: (profile: string) => getDocuments<User>('users', [['profile', '==', profile]]),
  getByStatus: (status: string) => getDocuments<User>('users', [['status', '==', status]])
};

export const companyService = {
  create: (data: Omit<Company, 'id'>) => createDocument<Company>('companies', data),
  get: (id: string) => getDocument<Company>('companies', id),
  update: (id: string, data: Partial<Company>) => updateDocument<Company>('companies', id, data),
  delete: (id: string) => deleteDocument('companies', id),
  getAll: () => getDocuments<Company>('companies'),
  getByStatus: (status: string) => getDocuments<Company>('companies', [['status', '==', status]])
};

export const courseService = {
  create: (data: Omit<Course, 'id'>) => createDocument<Course>('courses', data),
  get: (id: string) => getDocument<Course>('courses', id),
  update: (id: string, data: Partial<Course>) => updateDocument<Course>('courses', id, data),
  delete: (id: string) => deleteDocument('courses', id),
  getAll: () => getDocuments<Course>('courses'),
  getByInstructor: (instructorId: string) => getDocuments<Course>('courses', [['instructorId', '==', instructorId]])
};

export const instructorService = {
  create: (data: Instructor) => createDocument<Instructor>('instructors', data),
  get: (id: string) => getDocument<Instructor>('instructors', id),
  update: (id: string, data: Partial<Instructor>) => updateDocument<Instructor>('instructors', id, data),
  delete: (id: string) => deleteDocument('instructors', id),
  getAll: () => getDocuments<Instructor>('instructors')
};

// Serviço real para matrículas no Firebase
export const enrollmentService = {
  create: async (data: Omit<Enrollment, 'id'>): Promise<Enrollment> => {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const docRef = await addDoc(enrollmentsRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
      throw new Error('Falha ao criar matrícula');
    }
  },
  
  get: async (id: string): Promise<Enrollment | null> => {
    try {
      const enrollmentRef = doc(db, 'enrollments', id);
      const enrollmentSnap = await getDoc(enrollmentRef);
      
      if (enrollmentSnap.exists()) {
        const data = enrollmentSnap.data();
        return {
          id: enrollmentSnap.id,
          courseId: data.courseId || '',
          userId: data.userId || '',
          status: data.status || 'Não Iniciado',
          grade: data.grade || null,
          approved: data.approved || null,
          completionDate: data.completionDate?.toDate() || null,
          verificationCode: data.verificationCode || null,
          instructorId: data.instructorId || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar matrícula:', error);
      throw new Error('Falha ao buscar matrícula');
    }
  },
  
  update: async (id: string, data: Partial<Enrollment>): Promise<void> => {
    try {
      const enrollmentRef = doc(db, 'enrollments', id);
      await updateDoc(enrollmentRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar matrícula:', error);
      throw new Error('Falha ao atualizar matrícula');
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      const enrollmentRef = doc(db, 'enrollments', id);
      await deleteDoc(enrollmentRef);
    } catch (error) {
      console.error('Erro ao deletar matrícula:', error);
      throw new Error('Falha ao deletar matrícula');
    }
  },
  
  getAll: async (): Promise<Enrollment[]> => {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const q = query(enrollmentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const enrollments: Enrollment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        enrollments.push({
          id: doc.id,
          courseId: data.courseId || '',
          userId: data.userId || '',
          status: data.status || 'Não Iniciado',
          grade: data.grade || null,
          approved: data.approved || null,
          completionDate: data.completionDate?.toDate() || null,
          verificationCode: data.verificationCode || null,
          instructorId: data.instructorId || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return enrollments;
    } catch (error) {
      console.error('Erro ao buscar matrículas:', error);
      throw new Error('Falha ao buscar matrículas');
    }
  },
  
  getByUser: async (userId: string): Promise<Enrollment[]> => {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const q = query(enrollmentsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const enrollments: Enrollment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        enrollments.push({
          id: doc.id,
          courseId: data.courseId || '',
          userId: data.userId || '',
          status: data.status || 'Não Iniciado',
          grade: data.grade || null,
          approved: data.approved || null,
          completionDate: data.completionDate?.toDate() || null,
          verificationCode: data.verificationCode || null,
          instructorId: data.instructorId || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return enrollments;
    } catch (error) {
      console.error('Erro ao buscar matrículas do usuário:', error);
      throw new Error('Falha ao buscar matrículas do usuário');
    }
  },
  
  getByCourse: async (courseId: string): Promise<Enrollment[]> => {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const q = query(enrollmentsRef, where('courseId', '==', courseId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const enrollments: Enrollment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        enrollments.push({
          id: doc.id,
          courseId: data.courseId || '',
          userId: data.userId || '',
          status: data.status || 'Não Iniciado',
          grade: data.grade || null,
          approved: data.approved || null,
          completionDate: data.completionDate?.toDate() || null,
          verificationCode: data.verificationCode || null,
          instructorId: data.instructorId || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return enrollments;
    } catch (error) {
      console.error('Erro ao buscar matrículas do curso:', error);
      throw new Error('Falha ao buscar matrículas do curso');
    }
  },
  
  getByStatus: async (status: string): Promise<Enrollment[]> => {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const q = query(enrollmentsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const enrollments: Enrollment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        enrollments.push({
          id: doc.id,
          courseId: data.courseId || '',
          userId: data.userId || '',
          status: data.status || 'Não Iniciado',
          grade: data.grade || null,
          approved: data.approved || null,
          completionDate: data.completionDate?.toDate() || null,
          verificationCode: data.verificationCode || null,
          instructorId: data.instructorId || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return enrollments;
    } catch (error) {
      console.error('Erro ao buscar matrículas por status:', error);
      throw new Error('Falha ao buscar matrículas por status');
    }
  },
  
  getCompleted: async (): Promise<Enrollment[]> => {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const q = query(enrollmentsRef, where('status', '==', 'Concluído'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const enrollments: Enrollment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        enrollments.push({
          id: doc.id,
          courseId: data.courseId || '',
          userId: data.userId || '',
          status: data.status || 'Não Iniciado',
          grade: data.grade || null,
          approved: data.approved || null,
          completionDate: data.completionDate?.toDate() || null,
          verificationCode: data.verificationCode || null,
          instructorId: data.instructorId || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return enrollments;
    } catch (error) {
      console.error('Erro ao buscar matrículas concluídas:', error);
      throw new Error('Falha ao buscar matrículas concluídas');
    }
  }
};

export const scheduledClassService = {
  create: (data: Omit<ScheduledClass, 'id'>) => createDocument<ScheduledClass>('scheduledClasses', data),
  get: (id: string) => getDocument<ScheduledClass>('scheduledClasses', id),
  update: (id: string, data: Partial<ScheduledClass>) => updateDocument<ScheduledClass>('scheduledClasses', id, data),
  delete: (id: string) => deleteDocument('scheduledClasses', id),
  getAll: () => getDocuments<ScheduledClass>('scheduledClasses'),
  getByStatus: (status: string) => getDocuments<ScheduledClass>('scheduledClasses', [['status', '==', status]]),
  getByInstructor: (instructorId: string) => getDocuments<ScheduledClass>('scheduledClasses', [['instructorId', '==', instructorId]]),
  getByCourse: (courseId: string) => getDocuments<ScheduledClass>('scheduledClasses', [['courseId', '==', courseId]]),
  getByDateRange: (startDate: Date, endDate: Date) => getDocuments<ScheduledClass>('scheduledClasses', [
    ['scheduledDate', '>=', startDate],
    ['scheduledDate', '<=', endDate]
  ])
};

// Alias para agendamentoService (usando scheduledClassService)
export const agendamentoService = scheduledClassService;

// Função para atualizar avaliações usando o enrollmentService
export async function updateEvaluation(userId: string, courseId: string, data: { grade: number, approved: boolean, completionDate: Date }) {
  try {
    // Buscar matrícula existente
    const enrollments = await enrollmentService.getByUser(userId);
    const existingEnrollment = enrollments.find(e => e.courseId === courseId);
    
    if (existingEnrollment) {
      // Atualizar matrícula existente
      await enrollmentService.update(existingEnrollment.id, {
        grade: data.grade,
        approved: data.approved,
        status: 'Concluído',
        completionDate: data.approved ? data.completionDate : null,
        verificationCode: data.approved ? `CERT-${userId}-${courseId}` : null,
        updatedAt: new Date()
      });
    } else {
      // Criar nova matrícula se não existir
      await enrollmentService.create({
        courseId,
        userId,
        status: 'Concluído',
        grade: data.grade,
        approved: data.approved,
        completionDate: data.approved ? data.completionDate : null,
        verificationCode: data.approved ? `CERT-${userId}-${courseId}` : null,
        instructorId: null, // Será preenchido pelo instrutor da turma
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    throw new Error('Falha ao atualizar avaliação');
  }
}

// Interface para logs de notificação
export interface NotificationLog {
  id: string;
  type: string;
  recipient: string;
  timestamp: Date;
  status: 'Sucesso' | 'Falha';
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  timestamp: Date;
}

// Função para adicionar logs de notificação
export async function addNotificationLog(data: Omit<NotificationLog, 'id' | 'timestamp' | 'status'>, student: any, course: any, certificateUrl?: string) {
  try {
    // Importar configurações de notificação
    const { notificationSettings } = await import('@/lib/data');
    const { sendEmail } = await import('@/services/email');
    
    const templateId = data.type === "Resultado de Aprovação" ? 'result-approved' : 'result-failed';
    const template = notificationSettings.templates.find(t => t.id === templateId);

    let status: 'Sucesso' | 'Falha' = 'Falha';
    let finalType = data.type;

    if (!template || !notificationSettings.enabled || !template.enabled) {
      finalType = `[Desabilitado] ${data.type}`;
    } else {
      let subject = template.subject.replace('{{nome_aluno}}', student.name).replace('{{nome_curso}}', course.title || course.titulo);
      let content = template.content.replace('{{nome_aluno}}', student.name).replace('{{nome_curso}}', course.title || course.titulo);

      // Adicionar link do certificado se disponível
      if (certificateUrl && data.type === "Resultado de Aprovação") {
        content += `\n\nSeu certificado está disponível em: ${certificateUrl}`;
      }

      const result = await sendEmail({
        to: data.recipient,
        subject: subject,
        text: content,
        html: `<p>${content.replace(/\n/g, '<br>')}</p>`,
      });

      status = result.success ? 'Sucesso' : 'Falha';
    }

    const notificationLog: NotificationLog = {
      id: `log-${Date.now()}`,
      type: finalType,
      recipient: data.recipient,
      timestamp: new Date(),
      status: status
    };

    // Salvar no Firestore
    await addDoc(collection(db, 'notificationLogs'), {
      ...notificationLog,
      studentId: student.id,
      studentName: student.name,
      courseId: course.id,
      courseName: course.title || course.titulo,
      certificateUrl: certificateUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return notificationLog;
  } catch (error) {
    console.error('Erro ao adicionar log de notificação:', error);
    throw new Error('Falha ao adicionar log de notificação');
  }
} 

// Função para buscar logs de login
export async function getLoginLogs(): Promise<LoginLog[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'loginLogs'));
    const logs: LoginLog[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        userId: data.userId || '',
        userName: data.userName || '',
        companyName: data.companyName || '',
        timestamp: data.timestamp?.toDate() || new Date(),
      });
    });
    
    // Ordenar por timestamp (mais recente primeiro)
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Erro ao buscar logs de login:', error);
    return [];
  }
}

// Função para adicionar log de login
export async function addLoginLog(userId: string, userName: string, companyName: string): Promise<void> {
  try {
    await addDoc(collection(db, 'loginLogs'), {
      userId,
      userName,
      companyName,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Erro ao adicionar log de login:', error);
  }
}

// Função para buscar logs de notificações
export async function getNotificationLogs(): Promise<NotificationLog[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'notificationLogs'));
    const logs: NotificationLog[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        type: data.type || '',
        recipient: data.recipient || '',
        timestamp: data.timestamp?.toDate() || new Date(),
        status: data.status || 'Falha',
      });
    });
    
    // Ordenar por timestamp (mais recente primeiro)
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Erro ao buscar logs de notificações:', error);
    return [];
  }
} 