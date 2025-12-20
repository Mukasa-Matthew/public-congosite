import { api } from '../config/api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/public');
    return response.data;
  },
};

