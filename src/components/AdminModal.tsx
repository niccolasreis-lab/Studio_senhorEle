import React, { useState, useEffect, useMemo, useRef, useCallback, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { CustomVehicleService, CustomVehicle, VehicleStatus } from '../services/customVehicleService';
import { SupabaseService } from '../services/supabaseService';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { curatedMetadataForModel } from '../data/collectionVehicles';
import { normalizeImageFile } from '../utils/imageUtils';
import DiaryAdminPanel from './DiaryAdminPanel';

const STATUS_OPTIONS: { value: VehicleStatus; label: string }[] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'sold', label: 'Vendido' },
];

type VehicleCollectionKind = 'studio' | 'guest';

const GUEST_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (option) => option.value === 'draft' || option.value === 'published'
);

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded?: () => void;
}

export default function AdminModal({ isOpen, onClose, onVehicleAdded }: AdminModalProps) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    SupabaseService.getSession().then((session) => {
      if (!mounted) return;
      setIsAuthenticated(session?.user.app_metadata?.role === 'admin');
      setAuthLoading(false);
    });
    const unsubscribe = SupabaseService.onAuthStateChange((session) => {
      if (!mounted) return;
      setIsAuthenticated(session?.user.app_metadata?.role === 'admin');
      setAuthLoading(false);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Mode & Tabs
  const [activeTab, setActiveTab] = useState<'form' | 'express' | 'collection' | 'diary'>('express');
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [registrationKind, setRegistrationKind] = useState<VehicleCollectionKind | null>(null);

  // Express Smart State (pre-seleção de Marca / Modelo / Ano)
  const [expressBrand, setExpressBrand] = useState('Volkswagen');
  const [expressModel, setExpressModel] = useState('Fusca');
  const [expressYear, setExpressYear] = useState('1976');

  const PRESET_BRANDS: { brand: string; models: string[] }[] = [
    {
      brand: 'Volkswagen',
      models: [
        'Fusca', 'Fusca 1300', 'Fusca 1500', 'Fusca 1600',
        'Fusca Brezel', 'Fusca Zwitter', 'Fusca Oval', 'Fusca Cabriolet',
        'Fusca Trocar', 'Fusca Cristalino', 'Fusca Itamar', 'Beetle 1303',
        'Kombi', 'Kombi Corujinha', 'Kombi Furgão', 'Kombi Alemã CD',
        'Kombi Alemã ST', 'Kombi Carat', 'Kombi Standard', 'Kombi Pickup',
        'Kombi Ambulância', 'Kombi Prata', 'Kombi 05/50', 'Kombi Série LE',
        'Karmann Ghia', 'Brasília', 'Gol', 'Voyage',
      ],
    },
    {
      brand: 'Chevrolet',
      models: [
        'Opala', 'Opala Comodoro', 'Opala Diplomata', 'Chevette', 'Caravan', 'Veraneio', 'Monza',
      ],
    },
    {
      brand: 'Ford',
      models: ['Maverick', 'Maverick GT', 'Galaxie', 'Corcel', 'Del Rey', 'Escort', 'F100'],
    },
    {
      brand: 'Porsche',
      models: ['911', '911 Carrera', '911 Turbo', '912', '914', '356', '987 Boxster', 'Envemo Super 90'],
    },
    {
      brand: 'Aero Willys',
      models: ['Aero Willys', 'Itamaraty', 'Itamaraty Executivo'],
    },
    {
      brand: 'Fiat',
      models: ['147', 'Uno', 'Palio', 'Brava', 'Tempra'],
    },
  ];

  const PRESET_YEARS: string[] = (() => {
    const years: string[] = [];
    for (let y = 2026; y >= 1950; y--) years.push(String(y));
    return years;
  })();

  const selectedBrandModels =
    PRESET_BRANDS.find((b) => b.brand === expressBrand)?.models || [];

  const handleExpressBrandChange = (value: string) => {
    setExpressBrand(value);
    const models = PRESET_BRANDS.find((b) => b.brand === value)?.models || [];
    const firstModel = models[0] || '';
    setExpressModel(firstModel);
    const metadata = curatedMetadataForModel(firstModel);
    if (metadata?.years[0]) setExpressYear(String(metadata.years[0]));
  };

  const handleExpressModelChange = (model: string) => {
    setExpressModel(model);
    const metadata = curatedMetadataForModel(model);
    if (!metadata) return;
    setExpressBrand(metadata.brand);
    if (metadata.years[0]) setExpressYear(String(metadata.years[0]));
  };

  const expressModelLabel = (model: string) => {
    const metadata = curatedMetadataForModel(model);
    if (!metadata) return model;
    return `${metadata.title} — ${metadata.years.join('/')}`;
  };

  // Prévia ao vivo do Cadastro Rápido: mostra a descrição exata conforme Marca+Modelo+Ano.
  const previewSpec = useMemo(() => {
    try {
      return CustomVehicleService.generateSmartVehicleSpecs(expressBrand, expressModel, expressYear);
    } catch {
      return null;
    }
  }, [expressBrand, expressModel, expressYear]);

  // Cloud Image state (image slots + gallery extras)
  const IMAGE_SLOTS = 6;
  const IMAGE_LABELS = ['Imagem 1', 'Imagem 2', 'Imagem 3', 'Imagem 4', 'Imagem 5', 'Imagem 6'];
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(Array(IMAGE_SLOTS).fill(null));
  const [cloudErrors, setCloudErrors] = useState<string[]>(Array(IMAGE_SLOTS).fill(''));

  // Form state for vehicle
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [shareId, setShareId] = useState('');
  const [year, setYear] = useState('');
  const [engine, setEngine] = useState('');
  const [transmission, setTransmission] = useState('');
  const [color, setColor] = useState('');
  const [power, setPower] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>('draft');
  const [imageSlots, setImageSlots] = useState<string[]>(Array(IMAGE_SLOTS).fill(''));
  const [imagePreviews, setImagePreviews] = useState<string[]>(Array(IMAGE_SLOTS).fill(''));
  const [successMsg, setSuccessMsg] = useState('');
  const [savedShareId, setSavedShareId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pendingStatusVehicle, setPendingStatusVehicle] = useState<{
    id: string;
    title: string;
    collectionKind: VehicleCollectionKind;
  } | null>(null);
  // Histórico/curiosidades gerados pelo Cadastro Rápido (persistidos junto ao veículo)
  const [generatedHistory, setGeneratedHistory] = useState<string[]>([]);
  const [generatedCuriosities, setGeneratedCuriosities] = useState<string[]>([]);

  // Custom & Base vehicles list
  const [allVehicles, setAllVehicles] = useState<CustomVehicle[]>([]);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [collectionBrand, setCollectionBrand] = useState('all');
  const [collectionYear, setCollectionYear] = useState('all');
  const [collectionStatus, setCollectionStatus] = useState<'all' | VehicleStatus>('all');
  const [deleteCandidate, setDeleteCandidate] = useState<CustomVehicle | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ vehicle: CustomVehicle; index: number } | null>(null);
  const deleteTimerRef = useRef<number | null>(null);
  const deleteButtonRef = useRef<HTMLButtonElement | null>(null);

  // Estado do reordenamento por arrastar (drag and drop)
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const refreshVehiclesList = () => {
    setAllVehicles(CustomVehicleService.getCustomVehicles());
  };

  const availableBrands = useMemo(
    () => Array.from(new Set(allVehicles.map((vehicle) => vehicle.title.split(' ')[0]))).sort(),
    [allVehicles]
  );

  const availableYears = useMemo(
    () => Array.from(new Set<string>(allVehicles.map((vehicle) => vehicle.year))).sort((a, b) => b.localeCompare(a)),
    [allVehicles]
  );

  const filteredVehicles = useMemo(() => {
    const query = collectionSearch.trim().toLocaleLowerCase('pt-BR');
    return allVehicles.filter((vehicle) => {
      const brand = vehicle.title.split(' ')[0];
      const matchesSearch = !query || [vehicle.title, vehicle.subtitle, vehicle.shareId, vehicle.year]
        .some((value) => value?.toLocaleLowerCase('pt-BR').includes(query));
      return matchesSearch &&
        (collectionBrand === 'all' || brand === collectionBrand) &&
        (collectionYear === 'all' || vehicle.year === collectionYear) &&
        (collectionStatus === 'all' || vehicle.status === collectionStatus);
    });
  }, [allVehicles, collectionBrand, collectionSearch, collectionStatus, collectionYear]);

  const closeDeleteDialog = useCallback(() => setDeleteCandidate(null), []);
  const deleteDialogRef = useAccessibleModal<HTMLDivElement>(Boolean(deleteCandidate), closeDeleteDialog);

  const closeStatusPrompt = useCallback(() => setPendingStatusVehicle(null), []);
  const statusDialogRef = useAccessibleModal<HTMLDivElement>(Boolean(pendingStatusVehicle), closeStatusPrompt);

  useEffect(() => {
    if (isAuthenticated) {
      refreshVehiclesList();
      CustomVehicleService.syncWithSupabase().then(refreshVehiclesList);
    }
  }, [isAuthenticated, isOpen]);

  const handleDragStart = (v: CustomVehicle) => () => {
    setDraggingId(v.id);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    if (!draggingId) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (targetIndex: number) => () => {
    if (!draggingId) return;
    playMechanicalClick('click');
    const fromIndex = allVehicles.findIndex((v) => v.id === draggingId);
    if (fromIndex === -1 || fromIndex === targetIndex) {
      finishDrag();
      return;
    }

    const next = [...allVehicles];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(targetIndex, 0, moved);

    CustomVehicleService.reorderVehicles(next);
    setAllVehicles(next);
    finishDrag();
    if (onVehicleAdded) onVehicleAdded();
  };

  const finishDrag = () => {
    setDraggingId(null);
    setDragOverIndex(null);
  };

  const handleMoveVehicle = (id: string, direction: -1 | 1) => {
    const currentIndex = allVehicles.findIndex((vehicle) => vehicle.id === id);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= allVehicles.length) return;
    const next = [...allVehicles];
    [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
    CustomVehicleService.reorderVehicles(next);
    setAllVehicles(next);
    playMechanicalClick('click');
    onVehicleAdded?.();
  };

  // Handle local image file upload & preview for a given slot
  const handleImageChange = (slot: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nextFiles = [...selectedFiles];
    const nextErrors = [...cloudErrors];
    nextFiles[slot] = file;
    nextErrors[slot] = '';
    setSelectedFiles(nextFiles);
    setCloudErrors(nextErrors);

    normalizeImageFile(file).then(({ file: normalized, preview }) => {
      setSelectedFiles((prev) => { const n = [...prev]; n[slot] = normalized; return n; });
      setImageSlots((prev) => { const n = [...prev]; n[slot] = preview; return n; });
      setImagePreviews((prev) => { const n = [...prev]; n[slot] = preview; return n; });
    }).catch(() => {
      nextErrors[slot] = 'Não foi possível processar esta imagem (HEIC/HEIF).';
      setCloudErrors(nextErrors);
    });
  };

  // Upload de imagem: feito exclusivamente no momento de "Salvar Alterações".
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    playMechanicalClick('click');
    setAuthSubmitting(true);
    setAuthError('');
    const error = await SupabaseService.signIn(username.trim(), password);
    setAuthSubmitting(false);
    if (error) {
      setAuthError(error);
      playMechanicalClick('modal');
    }
  };

  const handleLogout = async () => {
    playMechanicalClick('click');
    await SupabaseService.signOut();
  };

  const resetForm = () => {
    setEditingVehicleId(null);
    setRegistrationKind(null);
    setTitle('');
    setSubtitle('');
    setShareId('');
    setYear('');
    setEngine('');
    setTransmission('');
    setColor('');
    setPower('');
    setDescription('');
    setVehicleStatus('draft');
    setImageSlots(Array(IMAGE_SLOTS).fill(''));
    setImagePreviews(Array(IMAGE_SLOTS).fill(''));
    setSelectedFiles(Array(IMAGE_SLOTS).fill(null));
    setCloudErrors(Array(IMAGE_SLOTS).fill(''));
    setSaveError('');
    setGeneratedHistory([]);
    setGeneratedCuriosities([]);
    setSaving(false);
  };

  // Start editing a vehicle (including original 7 classics)
  const handleStartEditing = (v: CustomVehicle) => {
    playMechanicalClick('click');
    setEditingVehicleId(v.id);
    setRegistrationKind(v.collectionKind === 'guest' ? 'guest' : 'studio');
    setTitle(v.title);
    setSubtitle(v.subtitle || '');
    setShareId(v.shareId);
    setYear(v.year);
    setEngine(v.engine || '');
    setTransmission(v.transmission || '');
    setColor(v.color || '');
    setPower(v.power || '');
    setDescription(v.description || '');
    setVehicleStatus(v.status);
    const imgs = [v.image, v.image2 || '', v.image3 || '', ...(v.gallery || [])];
    setImageSlots(imgs);
    setImagePreviews(imgs);
    setSelectedFiles(Array(IMAGE_SLOTS).fill(null));
    setCloudErrors(Array(IMAGE_SLOTS).fill(''));
    setGeneratedHistory(v.history || []);
    setGeneratedCuriosities(v.curiosities || []);
    setActiveTab('form');
  };

  // Generate Smart Spec (Marca + Modelo + Ano)
  const handleGenerateSmartSpec = (brand: string, model: string, yr: string) => {
    playMechanicalClick('click');
    const spec = CustomVehicleService.generateSmartVehicleSpecs(brand, model, yr);
    setTitle(spec.title);
    setSubtitle(spec.subtitle);
    setShareId(registrationKind === 'guest' ? spec.shareId.replace(/^SRL-?/i, 'CONV-') : spec.shareId);
    setYear(spec.year);
    setEngine(spec.engine);
    setTransmission(spec.transmission);
    setDescription(spec.presentationText || spec.description || '');
    setImageSlots([spec.image, '', '']);
    setImagePreviews([spec.image, '', '']);
    setGeneratedHistory(spec.history || []);
    setGeneratedCuriosities(spec.curiosities || []);
    setActiveTab('form');
    setSuccessMsg(`Ficha técnica de "${spec.title}" preenchida automaticamente!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Submit Add or Update Vehicle — upload único de todas as imagens pendentes
  // e depois salva. Um único botão lida com incluir/editar/excluir imagens e
  // com a descrição.
  const handleSubmitVehicle = (e: FormEvent) => {
    e.preventDefault();
    playMechanicalClick('click');

    if (!title.trim() || !year.trim()) {
      alert('Por favor, preencha pelo menos o Título e o Ano do veículo.');
      return;
    }

    void performSave('draft');
  };

  const confirmSaveWithStatus = async (status: VehicleStatus) => {
    if (!pendingStatusVehicle) return;
    if (pendingStatusVehicle.collectionKind === 'guest' && status !== 'draft' && status !== 'published') return;
    playMechanicalClick('click');
    try {
      await CustomVehicleService.updateCustomVehicle(pendingStatusVehicle.id, { status });
      setVehicleStatus(status);
      setPendingStatusVehicle(null);
      refreshVehiclesList();
      onVehicleAdded?.();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível atualizar o estado do veículo.');
    }
  };

  const performSave = async (status: VehicleStatus) => {
    if (!registrationKind) {
      setSaveError('Escolha primeiro entre Veículo do Studio e Convidado do Studio.');
      return;
    }
    if (registrationKind === 'guest' && status !== 'draft' && status !== 'published') {
      setSaveError('Convidados só podem ficar como rascunho ou publicado.');
      return;
    }
    setSaving(true);
    setSaveError('');

    try {
      // 1. Envia ao Supabase todas as imagens pendentes (selecionadas e ainda não hospedadas).
      const uploadedUrls = [...imageSlots];
      for (let slot = 0; slot < IMAGE_SLOTS; slot++) {
        const file = selectedFiles[slot];
        if (!file) continue;
        const url = await SupabaseService.uploadImage(file);
        if (!url) {
          throw new Error(`Falha ao enviar a ${IMAGE_LABELS[slot]} para o Storage do Supabase.`);
        }
        uploadedUrls[slot] = url;
      }

      const requestedShareId = shareId.trim();
      const guestShareId = requestedShareId
        ? `CONV-${requestedShareId.replace(/^(?:CONV|SRL)-?/i, '')}`
        : `CONV-${title.substring(0, 3).toUpperCase()}-${year.trim()}`;
      const defaultShareId = registrationKind === 'guest'
        ? guestShareId
        : requestedShareId || `SRL-${title.substring(0, 3).toUpperCase()}-${year.trim()}`;
      if (registrationKind === 'guest' && !uploadedUrls[0]) {
        throw new Error('Adicione uma foto principal real antes de publicar ou salvar um convidado.');
      }
      const defaultImage = uploadedUrls[0] || '/assets/images/af-logo-192.png';
      const defaultImage2 = uploadedUrls[1] || '';
      const defaultImage3 = uploadedUrls[2] || '';
      const gallery = uploadedUrls.slice(3, IMAGE_SLOTS).filter(Boolean) as string[];

      // 2. Salva o veículo (inclusão ou edição) com as URLs já confirmadas.
      let savedId = editingVehicleId;
      if (editingVehicleId) {
        await CustomVehicleService.updateCustomVehicle(editingVehicleId, {
          title: title.trim(),
          subtitle: subtitle.trim() || (registrationKind === 'guest'
            ? `Convidado do Studio • ${year.trim()}`
            : `Restauração Especial • ${year.trim()}`),
          shareId: defaultShareId,
          year: year.trim(),
          engine: engine.trim() || (registrationKind === 'guest' ? '' : 'Air-Cooled Boxer'),
          transmission: transmission.trim() || (registrationKind === 'guest' ? '' : 'Manual 4 Marchas'),
          color: color.trim(),
          power: power.trim(),
          description: description.trim() || (registrationKind === 'guest'
            ? 'Veículo convidado apresentado por amizade e interesse cultural.'
            : 'Exemplar exclusivo da coleção Studio SenhorEle.'),
          collectionKind: registrationKind,
          status,
          image: defaultImage,
          image2: defaultImage2,
          image3: defaultImage3,
          gallery,
          history: generatedHistory.length ? generatedHistory : undefined,
          curiosities: generatedCuriosities.length ? generatedCuriosities : undefined,
        });
        setSuccessMsg(`Veículo "${title.trim()}" atualizado com sucesso!`);
      } else {
        const newVehicle = await CustomVehicleService.addCustomVehicle({
          title: title.trim(),
          subtitle: subtitle.trim() || (registrationKind === 'guest'
            ? `Convidado do Studio • ${year.trim()}`
            : `Restauração Especial • ${year.trim()}`),
          shareId: defaultShareId,
          year: year.trim(),
          engine: engine.trim() || (registrationKind === 'guest' ? '' : 'Air-Cooled Boxer'),
          transmission: transmission.trim() || (registrationKind === 'guest' ? '' : 'Manual 4 Marchas'),
          color: color.trim(),
          power: power.trim(),
          description: description.trim() || (registrationKind === 'guest'
            ? 'Veículo convidado apresentado por amizade e interesse cultural.'
            : 'Exemplar exclusivo da coleção Studio SenhorEle.'),
          collectionKind: registrationKind,
          status,
          image: defaultImage,
          image2: defaultImage2,
          image3: defaultImage3,
          gallery,
          history: generatedHistory.length ? generatedHistory : undefined,
          curiosities: generatedCuriosities.length ? generatedCuriosities : undefined,
        });
        savedId = newVehicle.id;
        setSuccessMsg(`Veículo "${title.trim()}" cadastrado no acervo!`);
      }

      setSavedShareId(defaultShareId);

      refreshVehiclesList();
      if (onVehicleAdded) onVehicleAdded();
      resetForm();

      if (savedId) {
        setPendingStatusVehicle({ id: savedId, title: title.trim(), collectionKind: registrationKind });
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Não foi possível salvar. Verifique a conexão.');
    } finally {
      setSaving(false);
    }

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // Remove a imagem de um slot (mantém vazio até salvar).
  const handleRemoveImage = (slot: number) => {
    playMechanicalClick('click');
    const nextFiles = [...selectedFiles];
    const nextSlots = [...imageSlots];
    const nextPreviews = [...imagePreviews];
    const nextErrors = [...cloudErrors];
    nextFiles[slot] = null;
    nextSlots[slot] = '';
    nextPreviews[slot] = '';
    nextErrors[slot] = '';
    setSelectedFiles(nextFiles);
    setImageSlots(nextSlots);
    setImagePreviews(nextPreviews);
    setCloudErrors(nextErrors);
  };

  const handleDeleteVehicle = (vehicle: CustomVehicle, button: HTMLButtonElement) => {
    deleteButtonRef.current = button;
    setDeleteCandidate(vehicle);
  };

  const confirmDeleteVehicle = () => {
    if (!deleteCandidate) return;
    if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    if (pendingDelete) SupabaseService.deleteVehicle(pendingDelete.vehicle.id);

    const index = allVehicles.findIndex((vehicle) => vehicle.id === deleteCandidate.id);
    const nextPending = { vehicle: deleteCandidate, index };
    CustomVehicleService.deleteCustomVehicle(deleteCandidate.id, false);
    setPendingDelete(nextPending);
    setDeleteCandidate(null);
    refreshVehiclesList();
    if (editingVehicleId === deleteCandidate.id) resetForm();
    onVehicleAdded?.();
    playMechanicalClick('click');

    deleteTimerRef.current = window.setTimeout(() => {
      SupabaseService.deleteVehicle(nextPending.vehicle.id);
      setPendingDelete(null);
      deleteTimerRef.current = null;
    }, 8000);
  };

  const undoDeleteVehicle = () => {
    if (!pendingDelete) return;
    if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    CustomVehicleService.restoreVehicle(pendingDelete.vehicle, pendingDelete.index);
    setPendingDelete(null);
    deleteTimerRef.current = null;
    refreshVehiclesList();
    onVehicleAdded?.();
    deleteButtonRef.current?.focus();
  };

  const handleStatusChange = async (vehicle: CustomVehicle, status: VehicleStatus) => {
    if (vehicle.collectionKind === 'guest' && status !== 'draft' && status !== 'published') return;
    try {
      await CustomVehicleService.updateCustomVehicle(vehicle.id, { status });
      refreshVehiclesList();
      onVehicleAdded?.();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível atualizar o estado do veículo.');
    }
  };

  if (!isOpen) return null;

  return (
      <div className="admin-page min-h-screen bg-background text-on-background">
        <motion.div
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          {/* Top Header */}
          <header className="sticky top-0 z-40 px-5 md:px-10 py-4 bg-background/95 border-b border-surface-variant/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              </div>
              <div>
                <h1 className="font-headline-md text-lg md:text-xl text-parchment">
                  {isAuthenticated ? 'Minha Coleção' : 'Acesso administrativo'}
                </h1>
              </div>
            </div>

            <button
              onClick={() => {
                playMechanicalClick('modal');
                onClose();
              }}
              className="min-h-11 px-3 rounded-xl text-on-surface-variant hover:text-parchment hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              aria-label="Voltar ao site"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="hidden sm:inline text-xs font-label-caps">Voltar ao site</span>
            </button>
          </header>

          {/* Body Content */}
          <main className="w-full max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-12">
            {authLoading ? (
              <div role="status" className="max-w-md mx-auto mt-[8vh] p-8 text-center text-on-surface-variant">
                Verificando sessão segura…
              </div>
            ) : !isAuthenticated ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-5 max-w-md mx-auto mt-[8vh] p-6 md:p-8 bg-surface-container-low rounded-2xl">
                {authError && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-xs font-label-caps text-center">
                    {authError}
                  </div>
                )}

                <div>
                  <label htmlFor="admin-username" className="block font-label-caps text-xs text-parchment mb-1.5">E-mail</label>
                  <input
                    id="admin-username"
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 bg-surface-container border border-surface-variant/50 rounded-xl text-parchment text-sm focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="admin-password" className="block font-label-caps text-xs text-parchment mb-1.5">Senha</label>
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-surface-container border border-surface-variant/50 rounded-xl text-parchment text-sm focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full bg-secondary hover:bg-amber-glow text-deep-charcoal font-label-caps font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer mt-4 flex items-center justify-center space-x-2"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>{authSubmitting ? 'Entrando…' : 'Entrar no Painel'}</span>
                </button>
              </form>
            ) : (
              /* ADMIN DASHBOARD & EDITING FORM */
              <div className="space-y-8">
                {/* Header Session Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-label-caps text-xs text-secondary font-bold">
                      Sessão Ativa do Curador ({allVehicles.length} Veículos na Coleção)
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-label-caps text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sair</span>
                  </button>
                </div>

                {/* Tabs: Form Completo vs Auto-Fill Inteligente */}
                <nav aria-label="Seções administrativas" className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-surface-container-low rounded-xl border border-surface-variant/30 sticky top-[82px] z-30">
                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick('click');
                      setActiveTab('form');
                    }}
                    className={`min-h-11 px-3 py-2.5 rounded-lg font-label-caps text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-secondary ${
                      activeTab === 'form'
                        ? 'text-parchment bg-surface-container-highest'
                        : 'text-on-surface-variant hover:text-parchment'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {editingVehicleId ? 'edit_note' : 'edit_document'}
                    </span>
                    <span>{editingVehicleId ? 'Editando' : 'Completo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick('click');
                      setActiveTab('express');
                    }}
                    className={`min-h-11 px-3 py-2.5 rounded-lg font-label-caps text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-secondary ${
                      activeTab === 'express'
                        ? 'text-parchment bg-surface-container-highest'
                        : 'text-on-surface-variant hover:text-parchment'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-400">auto_awesome</span>
                    <span>Cadastro rápido</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { playMechanicalClick('click'); setActiveTab('collection'); }}
                    className={`min-h-11 px-3 py-2.5 rounded-lg font-label-caps text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-secondary ${activeTab === 'collection' ? 'text-parchment bg-surface-container-highest' : 'text-on-surface-variant hover:text-parchment'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">directions_car</span>
                    <span>Coleção</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { playMechanicalClick('click'); setActiveTab('diary'); }}
                    className={`min-h-11 px-3 py-2.5 rounded-lg font-label-caps text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-secondary ${activeTab === 'diary' ? 'text-parchment bg-surface-container-highest' : 'text-on-surface-variant hover:text-parchment'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">newspaper</span>
                    <span>Diário</span>
                  </button>
                </nav>

                {successMsg && (
                  <div role="status" className="p-4 bg-primary-container rounded-xl text-primary-fixed text-xs flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{successMsg}</span>
                    </div>
                    {savedShareId && <a href={`/?v=${encodeURIComponent(savedShareId)}`} className="font-label-caps text-secondary underline underline-offset-4">Ver no site</a>}
                  </div>
                )}

                {(activeTab === 'form' || activeTab === 'express') && !editingVehicleId && !registrationKind && (
                  <section aria-labelledby="registration-kind-heading" className="rounded-2xl border border-secondary/25 bg-surface-container/55 p-5 sm:p-6">
                    <h2 id="registration-kind-heading" className="font-headline-md text-2xl text-parchment">
                      Que tipo de veículo você vai cadastrar?
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                      Essa escolha define onde a ficha será publicada e quais estados estarão disponíveis. Ela fica registrada junto ao veículo.
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          playMechanicalClick('click');
                          setRegistrationKind('studio');
                          setVehicleStatus('draft');
                        }}
                        className="group min-h-32 rounded-xl border border-surface-variant/50 bg-surface-container-low p-4 text-left transition-colors hover:border-secondary/70 hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                      >
                        <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">garage_home</span>
                        <span className="mt-3 block font-headline-md text-lg text-parchment">Veículo do Studio</span>
                        <span className="mt-1 block text-xs leading-relaxed text-on-surface-variant">Integra o acervo e pode usar todos os estados comerciais da coleção.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playMechanicalClick('click');
                          setRegistrationKind('guest');
                          setVehicleStatus('draft');
                          setShareId((current) => current ? current.replace(/^SRL-?/i, 'CONV-') : current);
                        }}
                        className="group min-h-32 rounded-xl border border-secondary/35 bg-racing-green-dark/55 p-4 text-left transition-colors hover:border-secondary hover:bg-racing-green-dark/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                      >
                        <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">handshake</span>
                        <span className="mt-3 block font-headline-md text-lg text-parchment">Convidado do Studio</span>
                        <span className="mt-1 block text-xs leading-relaxed text-on-surface-variant">Presença editorial independente, sem vínculo comercial e com compartilhamento próprio.</span>
                      </button>
                    </div>
                  </section>
                )}

                {(activeTab === 'form' || activeTab === 'express') && registrationKind && (
                  <div className="flex flex-col gap-3 rounded-xl border border-secondary/20 bg-racing-green-dark/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
                        {registrationKind === 'guest' ? 'handshake' : 'garage_home'}
                      </span>
                      <span className="font-label-caps text-xs text-parchment">
                        {registrationKind === 'guest' ? 'Convidado do Studio' : 'Veículo do Studio'}
                      </span>
                    </div>
                    {!editingVehicleId && (
                      <button
                        type="button"
                        onClick={() => {
                          playMechanicalClick('click');
                          resetForm();
                        }}
                        className="min-h-10 self-start rounded-lg px-3 text-xs font-label-caps text-secondary hover:bg-surface-container sm:self-auto"
                      >
                        Trocar tipo
                      </button>
                    )}
                  </div>
                )}

                {/* TAB 1: CADASTRO INTELIGENTE AUTO-FILL */}
                {activeTab === 'express' && registrationKind && (
                  <div className="p-4 bg-surface-container/50 border border-amber-500/30 rounded-2xl space-y-4">
                    <div className="flex items-center space-x-2 text-amber-300">
                      <span className="material-symbols-outlined text-[20px]">psychology</span>
                      <h4 className="font-headline-md text-xs font-bold uppercase tracking-wider">
                        Gerador Inteligente de Ficha Técnica (Marca, Modelo & Ano)
                      </h4>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Informe apenas a Marca, o Modelo e o Ano. O assistente gera automaticamente a apresentação, a ficha técnica e o contexto histórico do veículo, utilizando somente informações compatíveis com a versão e o período.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-label-caps text-[11px] text-on-surface-variant mb-1">Marca do Veículo *</label>
                        <select
                          value={expressBrand}
                          onChange={(e) => handleExpressBrandChange(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          {PRESET_BRANDS.map((b) => (
                            <option key={b.brand} value={b.brand}>{b.brand}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-label-caps text-[11px] text-on-surface-variant mb-1">Modelo do Veículo *</label>
                        <select
                          value={expressModel}
                          onChange={(e) => handleExpressModelChange(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          {selectedBrandModels.length === 0 && (
                            <option value="">— Selecione a marca primeiro —</option>
                          )}
                          {selectedBrandModels.map((m) => (
                            <option key={m} value={m}>{expressModelLabel(m)}</option>
                          ))}
                        </select>
                        {curatedMetadataForModel(expressModel) && (
                          <p className="mt-1.5 text-[10px] text-secondary">
                            Marca e ano preenchidos a partir do acervo.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block font-label-caps text-[11px] text-on-surface-variant mb-1">Ano de Fabricação *</label>
                        <select
                          value={expressYear}
                          onChange={(e) => setExpressYear(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          {PRESET_YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateSmartSpec(expressBrand, expressModel, expressYear)}
                      className="w-full bg-secondary hover:bg-secondary-fixed text-on-secondary font-label-caps font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">bolt</span>
                      <span>Gerar Ficha do Veículo</span>
                    </button>

                    {previewSpec && previewSpec.description && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-300">
                          <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                          <span className="font-label-caps text-[11px] font-bold">
                            {previewSpec.hasIndividualData
                              ? `Veículo do acervo correspondente: ${previewSpec.title}`
                              : 'Prévia da ficha gerada'}
                          </span>
                        </div>
                        {previewSpec.hasIndividualData && previewSpec.history.length > 0 && (
                          <p className="text-[11px] text-on-surface-variant font-label-caps">
                            História incluída junto à ficha: “{previewSpec.history[0].slice(0, 120)}
                            {previewSpec.history[0].length > 120 ? '…' : ''}”
                          </p>
                        )}
                        <p className="text-xs text-parchment/90 leading-relaxed">{previewSpec.description}</p>
                        {previewSpec.hasIndividualData && (
                          <button
                            type="button"
                            onClick={() => handleGenerateSmartSpec(expressBrand, expressModel, expressYear)}
                            className="text-[11px] font-label-caps text-emerald-300 underline cursor-pointer"
                          >
                            Aplicar no formulário abaixo →
                          </button>
                        )}
                      </div>
                    )}

                    {/* Presets de Exemplo 1-Clique */}
                    <div className="pt-2">
                      <span className="block font-label-caps text-[11px] text-on-surface-variant mb-2">
                        Exemplos Rápidos de Clássicos (1-Clique):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setExpressBrand('Chevrolet');
                            setExpressModel('Opala Comodoro 4.1');
                            setExpressYear('1988');
                            handleGenerateSmartSpec('Chevrolet', 'Opala Comodoro 4.1', '1988');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ Chevrolet Opala 1988
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExpressBrand('Ford');
                            setExpressModel('Maverick GT V8');
                            setExpressYear('1974');
                            handleGenerateSmartSpec('Ford', 'Maverick GT V8', '1974');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ Ford Maverick V8 1974
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExpressBrand('Volkswagen');
                            setExpressModel('Fusca Brezel');
                            setExpressYear('1950');
                            handleGenerateSmartSpec('Volkswagen', 'Fusca Brezel', '1950');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ Fusca Brezel 1950
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExpressBrand('Volkswagen');
                            setExpressModel('Kombi Carat');
                            setExpressYear('1997');
                            handleGenerateSmartSpec('Volkswagen', 'Kombi Carat', '1997');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ Kombi Carat 1997
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExpressBrand('Volkswagen');
                            setExpressModel('Kombi 05/50');
                            setExpressYear('2007');
                            handleGenerateSmartSpec('Volkswagen', 'Kombi 05/50', '2007');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ Kombi 05/50 2007
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExpressBrand('Volkswagen');
                            setExpressModel('Kombi Série LE');
                            setExpressYear('2013');
                            handleGenerateSmartSpec('Volkswagen', 'Kombi Série LE', '2013');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ Kombi Série LE 2013
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExpressBrand('Volkswagen');
                            setExpressModel('Fusca Itamar');
                            setExpressYear('1993');
                            handleGenerateSmartSpec('Volkswagen', 'Fusca Itamar', '1993');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ Fusca Itamar 1993
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExpressBrand('Porsche');
                            setExpressModel('Envemo Super 90');
                            setExpressYear('1980');
                            handleGenerateSmartSpec('Porsche', 'Envemo Super 90', '1980');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ Envemo Super 90 1980
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2 / FORMULÁRIO COMPLETO & EDIÇÃO */}
                {activeTab === 'form' && registrationKind && (
                  <form onSubmit={handleSubmitVehicle} className="space-y-4">
                    {editingVehicleId && (
                      <div className="p-3 bg-amber-950/60 border border-amber-500/60 rounded-xl flex items-center justify-between text-amber-200 text-xs font-label-caps">
                        <span className="flex items-center space-x-1.5">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span>Você está editando o veículo: <strong>"{title}"</strong></span>
                        </span>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-2 py-1 bg-surface-container hover:bg-surface-variant rounded-lg text-parchment text-[10px] font-bold cursor-pointer"
                        >
                          Cancelar Edição
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Título do Veículo *</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ex: VW Fusca Itamar ou Opala Comodoro"
                          className="w-full px-3.5 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>

                      <div>
                        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Ano de Fabricação *</label>
                        <input
                          type="text"
                          required
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          placeholder="Ex: 1994"
                          className="w-full px-3.5 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="vehicle-status" className="block font-label-caps text-xs text-on-surface-variant mb-1">Status na coleção</label>
                      <select id="vehicle-status" value={vehicleStatus} onChange={(e) => setVehicleStatus(e.target.value as VehicleStatus)} className="w-full px-3.5 py-2.5 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-secondary">
                        {(registrationKind === 'guest' ? GUEST_STATUS_OPTIONS : STATUS_OPTIONS).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <p className="mt-1.5 text-[11px] text-on-surface-variant">
                        {registrationKind === 'guest'
                          ? 'Convidados podem ficar somente como rascunho ou publicado.'
                          : 'Somente Publicado e Reservado aparecem no site. Novos veículos começam como rascunho.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Subtítulo / Destaque</label>
                        <input
                          type="text"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          placeholder="Ex: Edição Especial de Coleção • 1994"
                          className="w-full px-3.5 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>

                      <div>
                        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Código ID Único (Share ID)</label>
                        <input
                          type="text"
                          value={shareId}
                          onChange={(e) => setShareId(e.target.value)}
                          placeholder={registrationKind === 'guest' ? 'Ex: CONV-FSC-1994 (prefixo aplicado automaticamente)' : 'Ex: SRL-FSC-1994 (gerado automático se vazio)'}
                          className="w-full px-3.5 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Motorização</label>
                        <input
                          type="text"
                          value={engine}
                          onChange={(e) => setEngine(e.target.value)}
                          placeholder="Ex: 1600cc Catalisado Air-Cooled"
                          className="w-full px-3.5 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>

                      <div>
                        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Transmissão</label>
                        <input
                          type="text"
                          value={transmission}
                          onChange={(e) => setTransmission(e.target.value)}
                          placeholder="Ex: Manual 4 Marchas"
                          className="w-full px-3.5 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>

                      <div>
                        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Cor Externa</label>
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          placeholder="Ex: Verde Tahiti Múltiplos Tons"
                          className="w-full px-3.5 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-caps text-xs text-on-surface-variant mb-1">História / Descrição do Veículo</label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detalhes de proveniência, restauração, peças originais..."
                        className="w-full px-3.5 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-secondary resize-none"
                      />
                    </div>

                    {/* Image Upload & Preview (Imagem 1, 2 e 3) */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="block font-label-caps text-xs text-on-surface-variant">Imagens do Veículo (até 6: Imagem 1–6)</label>
                      </div>

                      {Array.from({ length: IMAGE_SLOTS }).map((_, slot) => {
                        return (
                          <div key={slot} className="p-3 rounded-xl border border-surface-variant/30 bg-surface-container/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-label-caps text-[11px] text-secondary font-bold">
                                {IMAGE_LABELS[slot]}
                              </span>
                              {imageSlots[slot] && (
                                <span className="text-[10px] text-on-surface-variant font-mono">
                                  {imageSlots[slot].startsWith('http') ? 'OK' : 'local'}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange(slot)}
                                className="block w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-label-caps file:bg-secondary/20 file:text-secondary hover:file:bg-secondary/30 cursor-pointer"
                              />
                            </div>

                            {cloudErrors[slot] && (
                              <p className="text-xs text-rose-400 font-label-caps pt-1">{cloudErrors[slot]}</p>
                            )}

                            {imagePreviews[slot] && (
                              <div className="relative h-40 w-full rounded-xl overflow-hidden border border-secondary/40 shadow-md">
                                <img src={imagePreviews[slot]} alt={`Preview ${IMAGE_LABELS[slot]}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => handleRemoveImage(slot)} aria-label={`Remover ${IMAGE_LABELS[slot]}`} className="absolute left-2 top-2 min-h-9 px-2.5 rounded-lg bg-background/90 text-rose-300 text-[10px] font-label-caps flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">delete</span>
                                  Remover
                                </button>
                                {imageSlots[slot].startsWith('http') && (
                                  <div className="absolute top-2 right-2 bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 font-label-caps text-[10px] px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md">
                                    <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                                    <span>Salvo</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-secondary hover:bg-amber-glow disabled:opacity-50 disabled:cursor-wait text-deep-charcoal font-label-caps font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {editingVehicleId ? 'save' : 'add_circle'}
                        </span>
                        <span>{saving ? 'Salvando…' : editingVehicleId ? 'Salvar Alterações no Veículo' : 'Salvar veículo'}</span>
                      </button>

                      {editingVehicleId && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-3 bg-surface-container hover:bg-surface-variant/60 border border-surface-variant/40 rounded-xl text-on-surface-variant font-label-caps text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* GERENCIADOR DE TODOS OS VEÍCULOS DA COLEÇÃO */}
                {activeTab === 'collection' && <section className="space-y-5" aria-labelledby="collection-heading">
                  <div className="flex items-center justify-between">
                    <h2 id="collection-heading" className="font-headline-md text-2xl md:text-3xl text-parchment">
                      Coleção completa
                    </h2>
                    <span className="text-xs text-on-surface-variant tabular-nums">
                      {filteredVehicles.length} de {allVehicles.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_130px_140px_auto] gap-3">
                    <label className="relative">
                      <span className="sr-only">Buscar no acervo</span>
                      <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-on-surface-variant">search</span>
                      <input value={collectionSearch} onChange={(e) => setCollectionSearch(e.target.value)} placeholder="Buscar por nome, código ou ano" className="w-full min-h-11 pl-10 pr-3 bg-surface-container border border-surface-variant/40 rounded-xl text-sm text-parchment focus:outline-none focus:border-secondary" />
                    </label>
                    <select aria-label="Filtrar por marca" value={collectionBrand} onChange={(e) => setCollectionBrand(e.target.value)} className="min-h-11 px-3 bg-surface-container border border-surface-variant/40 rounded-xl text-sm text-parchment focus:outline-none focus:border-secondary">
                      <option value="all">Todas as marcas</option>
                      {availableBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                    </select>
                    <select aria-label="Filtrar por ano" value={collectionYear} onChange={(e) => setCollectionYear(e.target.value)} className="min-h-11 px-3 bg-surface-container border border-surface-variant/40 rounded-xl text-sm text-parchment focus:outline-none focus:border-secondary">
                      <option value="all">Todos os anos</option>
                      {availableYears.map((vehicleYear) => <option key={vehicleYear} value={vehicleYear}>{vehicleYear}</option>)}
                    </select>
                    <select aria-label="Filtrar por status" value={collectionStatus} onChange={(e) => setCollectionStatus(e.target.value as 'all' | VehicleStatus)} className="min-h-11 px-3 bg-surface-container border border-surface-variant/40 rounded-xl text-sm text-parchment focus:outline-none focus:border-secondary">
                      <option value="all">Todos os status</option>
                      {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <button type="button" onClick={() => { setCollectionSearch(''); setCollectionBrand('all'); setCollectionYear('all'); setCollectionStatus('all'); }} className="min-h-11 px-4 rounded-xl text-xs font-label-caps text-on-surface-variant hover:text-parchment hover:bg-surface-container">Limpar</button>
                  </div>

                  <div className="rounded-xl border border-surface-variant/30 bg-surface-container/40 px-3 py-2.5 flex items-start space-x-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">swap_vert</span>
                    <p className="text-[11px] leading-snug text-on-surface-variant">
                      <span className="text-secondary font-bold font-label-caps">Regra da sequência:</span>{' '}
                      a posição <span className="font-mono text-amber-300">1</span> é o veículo em destaque.
                      Clique, segure e arraste um anúncio para cima ou para baixo na fila para definir
                      qual posto cada veículo ocupa no acervo.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {filteredVehicles.length === 0 && <div className="py-16 text-center bg-surface-container-low rounded-2xl"><span className="material-symbols-outlined text-3xl text-on-surface-variant">search_off</span><p className="mt-3 text-parchment">Nenhum veículo encontrado.</p><p className="text-sm text-on-surface-variant">Ajuste ou limpe os filtros para ver o acervo.</p></div>}
                    {filteredVehicles.map((v) => {
                      const index = allVehicles.findIndex((vehicle) => vehicle.id === v.id);
                      const isDragging = draggingId === v.id;
                      const isDropTarget = dragOverIndex === index && !isDragging;
                      return (
                        <div
                          key={v.id}
                          draggable
                          onDragStart={handleDragStart(v)}
                          onDragOver={handleDragOver(index)}
                          onDrop={handleDrop(index)}
                          onDragEnd={finishDrag}
className={`flex items-center justify-between p-3 rounded-xl border transition-all select-none cursor-grab active:cursor-grabbing ${
                            isDragging
                              ? 'opacity-40 border-secondary/70 shadow-lg shadow-black/50 rotate-1'
                              : isDropTarget
                              ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/40'
                              : editingVehicleId === v.id
                              ? 'bg-amber-950/40 border-amber-400/80 shadow-md'
                              : 'bg-surface-container/60 border-surface-variant/30 hover:border-surface-variant/60'
                          }`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            {/* Alça de arrastar + número da posição */}
                            <div className="flex flex-col items-center shrink-0 -ml-1 touch-none">
                              <span className="material-symbols-outlined text-[16px] text-secondary" aria-hidden>
                                drag_indicator
                              </span>
                              <span
                                className={`font-mono text-[9px] leading-none py-0.5 ${
                                  index === 0 ? 'text-amber-300 font-bold' : 'text-on-surface-variant'
                                }`}
                                title={`Posição atual na fila do acervo (${index + 1} de ${allVehicles.length})`}
                              >
                                #{index + 1}
                              </span>
                            </div>

                            <img src={v.image} alt={v.title} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-surface-variant/40 pointer-events-none" />
                            <div className="truncate">
                              <div className="font-headline-md text-xs text-parchment font-bold truncate">
                                {v.title}
                              </div>
                              {v.collectionKind === 'guest' && (
                                <span className="mt-1 inline-flex rounded-full border border-secondary/35 bg-racing-green-dark/55 px-2 py-0.5 font-label-caps text-[9px] text-secondary">
                                  Convidado
                                </span>
                              )}
                              <div className="font-mono text-[10px] text-secondary truncate">
                                #{v.shareId} • {v.year}
                              </div>
                              <span className="inline-block mt-1 text-[9px] font-label-caps text-on-surface-variant">{STATUS_OPTIONS.find((option) => option.value === v.status)?.label}</span>
                              <select aria-label={`Alterar status de ${v.title} no celular`} value={v.status} onChange={(e) => handleStatusChange(v, e.target.value as VehicleStatus)} className="md:hidden block mt-1 h-8 max-w-28 px-1 bg-surface-container border border-surface-variant/40 rounded-md text-[9px] text-parchment focus:outline-none focus:border-secondary">
                                {(v.collectionKind === 'guest' ? GUEST_STATUS_OPTIONS : STATUS_OPTIONS).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0 pointer-events-none">
                            <div className="pointer-events-auto flex sm:hidden">
                              <button type="button" onClick={() => handleMoveVehicle(v.id, -1)} disabled={index === 0} aria-label={`Mover ${v.title} para cima`} className="p-2 text-on-surface-variant disabled:opacity-25"><span className="material-symbols-outlined text-[18px]">arrow_upward</span></button>
                              <button type="button" onClick={() => handleMoveVehicle(v.id, 1)} disabled={index === allVehicles.length - 1} aria-label={`Mover ${v.title} para baixo`} className="p-2 text-on-surface-variant disabled:opacity-25"><span className="material-symbols-outlined text-[18px]">arrow_downward</span></button>
                            </div>
                            <div className="pointer-events-auto hidden md:block">
                              <select aria-label={`Alterar status de ${v.title}`} value={v.status} onChange={(e) => handleStatusChange(v, e.target.value as VehicleStatus)} className="h-9 px-2 bg-surface-container border border-surface-variant/40 rounded-lg text-[10px] text-parchment focus:outline-none focus:border-secondary">
                                {(v.collectionKind === 'guest' ? GUEST_STATUS_OPTIONS : STATUS_OPTIONS).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </div>
                            <div className="pointer-events-auto">
                              <button
                                onClick={() => handleStartEditing(v)}
                                className="p-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 font-label-caps text-[11px]"
                                title="Editar este veículo"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                            </div>
                            <div className="pointer-events-auto">
                              <button
                                onClick={(event) => handleDeleteVehicle(v, event.currentTarget)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 font-label-caps text-[11px]"
                                title="Excluir este veículo"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                <span className="hidden sm:inline">Excluir</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>}
                {activeTab === 'diary' && <DiaryAdminPanel />}
              </div>
            )}
          </main>
        </motion.div>

        {pendingStatusVehicle && (
          <div className="fixed inset-0 z-50 grid place-items-center p-5 bg-background/80" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeStatusPrompt(); }}>
            <motion.div ref={statusDialogRef} role="dialog" aria-modal="true" aria-labelledby="status-title" initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-md rounded-2xl bg-surface-container-low p-6 shadow-2xl">
              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-primary-container text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">visibility</span>
                </div>
                <div>
                  <h2 id="status-title" className="font-headline-md text-2xl text-parchment">Veículo salvo! Defina o status</h2>
                  <p className="mt-2 text-sm text-on-surface-variant">Onde <strong className="text-parchment">{pendingStatusVehicle.title}</strong> deve ficar visível?</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(pendingStatusVehicle.collectionKind === 'guest' ? GUEST_STATUS_OPTIONS : STATUS_OPTIONS).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => confirmSaveWithStatus(option.value)}
                    className="min-h-12 px-4 rounded-xl bg-surface-container border border-surface-variant/40 text-sm font-label-caps text-parchment hover:border-secondary hover:bg-surface-variant/40 transition-colors cursor-pointer text-left flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      {option.value === 'published' ? 'public' : option.value === 'reserved' ? 'bookmark' : option.value === 'draft' ? 'edit_note' : 'sell'}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-5 text-xs text-on-surface-variant">
                {pendingStatusVehicle.collectionKind === 'guest'
                  ? 'Convidados publicados aparecem em uma seção própria e nunca recebem estado comercial.'
                  : 'Somente Publicado e Reservado aparecem no site. Novos veículos começam como rascunho.'}
              </p>
              <div className="mt-5 flex justify-end">
                <button type="button" onClick={closeStatusPrompt} className="min-h-11 px-4 rounded-xl text-xs font-label-caps text-on-surface-variant hover:bg-surface-container">Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}

        {deleteCandidate && (
          <div className="fixed inset-0 z-50 grid place-items-center p-5 bg-background/80" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDeleteDialog(); }}>
            <motion.div ref={deleteDialogRef} role="dialog" aria-modal="true" aria-labelledby="delete-title" initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-md rounded-2xl bg-surface-container-low p-6 shadow-2xl">
              <div className="flex gap-4 items-start">
                <img src={deleteCandidate.image} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <div>
                  <h2 id="delete-title" className="font-headline-md text-2xl text-parchment">Excluir veículo?</h2>
                  <p className="mt-2 text-sm text-on-surface-variant"><strong className="text-parchment">{deleteCandidate.title}</strong> será removido do acervo e da vitrine.</p>
                </div>
              </div>
              <p className="mt-5 text-xs text-on-surface-variant">Você terá 8 segundos para desfazer esta ação.</p>
              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button type="button" onClick={closeDeleteDialog} className="min-h-11 px-4 rounded-xl text-xs font-label-caps text-on-surface-variant hover:bg-surface-container">Cancelar</button>
                <button type="button" onClick={confirmDeleteVehicle} className="min-h-11 px-4 rounded-xl bg-error-container text-on-error-container text-xs font-label-caps font-bold hover:bg-error">Excluir veículo</button>
              </div>
            </motion.div>
          </div>
        )}

        {pendingDelete && (
          <div role="status" className="fixed z-50 left-5 right-5 bottom-5 sm:left-auto sm:w-[420px] rounded-xl bg-surface-container-highest p-4 shadow-2xl flex items-center justify-between gap-4">
            <p className="text-sm text-parchment"><strong>{pendingDelete.vehicle.title}</strong> foi removido.</p>
            <button type="button" onClick={undoDeleteVehicle} className="min-h-10 px-3 rounded-lg text-secondary font-label-caps text-xs font-bold hover:bg-surface-container">Desfazer</button>
          </div>
        )}
      </div>
  );
}
