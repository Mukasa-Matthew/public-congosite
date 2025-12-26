import { api } from '../config/api';

export interface PublicSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_logo_url: string;
  site_favicon_url: string;
  contact_email: string;
  contact_phone: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  footer_copyright: string;
}

export const settingsService = {
  getPublicSettings: async (): Promise<PublicSettings> => {
    const response = await api.get<PublicSettings>('/settings/public');
    return response.data;
  },
};

