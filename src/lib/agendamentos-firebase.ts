import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';

export interface ScheduledClass {
  id: string;
  courseId: string;
  courseName?: string; // Para facilitar a exibição
  instructorId: string;
  instructorName?: string; // Para facilitar a exibição
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

export async function getAgendamentos(): Promise<ScheduledClass[]> {
  try {
    const agendamentosRef = collection(db, 'agendamentos');
    const q = query(agendamentosRef, orderBy('scheduledDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const agendamentos: ScheduledClass[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      agendamentos.push({
        id: doc.id,
        courseId: data.courseId || '',
        courseName: data.courseName || '',
        instructorId: data.instructorId || '',
        instructorName: data.instructorName || '',
        studentIds: data.studentIds || [],
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        locationType: data.locationType || 'Presencial',
        location: data.location || '',
        status: data.status || 'Agendada',
        observacoes: data.observacoes,
        maxStudents: data.maxStudents,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return agendamentos;
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw new Error('Falha ao buscar agendamentos');
  }
}

export async function getAgendamentoById(id: string): Promise<ScheduledClass | null> {
  try {
    const agendamentoRef = doc(db, 'agendamentos', id);
    const agendamentoSnap = await getDoc(agendamentoRef);
    
    if (agendamentoSnap.exists()) {
      const data = agendamentoSnap.data();
      return {
        id: agendamentoSnap.id,
        courseId: data.courseId || '',
        courseName: data.courseName || '',
        instructorId: data.instructorId || '',
        instructorName: data.instructorName || '',
        studentIds: data.studentIds || [],
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        locationType: data.locationType || 'Presencial',
        location: data.location || '',
        status: data.status || 'Agendada',
        observacoes: data.observacoes,
        maxStudents: data.maxStudents,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    throw new Error('Falha ao buscar agendamento');
  }
}

export async function addAgendamento(agendamentoData: Omit<ScheduledClass, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduledClass> {
  try {
    const agendamentosRef = collection(db, 'agendamentos');
    
    // Filtrar campos undefined para evitar erro do Firebase
    const dataToSave = Object.fromEntries(
      Object.entries(agendamentoData).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(agendamentosRef, {
      ...dataToSave,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      id: docRef.id,
      ...agendamentoData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Erro ao adicionar agendamento:', error);
    throw new Error('Falha ao adicionar agendamento');
  }
}

export async function updateAgendamento(id: string, agendamentoData: Partial<ScheduledClass>): Promise<void> {
  try {
    const agendamentoRef = doc(db, 'agendamentos', id);
    
    // Filtrar campos undefined para evitar erro do Firebase
    const dataToSave = Object.fromEntries(
      Object.entries(agendamentoData).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(agendamentoRef, {
      ...dataToSave,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    throw new Error('Falha ao atualizar agendamento');
  }
}

export async function deleteAgendamento(id: string): Promise<void> {
  try {
    const agendamentoRef = doc(db, 'agendamentos', id);
    await deleteDoc(agendamentoRef);
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    throw new Error('Falha ao deletar agendamento');
  }
}

export async function getAgendamentosByStatus(status: string): Promise<ScheduledClass[]> {
  try {
    const agendamentosRef = collection(db, 'agendamentos');
    
    // Primeiro, tentar com ordenação (quando o índice estiver pronto)
    try {
      const q = query(agendamentosRef, where('status', '==', status), orderBy('scheduledDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const agendamentos: ScheduledClass[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        agendamentos.push({
          id: doc.id,
          courseId: data.courseId || '',
          courseName: data.courseName || '',
          instructorId: data.instructorId || '',
          instructorName: data.instructorName || '',
          studentIds: data.studentIds || [],
          scheduledDate: data.scheduledDate?.toDate() || new Date(),
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          locationType: data.locationType || 'Presencial',
          location: data.location || '',
          status: data.status || 'Agendada',
          observacoes: data.observacoes,
          maxStudents: data.maxStudents,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      
      return agendamentos;
    } catch (indexError) {
      // Se o índice ainda não estiver pronto, usar apenas filtro sem ordenação
      console.log('⚠️ Índice ainda não está pronto, usando filtro sem ordenação...');
      
      const q = query(agendamentosRef, where('status', '==', status));
      const querySnapshot = await getDocs(q);
      
      const agendamentos: ScheduledClass[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        agendamentos.push({
          id: doc.id,
          courseId: data.courseId || '',
          courseName: data.courseName || '',
          instructorId: data.instructorId || '',
          instructorName: data.instructorName || '',
          studentIds: data.studentIds || [],
          scheduledDate: data.scheduledDate?.toDate() || new Date(),
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          locationType: data.locationType || 'Presencial',
          location: data.location || '',
          status: data.status || 'Agendada',
          observacoes: data.observacoes,
          maxStudents: data.maxStudents,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      
      // Ordenar manualmente no JavaScript
      agendamentos.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
      
      return agendamentos;
    }
  } catch (error) {
    console.error('Erro ao buscar agendamentos por status:', error);
    throw new Error('Falha ao buscar agendamentos por status');
  }
}

export async function getAgendamentosByInstrutor(instrutorId: string): Promise<ScheduledClass[]> {
  try {
    const agendamentosRef = collection(db, 'agendamentos');
    const q = query(agendamentosRef, where('instructorId', '==', instrutorId), orderBy('scheduledDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const agendamentos: ScheduledClass[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      agendamentos.push({
        id: doc.id,
        courseId: data.courseId || '',
        courseName: data.courseName || '',
        instructorId: data.instructorId || '',
        instructorName: data.instructorName || '',
        studentIds: data.studentIds || [],
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        locationType: data.locationType || 'Presencial',
        location: data.location || '',
        status: data.status || 'Agendada',
        observacoes: data.observacoes,
        maxStudents: data.maxStudents,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return agendamentos;
  } catch (error) {
    console.error('Erro ao buscar agendamentos por instrutor:', error);
    throw new Error('Falha ao buscar agendamentos por instrutor');
  }
}

export async function getAgendamentosByCurso(courseId: string): Promise<ScheduledClass[]> {
  try {
    const agendamentosRef = collection(db, 'agendamentos');
    const q = query(agendamentosRef, where('courseId', '==', courseId), orderBy('scheduledDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const agendamentos: ScheduledClass[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      agendamentos.push({
        id: doc.id,
        courseId: data.courseId || '',
        courseName: data.courseName || '',
        instructorId: data.instructorId || '',
        instructorName: data.instructorName || '',
        studentIds: data.studentIds || [],
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        locationType: data.locationType || 'Presencial',
        location: data.location || '',
        status: data.status || 'Agendada',
        observacoes: data.observacoes,
        maxStudents: data.maxStudents,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return agendamentos;
  } catch (error) {
    console.error('Erro ao buscar agendamentos por curso:', error);
    throw new Error('Falha ao buscar agendamentos por curso');
  }
}

export async function getAgendamentosByData(dataInicio: Date, dataFim: Date): Promise<ScheduledClass[]> {
  try {
    const agendamentosRef = collection(db, 'agendamentos');
    const q = query(
      agendamentosRef, 
      where('scheduledDate', '>=', dataInicio),
      where('scheduledDate', '<=', dataFim),
      orderBy('scheduledDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const agendamentos: ScheduledClass[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      agendamentos.push({
        id: doc.id,
        courseId: data.courseId || '',
        courseName: data.courseName || '',
        instructorId: data.instructorId || '',
        instructorName: data.instructorName || '',
        studentIds: data.studentIds || [],
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        locationType: data.locationType || 'Presencial',
        location: data.location || '',
        status: data.status || 'Agendada',
        observacoes: data.observacoes,
        maxStudents: data.maxStudents,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return agendamentos;
  } catch (error) {
    console.error('Erro ao buscar agendamentos por data:', error);
    throw new Error('Falha ao buscar agendamentos por data');
  }
} 