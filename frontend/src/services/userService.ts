import { api } from '../lib/api';

export const userService = {
  connectSocialAccount: async (platform: string): Promise<void> => {
    await api.post(`/users/social/${platform}/connect`);
  },
}; 