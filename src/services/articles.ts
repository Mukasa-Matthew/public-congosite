import { api } from '../config/api';

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  body: string;
  featured_image: string | null;
  category_id: number | null;
  category_name?: string;
  tags?: string;
  meta_title: string | null;
  meta_description: string | null;
  status: 'draft' | 'published' | 'archived';
  views: number;
  author_id: number | null;
  scheduled_publish_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

export const articlesService = {
  getPublished: async (params?: {
    page?: number;
    limit?: number;
    category?: number;
    search?: string;
  }): Promise<ArticlesResponse> => {
    const response = await api.get('/articles/public', {
      params,
    });
    // Backend returns { articles, pagination } but we need { articles, total, page, limit }
    const data = response.data;
    return {
      articles: data.articles || [],
      total: data.pagination?.total || 0,
      page: data.pagination?.page || 1,
      limit: data.pagination?.limit || 10,
    };
  },

  getById: async (id: number): Promise<Article> => {
    const response = await api.get(`/articles/public/${id}`);
    return response.data;
  },

  getTrending: async (limit?: number): Promise<Article[]> => {
    const response = await api.get('/articles/public/trending', {
      params: { limit },
    });
    return response.data.articles || [];
  },

  getRelated: async (id: number, categoryId?: number, limit?: number): Promise<Article[]> => {
    const response = await api.get('/articles/public/related', {
      params: { id, category: categoryId, limit },
    });
    return response.data.articles || [];
  },
};

