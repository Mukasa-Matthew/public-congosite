import { api } from '../config/api';

export const newsletterService = {
  subscribe: async (email: string): Promise<void> => {
    await api.post('/newsletter/subscribe', { email });
  },
};

