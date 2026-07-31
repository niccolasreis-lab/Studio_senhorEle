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

export const INITIAL_DEFAULT_VEHICLES: CustomVehicle[] = [
  {
    id: 'porsche-911',
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

export const CustomVehicleService = {
  getDeletedIds(): string[] {
    try {
      const data = localStorage.getItem(DELETED_IDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getCustomVehicles(): CustomVehicle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const customList: CustomVehicle[] = data ? JSON.parse(data) : [];
      const deletedIds = this.getDeletedIds();

      // Merge base default collection with custom list (custom entries override base defaults)
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

      return Array.from(map.values());
    } catch {
      return INITIAL_DEFAULT_VEHICLES;
    }
  },

  async syncWithSupabase(): Promise<CustomVehicle[]> {
    try {
      const supabaseVehicles = await SupabaseService.fetchVehicles();
      if (supabaseVehicles.length > 0) {
        const local = this.getCustomVehicles();
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

  deleteCustomVehicle(id: string): void {
    const deletedIds = this.getDeletedIds();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deletedIds));
    }

    const vehicles = this.getCustomVehicles().filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));

    SupabaseService.deleteVehicle(id).catch((err) =>
      console.warn('Supabase cloud delete notice:', err)
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studio_custom_vehicle_updated', { detail: { deletedId: id } }));
    }
  },

  /**
   * Smart AI/Rule Spec Auto-Fill Generator
   * Generates complete luxury car specs based on Brand, Model, and Year.
   */
  generateSmartVehicleSpecs(brand: string, model: string, year: string): Omit<CustomVehicle, 'id' | 'isCustom'> {
    const cleanBrand = brand.trim();
    const cleanModel = model.trim();
    const cleanYear = year.trim() || '1985';

    const fullTitle = `${cleanBrand} ${cleanModel}`;
    const codeSlug = cleanModel.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'CAR';
    const shareId = `SRL-${codeSlug}-${cleanYear}`;

    // Knowledge database for classic models
    const lowerModel = cleanModel.toLowerCase();
    const lowerBrand = cleanBrand.toLowerCase();

    let engine = 'Motorização Original Preservada';
    let transmission = 'Manual 4 Marchas';
    let color = 'Cor Original de Época';
    let power = '100 cv';
    let condition = 'Placa Preta / Certificado de Coleção';
    let subtitle = `Clássico de Coleção • ${cleanYear}`;
    let image = '/assets/images/porsche-911-classic-1973.jpg';
    let description = `Exemplar da linha ${cleanBrand} ${cleanModel} ${cleanYear} mantido sob elevados padrões de preservação. Mecânica totalmente revisada, tapeçaria original e alto valor histórico.`;

    if (lowerModel.includes('opala')) {
      engine = '4.1L 250S 6 Cilindros em Linha';
      transmission = 'Manual 4 Marchas (Assoalho)';
      color = 'Azul Diplomata Metálico';
      power = '135 cv';
      subtitle = `Icone Nacional 6 Cilindros • ${cleanYear}`;
      image = '/assets/images/aero-willys-1967.jpg';
      description = `Lendário Chevrolet Opala 6 cilindros. Ronco inconfundível do motor 250S, acabamento de veludo e rodas de época impecáveis.`;
    } else if (lowerModel.includes('fusca')) {
      engine = '1600cc Dupla Carburação Air-Cooled';
      transmission = 'Manual 4 Marchas';
      color = 'Verde Tahiti / Bege Palha';
      power = '65 cv';
      subtitle = `Air-Cooled Heritage • ${cleanYear}`;
      image = '/assets/images/vw-fusca-cal-style-1968.jpg';
      description = `VW Fusca restaurado mantendo o charme clássico dos motores boxer refrigerados a ar e tapeçaria xadrez original.`;
    } else if (lowerModel.includes('kombi')) {
      engine = '1500cc Box Air-Cooled';
      transmission = 'Manual 4 Marchas';
      color = 'Saia e Blusa Turquesa';
      power = '52 cv';
      subtitle = `Heritage Bus Vintage • ${cleanYear}`;
      image = '/assets/images/vw-kombi-corujinha-1970.jpg';
      description = `Volkswagen Kombi clássica com pintura Saia e Blusa impecável, janelas de abrir e acabamento interno no padrão de fábrica.`;
    } else if (lowerModel.includes('maverick') || lowerModel.includes('mustang')) {
      engine = '302 V8 5.0L Quadrijet';
      transmission = 'Manual 4 Marchas Hurst';
      color = 'Amarelo Ouro / Faixas Pretas';
      power = '197 cv';
      subtitle = `V8 Muscle Car Classic • ${cleanYear}`;
      image = '/assets/images/aero-willys-1967.jpg';
      description = `Puro Muscle Car V8 americano/nacional. Torque brutal, ronco grave com escapamento duplo e painel esportivo original.`;
    } else if (lowerModel.includes('porsche') || lowerModel.includes('911')) {
      engine = '3.0L Flat-6 Boxer Air-Cooled';
      transmission = 'Manual 5 Marchas Getrag';
      color = 'Guards Red / Schwarz Metalic';
      power = '210 cv';
      subtitle = `German Pure Engineering • ${cleanYear}`;
      image = '/assets/images/porsche-911-classic-1973.jpg';
      description = `Porsche 911 clássico refrigerado a ar com números de chassi e motor correspondentes (Matching Numbers) e rodas Fuchs.`;
    } else if (lowerModel.includes('golf') || lowerModel.includes('gti')) {
      engine = '2.0L 8V / 16V Injeção Eletrônica';
      transmission = 'Manual 5 Marchas Esportiva';
      color = 'Vermelho Flash / Preto';
      power = '116 cv';
      subtitle = `Hot Hatch Youngtimer • ${cleanYear}`;
      image = '/assets/images/aircooled-box-767.jpg';
      description = `Ícone dos anos 90. Bancos Recaro originais, teto solar elétrico e suspensão esportiva perfeitamente acertada.`;
    }

    return {
      title: fullTitle,
      subtitle,
      shareId,
      year: cleanYear,
      engine,
      transmission,
      color,
      power,
      condition,
      description,
      image,
    };
  },
};
