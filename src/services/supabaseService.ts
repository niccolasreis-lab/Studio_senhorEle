import { createClient } from '@supabase/supabase-js';
import { CustomVehicle } from './customVehicleService';

export const SUPABASE_URL = 'https://npfqnsgjicmxwmurwosu.supabase.co';
export const SUPABASE_PROJECT_REF = 'npfqnsgjicmxwmurwosu';

const STORAGE_KEY_ANON = 'studio_supabase_anon_key';

export const getSupabaseAnonKey = (): string => {
  return localStorage.getItem(STORAGE_KEY_ANON) || '';
};

export const setSupabaseAnonKey = (key: string): void => {
  localStorage.setItem(STORAGE_KEY_ANON, key.trim());
};

export const getSupabaseClient = () => {
  const key = getSupabaseAnonKey();
  if (!key) return null;
  return createClient(SUPABASE_URL, key);
};

export const SupabaseService = {
  async fetchVehicles(): Promise<CustomVehicle[]> {
    try {
      const client = getSupabaseClient();
      if (!client) return [];

      const { data, error } = await client
        .from('custom_vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Supabase fetch notice:', error?.message);
        return [];
      }

      return data.map((item: any) => ({
        id: item.id || `custom-${item.share_id}`,
        shareId: item.share_id || item.shareId,
        title: item.title,
        subtitle: item.subtitle,
        image: item.image,
        year: String(item.year),
        engine: item.engine,
        transmission: item.transmission,
        color: item.color,
        power: item.power,
        condition: item.condition,
        description: item.description,
        isCustom: true,
      }));
    } catch (err) {
      console.warn('Supabase connection warning:', err);
      return [];
    }
  },

  async insertVehicle(vehicle: CustomVehicle): Promise<boolean> {
    try {
      const client = getSupabaseClient();
      if (!client) return false;

      const { error } = await client.from('custom_vehicles').insert([
        {
          id: vehicle.id,
          share_id: vehicle.shareId,
          title: vehicle.title,
          subtitle: vehicle.subtitle,
          image: vehicle.image,
          year: vehicle.year,
          engine: vehicle.engine,
          transmission: vehicle.transmission,
          color: vehicle.color || '',
          power: vehicle.power || '',
          condition: vehicle.condition || '',
          description: vehicle.description || '',
        },
      ]);

      if (error) {
        console.warn('Supabase insert error:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async deleteVehicle(id: string): Promise<boolean> {
    try {
      const client = getSupabaseClient();
      if (!client) return false;

      const { error } = await client.from('custom_vehicles').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },
};
