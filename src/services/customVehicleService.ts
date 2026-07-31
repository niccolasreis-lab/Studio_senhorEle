import { SupabaseService } from './supabaseService';

export interface CustomVehicle {
  id: string;
  shareId: string;
  title: string;
  subtitle: string;
  image: string;
  year: string;
  engine: string;
  transmission: string;
  color?: string;
  power?: string;
  condition?: string;
  description?: string;
  isCustom?: boolean;
}

const STORAGE_KEY = 'studio_custom_vehicles';

export const CustomVehicleService = {
  getCustomVehicles(): CustomVehicle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async syncWithSupabase(): Promise<CustomVehicle[]> {
    try {
      const supabaseVehicles = await SupabaseService.fetchVehicles();
      if (supabaseVehicles.length > 0) {
        const local = this.getCustomVehicles();
        // Merge Supabase vehicles with local, prioritizing Supabase items
        const map = new Map<string, CustomVehicle>();
        local.forEach((v) => map.set(v.id, v));
        supabaseVehicles.forEach((v) => map.set(v.id, v));
        
        const merged = Array.from(map.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated'));
        }

        return merged;
      }
    } catch (e) {
      console.warn('Supabase sync notice:', e);
    }
    return this.getCustomVehicles();
  },

  addCustomVehicle(vehicleData: Omit<CustomVehicle, 'id' | 'isCustom'>): CustomVehicle {
    const vehicles = this.getCustomVehicles();
    const cleanSlug = vehicleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const uniqueId = `custom-${cleanSlug}-${Date.now()}`;
    const newVehicle: CustomVehicle = {
      ...vehicleData,
      id: uniqueId,
      isCustom: true,
    };

    vehicles.unshift(newVehicle);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    
    // Async push to Supabase Cloud Database if key configured
    SupabaseService.insertVehicle(newVehicle).catch((err) =>
      console.warn('Supabase cloud push notice:', err)
    );

    // Dispatch custom event for real-time reactive UI updates in current tab
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated', { detail: newVehicle }));
    }

    return newVehicle;
  },

  deleteCustomVehicle(id: string): void {
    const vehicles = this.getCustomVehicles().filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));

    // Async delete from Supabase Cloud Database
    SupabaseService.deleteVehicle(id).catch((err) =>
      console.warn('Supabase cloud delete notice:', err)
    );

    // Dispatch custom event for real-time reactive UI updates in current tab
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated', { detail: { deletedId: id } }));
    }
  },
};
