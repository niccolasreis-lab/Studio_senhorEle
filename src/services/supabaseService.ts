import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import type { CustomVehicle, VehicleStatus } from './customVehicleService';

export const SUPABASE_URL = 'https://rucqvvollyrlgyekoelq.supabase.co';
export const SUPABASE_PROJECT_REF = 'rucqvvollyrlgyekoelq';

const STORAGE_KEY_ANON = 'studio_supabase_anon_key';
export const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_BAB7c_Baja_BHKFJvws7hg_HzHRIVAr';

export const getSupabaseAnonKey = (): string => {
  return localStorage.getItem(STORAGE_KEY_ANON) || DEFAULT_PUBLISHABLE_KEY;
};

export const setSupabaseAnonKey = (key: string): void => {
  localStorage.setItem(STORAGE_KEY_ANON, key.trim());
};

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  const key = getSupabaseAnonKey();
  if (!key) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return supabaseClient;
};

export const SupabaseService = {
  async getSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const client = getSupabaseClient();
    if (!client) return () => undefined;
    const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },

  async signIn(email: string, password: string): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return 'A conexão com o Supabase não está configurada.';
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return 'E-mail ou senha inválidos.';
    if (data.user.app_metadata?.role !== 'admin') {
      await client.auth.signOut();
      return 'Este usuário não possui acesso administrativo.';
    }
    return null;
  },

  async signOut(): Promise<void> {
    await getSupabaseClient()?.auth.signOut();
  },

  /** Faz upload de uma imagem para o bucket público de veículos. */
  async uploadImage(file: File, path?: string): Promise<string | null> {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = path || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 60)}`;
      const { error } = await client.storage.from('vehicle-images').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || `image/${ext}`,
      });

      if (error) {
        console.warn('Supabase upload error:', error.message);
        return null;
      }

      return `${SUPABASE_URL}/storage/v1/object/public/vehicle-images/${encodeURIComponent(fileName)}`;
    } catch (err) {
      console.warn('Supabase upload warning:', err);
      return null;
    }
  },

  async fetchVehicles(): Promise<CustomVehicle[] | null> {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from('custom_vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Supabase fetch notice:', error?.message);
        return null;
      }

      return data.map((item: any) => ({
        id: item.id || `custom-${item.share_id}`,
        shareId: item.share_id || item.shareId,
        title: item.title,
        subtitle: item.subtitle,
        image: item.image,
        image2: item.image2,
        image3: item.image3,
        gallery: Array.isArray(item.gallery) ? item.gallery : [],
        year: String(item.year),
        engine: item.engine,
        transmission: item.transmission,
        color: item.color,
        power: item.power,
        condition: item.condition,
        description: item.description,
        status: (item.collection_kind === 'guest' && (item.status === 'reserved' || item.status === 'sold')
          ? 'draft'
          : item.status || 'published') as VehicleStatus,
        collectionKind: item.collection_kind === 'guest' ? 'guest' : 'studio',
        isCustom: true,
      }));
    } catch (err) {
      console.warn('Supabase connection warning:', err);
      return null;
    }
  },

  async insertVehicle(vehicle: CustomVehicle): Promise<boolean> {
    try {
      const client = getSupabaseClient();
      if (!client) return false;

      const collectionKind = vehicle.collectionKind === 'guest' ? 'guest' : 'studio';
      const status = collectionKind === 'guest' && (vehicle.status === 'reserved' || vehicle.status === 'sold')
        ? 'draft'
        : vehicle.status || 'draft';
      const cleanShareId = vehicle.shareId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 96);
      const shareId = collectionKind === 'guest' && !cleanShareId.startsWith('CONV-')
        ? `CONV-${cleanShareId.replace(/^(SRL-|CONV-)/, '')}`
        : cleanShareId;

      const { error } = await client.from('custom_vehicles').upsert([
        {
          id: vehicle.id,
          share_id: shareId,
          title: vehicle.title,
          subtitle: vehicle.subtitle,
          image: vehicle.image,
          image2: vehicle.image2 || '',
          image3: vehicle.image3 || '',
          gallery: Array.isArray(vehicle.gallery) ? vehicle.gallery : [],
          year: vehicle.year,
          engine: vehicle.engine,
          transmission: vehicle.transmission,
          color: vehicle.color || '',
          power: vehicle.power || '',
          condition: vehicle.condition || '',
          description: vehicle.description || '',
          status,
          collection_kind: collectionKind,
        },
      ], { onConflict: 'id' });

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
