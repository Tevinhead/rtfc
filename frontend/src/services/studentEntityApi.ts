import type { Student, CreateStudentRequest } from '../types';
import { studentApi } from './api';
import { EntityApi } from '../stores/createEntityStore';

export const studentEntityApi: EntityApi<Student> = {
  getAll: async () => {
    const response = await studentApi.getAll();
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await studentApi.getById(id);
    return response.data.data;
  },
  create: async (data: Partial<Student>) => {
    const response = await studentApi.create({
      name: data.name as string,
      avatar_url: data.avatar_url as string,
    });
    return response.data.data;
  },
  update: async (id: string, data: Partial<Student>) => {
    const response = await studentApi.update(id, {
      name: data.name as string,
      avatar_url: data.avatar_url as string,
    });
    return response.data.data;
  },
  delete: async (id: string) => {
    await studentApi.delete(id);
  },
};
