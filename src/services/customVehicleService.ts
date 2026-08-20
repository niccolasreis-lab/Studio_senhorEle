import { SupabaseService } from './supabaseService';
import { SpecGenerator, makeUniqueShareId } from './specGenerator';

export interface CustomVehicle {
  id: string;
  shareId: string;
  title: string;
  subtitle: string;
  image: string;
  image2?: string;
  image3?: string;
  gallery?: string[];
  year: string;
  engine: string;
  transmission: string;
  color?: string;
  power?: string;
  condition?: string;
  description?: string;
  isCustom?: boolean;
  status: VehicleStatus;
  // Campos gerados automaticamente pela ficha (especificações, história etc.).
  // Só são preenchidos quando há informação confiável; ausência = ocultar na UI.
  specs?: { label: string; value: string }[];
  history?: string[];
  curiosities?: string[];
  presentationText?: string;
  variationsNote?: string;
}

export type VehicleStatus = 'draft' | 'published' | 'reserved' | 'sold';

export const normalizeVehicleStatus = (status?: string): VehicleStatus =>
  status === 'draft' || status === 'reserved' || status === 'sold' ? status : 'published';

export const INITIAL_DEFAULT_VEHICLES: CustomVehicle[] = [
  {
    id: 'porsche-911',
    status: 'published',
    shareId: 'SRL-911-1973',
    title: 'Porsche 911 Classic',
    subtitle: 'Matching Numbers • 1973',
    year: '1973',
    engine: '2.4L Flat-6 Boxer',
    transmission: 'Manual 5 Marchas',
    color: 'Guards Red Original',
    power: '190 cv',
    condition: 'Restaurado Concours d\'Elegance',
    description: 'Exemplar ícone da engenharia alemã com números de chassi e motor 100% correspondentes. Interior em couro preto e rodas Fuchs de época.',
    image: '/assets/images/porsche-911-classic-1973.jpg',
  },
  {
    id: 'vw-kombi',
    status: 'published',
    shareId: 'SRL-KMB-1970',
    title: 'VW Kombi Corujinha',
    subtitle: 'Restored Heritage • 1970',
    year: '1970',
    engine: '1500cc Air-Cooled',
    transmission: 'Manual 4 Marchas',
    color: 'Saia e Blusa Turquesa e Branco',
    power: '52 cv',
    condition: 'Colecionável Placa Preta',
    description: 'Restauração minuciosa no padrão de fábrica. Tapeçaria em tom palha, janelas saia e blusa impecáveis e motor 1500cc revisado.',
    image: '/assets/images/vw-kombi-corujinha-1970.jpg',
  },
  {
    id: 'vw-fusca-cal',
    status: 'published',
    shareId: 'SRL-FSC-1968',
    title: 'VW Fusca Cal Style',
    subtitle: 'Air Cooled Custom • 1968',
    year: '1968',
    engine: '1600cc Dupla Carburação',
    transmission: 'EMPI Rápida 4 Marchas',
    color: 'Verde Tahiti Múltiplos Tons',
    power: '65 cv',
    condition: 'Customizado Cal-Look Vintage',
    description: 'Estilo clássico da califórnia anos 60. Suspensão catracada, rodas BRM originais e mecânica boxer retrabalhada.',
    image: '/assets/images/vw-fusca-cal-style-1968.jpg',
  },
  {
    id: 'aero-willys',
    status: 'published',
    shareId: 'SRL-AWL-1967',
    title: 'Aero Willys',
    subtitle: 'Original Impecável • 1967',
    year: '1967',
    engine: '2600 6 Cilindros em Linha',
    transmission: 'Manual 4 Marchas Coluna',
    color: 'Azul Boreal Metálico',
    power: '110 cv',
    condition: 'Acervo de Época',
    description: 'Sedã executivo de luxo nacional com motor 6 cilindros em linha Willys Overland. Painel e mostradores em jacarandá preservados.',
    image: '/assets/images/aero-willys-1967.jpg',
  },
  {
    id: 'aircooled-box-767',
    status: 'published',
    shareId: 'SRL-BOX-1976',
    title: 'Air Cooled Box 767',
    subtitle: 'German Vintage Engineering • 1976',
    year: '1976',
    engine: '2.0L Boxer Air-Cooled',
    transmission: 'Manual 5 Marchas',
    color: 'Cinza Nardo Acetinado',
    power: '105 cv',
    condition: 'Tuning de Época',
    description: 'Projeto exclusivo com preparação esportiva para motores boxer refrigerados a ar. Coletor em inox e instrumentos de precisão.',
    image: '/assets/images/aircooled-box-767.jpg',
  },
  {
    id: 'vw-fusca-1994',
    status: 'published',
    shareId: 'SRL-FSC-1994',
    title: 'VW Fusca Itamar',
    subtitle: 'Edição Especial de Coleção • 1994',
    year: '1994',
    engine: '1600cc Catalisado Air-Cooled',
    transmission: 'Manual 4 Marchas',
    color: 'Verde Tahiti Múltiplos Tons',
    power: '58 cv',
    condition: '100% Selado e Preservado',
    description: 'Raro exemplar da série de religamento presidencial de 1994. Tapeçaria xadrez original, volante de dois raios e manual carimbado.',
    image: '/assets/images/vw-fusca-cal-style-1968.jpg',
  },
  {
    id: 'porsche-911-carrera-1989',
    status: 'published',
    shareId: 'SRL-911-1989',
    title: 'Porsche 911 Carrera 3.2',
    subtitle: 'G50 Gearbox Classic • 1989',
    year: '1989',
    engine: '3.2L Flat-6 Boxer (217 cv)',
    transmission: 'Manual 5 Marchas (Câmbio G50)',
    color: 'Preto Cadilac Brilhante',
    power: '217 cv',
    condition: 'Edição Especial G50',
    description: 'O ápice da era clássica dos Porsche 911 arrefecidos a ar com o cobiçado câmbio Getrag G50. Teto solar elétrico e rodas Fuchs 16".',
    image: '/assets/images/porsche-911-classic-1973.jpg',
  },
];

const STORAGE_KEY = 'studio_custom_vehicles';
const DELETED_IDS_KEY = 'studio_deleted_vehicle_ids';
const CLOUD_SYNCED_KEY = 'studio_custom_vehicles_cloud_synced';
// Ordem de exibição definida pelo admin (array de ids). Persistida à parte para
// sobreviver à "sync" com o Supabase (que apenas recria o merge base + custom).
const ORDER_KEY = 'studio_custom_vehicle_order';

export const CustomVehicleService = {
  getDeletedIds(): string[] {
    try {
      const data = localStorage.getItem(DELETED_IDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getOrderedIds(): string[] {
    try {
      const data = localStorage.getItem(ORDER_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  persistOrder(ids: string[]): void {
    localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
  },

  getCustomVehicles(): CustomVehicle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const customList: CustomVehicle[] = data
        ? JSON.parse(data).map((vehicle: CustomVehicle) => ({ ...vehicle, status: normalizeVehicleStatus(vehicle.status) }))
        : [];
      const deletedIds = this.getDeletedIds();

      // Após uma sincronização válida, a lista retornada pelo Supabase é a
      // fonte de verdade. O RLS omite rascunhos e vendidos da resposta pública;
      // recriar defaults ausentes faria esses veículos reaparecerem publicados.
      if (localStorage.getItem(CLOUD_SYNCED_KEY) === 'true') {
        const cloudSnapshot = customList.filter((vehicle) => !deletedIds.includes(vehicle.id));
        const order = this.getOrderedIds();
        if (order.length === 0) return cloudSnapshot;
        const byId = new Map(cloudSnapshot.map((vehicle) => [vehicle.id, vehicle]));
        const ordered: CustomVehicle[] = [];
        order.forEach((id) => {
          const vehicle = byId.get(id);
          if (vehicle) {
            ordered.push(vehicle);
            byId.delete(id);
          }
        });
        byId.forEach((vehicle) => ordered.push(vehicle));
        return ordered;
      }

      // Antes da primeira sincronização, usa a coleção embutida como fallback.
      const map = new Map<string, CustomVehicle>();
      
      INITIAL_DEFAULT_VEHICLES.forEach((v) => {
        if (!deletedIds.includes(v.id)) {
          map.set(v.id, v);
        }
      });

      customList.forEach((v) => {
        if (!deletedIds.includes(v.id)) {
          map.set(v.id, v);
        }
      });

      const merged = Array.from(map.values());
      const order = this.getOrderedIds();

      // Aplica a curadoria de ordem feita no admin. Veículos novos (sem posição
      // salva) entram no fim da fila; se não houver ordem salva, mantém a padrão.
      if (order.length > 0) {
        const byId = new Map(merged.map((v) => [v.id, v]));
        const ordered: CustomVehicle[] = [];
        order.forEach((id) => {
          const vehicle = byId.get(id);
          if (vehicle) {
            ordered.push(vehicle);
            byId.delete(id);
          }
        });
        byId.forEach((v) => ordered.push(v));
        return ordered;
      }

      return merged;
    } catch {
      return INITIAL_DEFAULT_VEHICLES;
    }
  },

  /** Persiste a nova sequência (ordem de exibição) definida por arrastar. */
  reorderVehicles(ordered: CustomVehicle[]): CustomVehicle[] {
    this.persistOrder(ordered.map((v) => v.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordered));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated', { detail: { reordered: true } }));
    }

    return ordered;
  },

  async syncWithSupabase(): Promise<CustomVehicle[]> {
    try {
      const supabaseVehicles = await SupabaseService.fetchVehicles();
      if (supabaseVehicles !== null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(supabaseVehicles));
        localStorage.setItem(CLOUD_SYNCED_KEY, 'true');
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated'));
        }

        return this.getCustomVehicles();
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
        status: vehicleData.status || 'draft',
    };

    vehicles.unshift(newVehicle);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    
    SupabaseService.insertVehicle(newVehicle).catch((err) =>
      console.warn('Supabase cloud push notice:', err)
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated', { detail: newVehicle }));
    }

    return newVehicle;
  },

  updateCustomVehicle(id: string, updatedData: Partial<CustomVehicle>): CustomVehicle | null {
    const vehicles = this.getCustomVehicles();
    const index = vehicles.findIndex((v) => v.id === id);
    if (index === -1) return null;

    const updatedVehicle: CustomVehicle = {
      ...vehicles[index],
      ...updatedData,
    };

    vehicles[index] = updatedVehicle;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));

    SupabaseService.insertVehicle(updatedVehicle).catch((err) =>
      console.warn('Supabase update push notice:', err)
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated', { detail: updatedVehicle }));
    }

    return updatedVehicle;
  },

  deleteCustomVehicle(id: string, syncCloud = true): void {
    const deletedIds = this.getDeletedIds();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deletedIds));
    }

    const vehicles = this.getCustomVehicles().filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));

    if (syncCloud) {
      SupabaseService.deleteVehicle(id).catch((err) =>
        console.warn('Supabase cloud delete notice:', err)
      );
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated', { detail: { deletedId: id } }));
    }
  },

  restoreVehicle(vehicle: CustomVehicle, index: number): void {
    const deletedIds = this.getDeletedIds().filter((id) => id !== vehicle.id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deletedIds));

    const vehicles = this.getCustomVehicles().filter((item) => item.id !== vehicle.id);
    vehicles.splice(Math.max(0, Math.min(index, vehicles.length)), 0, vehicle);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    this.persistOrder(vehicles.map((item) => item.id));

    SupabaseService.insertVehicle(vehicle).catch((err) =>
      console.warn('Supabase restore notice:', err)
    );
    window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated', { detail: { restoredId: vehicle.id } }));
  },

  /**
   * Gerador editorial de ficha técnica.
   *
   * A única entrada é MARCA + MODELO + ANO. O resultado usa apenas dados
   * confiáveis da knowledge base. Cor, condição e proveniência real NUNCA são
   * inventados: ficam fora do retorno, fazendo a interface ocultar o campo.
   */
  generateSmartVehicleSpecs(brand: string, model: string, year: string): Omit<CustomVehicle, 'id' | 'isCustom'> {
    const cleanBrand = brand.trim();
    const cleanModel = model.trim();
    const cleanYear = year.trim() || '';

    const existingShareIds = this.getCustomVehicles().map((v) => v.shareId);
    const spec = SpecGenerator.generate(cleanBrand, cleanModel, cleanYear);
    const shareId = makeUniqueShareId(spec.shareId, existingShareIds);

    return {
      status: 'draft',
      title: spec.title,
      subtitle: spec.subtitle,
      shareId,
      year: spec.year,
      engine: spec.engine,
      transmission: spec.transmission,
      image: spec.image,
      description: spec.presentation,
      specs: spec.specs,
      history: spec.history,
      curiosities: spec.curiosities,
      presentationText: spec.presentation,
      variationsNote: spec.variationsNote,
    };
  },
};
