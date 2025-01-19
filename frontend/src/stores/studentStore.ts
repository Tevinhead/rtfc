import { create } from 'zustand';
import { createEntityStore, EntityState } from './createEntityStore';
import { studentEntityApi } from '../services/studentEntityApi';
import { studentApi } from '../services/api';
import type { Student, MatchHistoryItem } from '../types';
import { useBattleStore } from './battleStore';

interface StudentStoreState {
  // Base state
  students: Student[];
  loading: boolean;
  error: string | null;
  studentHistory: Record<string, MatchHistoryItem[]>;
  // Operations
  fetchStudents: () => Promise<void>;
  addStudent: (data: Partial<Student>) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  // Custom functionality
  updateStudentStats: (studentId: string) => Promise<void>;
  fetchStudentHistory: (studentId: string) => Promise<void>;
  resetStudentStats: (studentId: string) => Promise<void>;
}

type SetState = (
  partial: Partial<StudentStoreState> | 
  ((state: StudentStoreState) => Partial<StudentStoreState>),
  replace?: boolean
) => void;

// Custom set function to handle state updates
const createCustomSet = (baseSet: SetState): SetState => (partial) => {
  baseSet((state) => {
    const newState = typeof partial === 'function' ? partial(state) : partial;
    return {
      ...state,
      ...newState
    };
  });
};

// Store implementation
const createStore = (baseSet: any, get: any, _store: any): StudentStoreState => {
  const set = createCustomSet(baseSet as SetState);

  // Create entity store directly
  const studentStore = createEntityStore<Student>(
    'students',
    studentEntityApi
  )(
    (partial) => set((state) => ({
      ...state,
      loading: 'loading' in partial ? partial.loading : state.loading,
      error: 'error' in partial ? partial.error : state.error,
      students: 'items' in partial ? partial.items : state.students
    })),
    () => {
      const state = get();
      return {
        items: state.students,
        loading: state.loading,
        error: state.error,
        fetchAll: state.fetchStudents,
        createItem: state.addStudent,
        updateItem: state.updateStudent,
        deleteItem: state.deleteStudent
      };
    },
    _store
  );

  return {
    // Initialize state
    students: [],
    loading: false,
    error: null,
    studentHistory: {},

    // Map operations
    fetchStudents: studentStore.fetchAll,
    addStudent: studentStore.createItem!,
    updateStudent: studentStore.updateItem!,
    deleteStudent: studentStore.deleteItem!,
    
    // Custom functionality
    updateStudentStats: async (studentId: string) => {
      try {
        const response = await studentApi.getStats(studentId);
        set((state) => ({
          ...state,
          students: state.students.map((student: Student) =>
            student.id === studentId ? response.data.data : student
          ),
          error: null
        }));
      } catch (err) {
        console.error('Failed to update student stats:', err);
        set((state) => ({
          ...state,
          error: 'Failed to update student stats'
        }));
      }
    },

    fetchStudentHistory: async (studentId: string) => {
      // Skip if we already have the history
      const currentState = get();
      if (studentId in currentState.studentHistory) {
        return;
      }
      
      set({ loading: true, error: null });
      try {
        const response = await studentApi.getHistory(studentId);
        const { data } = response.data;
        set(state => ({
          ...state,
          studentHistory: {
            ...state.studentHistory,
            [studentId]: data,
          },
          loading: false,
          error: null
        }));
      } catch (err) {
        console.error('Failed to fetch student history:', err);
        set({ loading: false, error: 'Failed to fetch student history' });
      }
    },

    resetStudentStats: async (studentId: string) => {
      set({ loading: true, error: null });
      try {
        const response = await studentApi.resetStats(studentId);
        
        // Update student in store and clear their match history
        set((state) => {
          const updatedHistory = { ...state.studentHistory };
          delete updatedHistory[studentId]; // Remove their entire history

          return {
            ...state,
            students: state.students.map((student) =>
              student.id === studentId ? response.data.data : student
            ),
            studentHistory: updatedHistory,
            loading: false,
            error: null
          };
        });

        // Reset arena state if the student is in the current session
        const battleStore = useBattleStore.getState();
        const currentSession = battleStore.currentArenaSession;
        if (currentSession?.participants.some(p => p.student_id === studentId)) {
          battleStore.resetArena();
        }
      } catch (err) {
        console.error('Failed to reset student stats:', err);
        set({
          loading: false,
          error: 'Failed to reset student stats'
        });
      }
    }
  };
};

// Create and export the store
export const useStudentStore = create<StudentStoreState>(createStore);
