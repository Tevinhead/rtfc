import { create } from 'zustand';
import { createEntityStore, EntityState } from './createEntityStore';
import { studentEntityApi } from '../services/studentEntityApi';
import { studentApi } from '../services/api';
import type { Student, MatchHistoryItem } from '../types';

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

  // Create a wrapper function to handle entity state conversion
  const createEntityStateWrapper = <T>(
    entityStore: (
      set: any,
      get: () => EntityState<T>,
      store: any
    ) => EntityState<T>
  ) => {
    return (set: any, get: any, store: any): EntityState<T> => {
      const wrappedGet = () => ({
        items: [],
        loading: false,
        error: null,
        fetchAll: async () => {},
        ...get()
      }) as EntityState<T>;
      
      return entityStore(set, wrappedGet, store);
    };
  };

  // Create entity store with wrapped state
  const studentStore = createEntityStateWrapper<Student>(
    createEntityStore<Student>('students', studentEntityApi)
  )(
    (partial: EntityState<Student> | Partial<EntityState<Student>>) => 
      set((state) => ({
        ...state,
        loading: 'loading' in partial ? partial.loading : state.loading,
        error: 'error' in partial ? partial.error : state.error,
        students: 'items' in partial ? partial.items : state.students
      })),
    get,
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
    }
  };
};

// Create and export the store
export const useStudentStore = create<StudentStoreState>(createStore);
