import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { CustomVehicleService, CustomVehicle } from '../services/customVehicleService';
import { CloudImageService } from '../services/cloudImageService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded?: () => void;
}

export default function AdminModal({ isOpen, onClose, onVehicleAdded }: AdminModalProps) {
  const modalRef = useAccessibleModal(isOpen, onClose);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('studio_admin_logged') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Mode & Tabs
  const [activeTab, setActiveTab] = useState<'form' | 'express'>('form');
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // Express Smart State
  const [expressBrand, setExpressBrand] = useState('Chevrolet');
  const [expressModel, setExpressModel] = useState('Opala Comodoro');
  const [expressYear, setExpressYear] = useState('1988');

  // Cloud Image state
  const [isUploadingCloud, setIsUploadingCloud] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cloudProvider, setCloudProvider] = useState<string>('');

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
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Custom & Base vehicles list
  const [allVehicles, setAllVehicles] = useState<CustomVehicle[]>([]);

  const refreshVehiclesList = () => {
    setAllVehicles(CustomVehicleService.getCustomVehicles());
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshVehiclesList();
    }
  }, [isAuthenticated, isOpen]);

  // Handle local image file upload & preview
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCloudError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Cloud (ImgBB / Imgur)
  const handleUploadToCloud = async () => {
    const target = selectedFile || image;
    if (!target) {
      alert('Por favor, selecione primeiro um arquivo de imagem.');
      return;
    }

    try {
      playMechanicalClick('click');
      setIsUploadingCloud(true);
      setCloudError('');

      const result = await CloudImageService.uploadSmart(target);
      setImage(result.url);
      setImagePreview(result.url);
      setCloudProvider(result.provider);
      playMechanicalClick('modal');
    } catch (err: any) {
      setCloudError(err?.message || 'Erro ao hospedar na nuvem. Verifique sua conexão.');
    } finally {
      setIsUploadingCloud(false);
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    playMechanicalClick('click');

    if (username.trim() === 'admin' && password.trim() === 'senhorele2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('studio_admin_logged', 'true');
      setAuthError('');
    } else {
      setAuthError('Usuário ou senha incorretos.');
      playMechanicalClick('modal');
    }
  };

  const handleLogout = () => {
    playMechanicalClick('click');
    setIsAuthenticated(false);
    sessionStorage.removeItem('studio_admin_logged');
  };

  const resetForm = () => {
    setEditingVehicleId(null);
    setTitle('');
    setSubtitle('');
    setShareId('');
    setYear('');
    setEngine('');
    setTransmission('');
    setColor('');
    setPower('');
    setDescription('');
    setImage('');
    setImagePreview('');
    setSelectedFile(null);
    setCloudProvider('');
  };

  // Start editing a vehicle (including original 7 classics)
  const handleStartEditing = (v: CustomVehicle) => {
    playMechanicalClick('click');
    setEditingVehicleId(v.id);
    setTitle(v.title);
    setSubtitle(v.subtitle || '');
    setShareId(v.shareId);
    setYear(v.year);
    setEngine(v.engine || '');
    setTransmission(v.transmission || '');
    setColor(v.color || '');
    setPower(v.power || '');
    setDescription(v.description || '');
    setImage(v.image);
    setImagePreview(v.image);
    setActiveTab('form');
  };

  // Generate Smart Spec (Marca + Modelo + Ano)
  const handleGenerateSmartSpec = (brand: string, model: string, yr: string) => {
    playMechanicalClick('click');
    const spec = CustomVehicleService.generateSmartVehicleSpecs(brand, model, yr);
    setTitle(spec.title);
    setSubtitle(spec.subtitle);
    setShareId(spec.shareId);
    setYear(spec.year);
    setEngine(spec.engine);
    setTransmission(spec.transmission);
    setColor(spec.color || '');
    setPower(spec.power || '');
    setDescription(spec.description || '');
    setImage(spec.image);
    setImagePreview(spec.image);
    setActiveTab('form');
    setSuccessMsg(`Ficha técnica de "${spec.title}" preenchida automaticamente!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Submit Add or Update Vehicle
  const handleSubmitVehicle = (e: FormEvent) => {
    e.preventDefault();
    playMechanicalClick('click');

    if (!title.trim() || !year.trim()) {
      alert('Por favor, preencha pelo menos o Título e o Ano do veículo.');
      return;
    }

    const defaultShareId = shareId.trim() || `SRL-${title.substring(0, 3).toUpperCase()}-${year.trim()}`;
    const defaultImage = image || '/assets/images/vw-fusca-cal-style-1968.jpg';

    if (editingVehicleId) {
      // UPDATE EXISTING VEHICLE
      CustomVehicleService.updateCustomVehicle(editingVehicleId, {
        title: title.trim(),
        subtitle: subtitle.trim() || `Restauração Especial • ${year.trim()}`,
        shareId: defaultShareId,
        year: year.trim(),
        engine: engine.trim() || 'Air-Cooled Boxer',
        transmission: transmission.trim() || 'Manual 4 Marchas',
        color: color.trim(),
        power: power.trim(),
        description: description.trim() || 'Exemplar exclusivo da coleção Studio SenhorEle.',
        image: defaultImage,
      });

      setSuccessMsg(`Veículo "${title.trim()}" atualizado com sucesso!`);
    } else {
      // ADD NEW VEHICLE
      CustomVehicleService.addCustomVehicle({
        title: title.trim(),
        subtitle: subtitle.trim() || `Restauração Especial • ${year.trim()}`,
        shareId: defaultShareId,
        year: year.trim(),
        engine: engine.trim() || 'Air-Cooled Boxer',
        transmission: transmission.trim() || 'Manual 4 Marchas',
        color: color.trim(),
        power: power.trim(),
        description: description.trim() || 'Exemplar exclusivo da coleção Studio SenhorEle.',
        image: defaultImage,
      });

      setSuccessMsg(`Veículo "${title.trim()}" cadastrado no acervo!`);
    }

    refreshVehiclesList();
    if (onVehicleAdded) onVehicleAdded();
    resetForm();

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const handleDeleteVehicle = (id: string, vehicleTitle: string) => {
    if (confirm(`Tem certeza que deseja remover "${vehicleTitle}" do acervo?`)) {
      playMechanicalClick('click');
      CustomVehicleService.deleteCustomVehicle(id);
      refreshVehiclesList();
      if (editingVehicleId === id) resetForm();
      if (onVehicleAdded) onVehicleAdded();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md overflow-y-auto"
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-surface-container-low border border-secondary/50 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Top Header */}
          <div className="px-6 py-4 bg-surface-container-high border-b border-surface-variant/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              </div>
              <div>
                <h3 className="font-headline-md text-lg text-parchment font-bold">
                  {isAuthenticated ? 'Painel do Curador — Studio SenhorEle' : 'Acesso Interno / Login'}
                </h3>
                <p className="font-label-caps text-[11px] text-secondary">
                  {isAuthenticated ? 'Personalizar, Editar e Gerenciar o Acervo Completo' : 'Área Restrita do Sistema'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playMechanicalClick('modal');
                onClose();
              }}
              className="p-1.5 rounded-full text-on-surface-variant hover:text-parchment hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {!isAuthenticated ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto py-6">
                {authError && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-xs font-label-caps text-center">
                    {authError}
                  </div>
                )}

                <div>
                  <label className="block font-label-caps text-xs text-parchment mb-1.5">Usuário</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: admin"
                    className="w-full px-4 py-2.5 bg-surface-container border border-surface-variant/50 rounded-xl text-parchment text-sm focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-parchment mb-1.5">Senha</label>
                  <input
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
                  className="w-full bg-secondary hover:bg-amber-glow text-deep-charcoal font-label-caps font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer mt-4 flex items-center justify-center space-x-2"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Entrar no Painel</span>
                </button>

                <p className="text-[11px] text-on-surface-variant/70 text-center font-mono pt-2">
                  Dica Padrão: admin / senhorele2026
                </p>
              </form>
            ) : (
              /* ADMIN DASHBOARD & EDITING FORM */
              <div className="space-y-6">
                {/* Header Session Actions */}
                <div className="flex items-center justify-between bg-surface-container-high/40 p-3.5 rounded-xl border border-surface-variant/30">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-label-caps text-xs text-secondary font-bold">
                      Sessão Ativa do Curador ({allVehicles.length} Veículos no Acervo)
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
                <div className="flex border-b border-surface-variant/40 space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick('click');
                      setActiveTab('form');
                    }}
                    className={`px-4 py-2.5 font-label-caps text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === 'form'
                        ? 'border-secondary text-secondary bg-surface-container/60 rounded-t-xl'
                        : 'border-transparent text-on-surface-variant hover:text-parchment'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {editingVehicleId ? 'edit_note' : 'edit_document'}
                    </span>
                    <span>{editingVehicleId ? 'Editando Veículo' : 'Cadastro Completo / Personalizado'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick('click');
                      setActiveTab('express');
                    }}
                    className={`px-4 py-2.5 font-label-caps text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === 'express'
                        ? 'border-amber-400 text-amber-300 bg-amber-950/30 rounded-t-xl'
                        : 'border-transparent text-on-surface-variant hover:text-parchment'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-400">auto_awesome</span>
                    <span>Cadastro Rápido Inteligente (Marca/Modelo/Ano)</span>
                  </button>
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-label-caps flex items-center space-x-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* TAB 1: CADASTRO INTELIGENTE AUTO-FILL */}
                {activeTab === 'express' && (
                  <div className="p-4 bg-surface-container/50 border border-amber-500/30 rounded-2xl space-y-4">
                    <div className="flex items-center space-x-2 text-amber-300">
                      <span className="material-symbols-outlined text-[20px]">psychology</span>
                      <h4 className="font-headline-md text-xs font-bold uppercase tracking-wider">
                        Gerador Inteligente de Ficha Técnica (Marca, Modelo & Ano)
                      </h4>
                    </div>

                    <p className="text-xs text-on-surface-variant">
                      Informe a Marca, Modelo e Ano para que o assistente gere a motorização, história, câmbio e especificações de luxo automaticamente:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-label-caps text-[11px] text-on-surface-variant mb-1">Marca do Veículo *</label>
                        <input
                          type="text"
                          value={expressBrand}
                          onChange={(e) => setExpressBrand(e.target.value)}
                          placeholder="Ex: Chevrolet, VW, Ford, Porsche"
                          className="w-full px-3 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block font-label-caps text-[11px] text-on-surface-variant mb-1">Modelo do Veículo *</label>
                        <input
                          type="text"
                          value={expressModel}
                          onChange={(e) => setExpressModel(e.target.value)}
                          placeholder="Ex: Opala Comodoro, Maverick GT"
                          className="w-full px-3 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block font-label-caps text-[11px] text-on-surface-variant mb-1">Ano de Fabricação *</label>
                        <input
                          type="text"
                          value={expressYear}
                          onChange={(e) => setExpressYear(e.target.value)}
                          placeholder="Ex: 1988"
                          className="w-full px-3 py-2 bg-surface-container border border-surface-variant/40 rounded-xl text-parchment text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateSmartSpec(expressBrand, expressModel, expressYear)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-deep-charcoal font-label-caps font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">bolt</span>
                      <span>Gerar Ficha Técnica & Preencher Formulário</span>
                    </button>

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
                            setExpressBrand('VW');
                            setExpressModel('Gol GTI 2.0');
                            setExpressYear('1993');
                            handleGenerateSmartSpec('VW', 'Gol GTI 2.0', '1993');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ VW Gol GTI 1993
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExpressBrand('Porsche');
                            setExpressModel('911 Turbo 3.3');
                            setExpressYear('1985');
                            handleGenerateSmartSpec('Porsche', '911 Turbo 3.3', '1985');
                          }}
                          className="px-3 py-1 bg-surface-container hover:bg-surface-variant/40 border border-surface-variant/40 rounded-lg text-amber-200 font-label-caps text-[10px] cursor-pointer"
                        >
                          ⚡ Porsche 911 Turbo 1985
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2 / FORMULÁRIO COMPLETO & EDIÇÃO */}
                {activeTab === 'form' && (
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
                          placeholder="Ex: SRL-FSC-1994 (gerado automático se vazio)"
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

                    {/* Image Upload & Preview with ImgBB / Imgur CDN */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-label-caps text-xs text-on-surface-variant">Foto do Veículo (Upload do Computador ou Nuvem)</label>
                        <span className="text-[10px] text-secondary font-mono flex items-center space-x-1">
                          <span className="material-symbols-outlined text-[13px]">cloud</span>
                          <span>ImgBB & Imgur Cloud Ready</span>
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-label-caps file:bg-secondary/20 file:text-secondary hover:file:bg-secondary/30 cursor-pointer"
                        />

                        {selectedFile && (
                          <button
                            type="button"
                            disabled={isUploadingCloud}
                            onClick={handleUploadToCloud}
                            className="bg-sky-900/40 hover:bg-sky-800/60 border border-sky-400/50 text-sky-200 font-label-caps text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center space-x-1.5 font-bold disabled:opacity-50"
                          >
                            <span className={`material-symbols-outlined text-[16px] ${isUploadingCloud ? 'animate-spin' : ''}`}>
                              {isUploadingCloud ? 'sync' : 'cloud_upload'}
                            </span>
                            <span>{isUploadingCloud ? 'Enviando...' : 'Hospedar na Nuvem'}</span>
                          </button>
                        )}
                      </div>

                      {cloudError && (
                        <p className="text-xs text-rose-400 font-label-caps pt-1">{cloudError}</p>
                      )}

                      {imagePreview && (
                        <div className="mt-3 relative h-40 w-full rounded-xl overflow-hidden border border-secondary/40 shadow-md">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          {image.startsWith('http') && (
                            <div className="absolute top-2 right-2 bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 font-label-caps text-[10px] px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md">
                              <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                              <span>Hospedado via {cloudProvider || (image.includes('ibb.co') ? 'ImgBB CDN' : 'Cloud CDN')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-secondary hover:bg-amber-glow text-deep-charcoal font-label-caps font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {editingVehicleId ? 'save' : 'add_circle'}
                        </span>
                        <span>{editingVehicleId ? 'Salvar Alterações no Veículo' : 'Adicionar ao Acervo'}</span>
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
                <div className="space-y-3 pt-6 border-t border-surface-variant/40">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline-md text-sm text-parchment font-bold">
                      Gerenciar Veículos do Acervo Completo ({allVehicles.length})
                    </h4>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      Edite ou exclua qualquer modelo
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {allVehicles.map((v) => (
                      <div
                        key={v.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          editingVehicleId === v.id
                            ? 'bg-amber-950/40 border-amber-400/80 shadow-md'
                            : 'bg-surface-container/60 border-surface-variant/30 hover:border-surface-variant/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <img src={v.image} alt={v.title} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-surface-variant/40" />
                          <div className="truncate">
                            <div className="font-headline-md text-xs text-parchment font-bold truncate">
                              {v.title}
                            </div>
                            <div className="font-mono text-[10px] text-secondary truncate">
                              #{v.shareId} • {v.year}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleStartEditing(v)}
                            className="p-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 font-label-caps text-[11px]"
                            title="Editar este veículo"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          <button
                            onClick={() => handleDeleteVehicle(v.id, v.title)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 font-label-caps text-[11px]"
                            title="Excluir este veículo"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span className="hidden sm:inline">Excluir</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
