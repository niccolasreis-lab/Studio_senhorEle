import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { CustomVehicleService, CustomVehicle } from '../services/customVehicleService';
import { ImgurService } from '../services/imgurService';
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

  // Imgur Cloud state
  const [isUploadingImgur, setIsUploadingImgur] = useState(false);
  const [imgurError, setImgurError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);



  // Form state for new vehicle
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

  // Custom vehicles list
  const [customVehicles, setCustomVehicles] = useState<CustomVehicle[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      setCustomVehicles(CustomVehicleService.getCustomVehicles());
    }
  }, [isAuthenticated, isOpen]);

  // Handle image file upload & preview
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImgurError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [cloudProvider, setCloudProvider] = useState<string>('');

  const handleUploadToCloud = async () => {
    const target = selectedFile || image;
    if (!target) {
      alert('Por favor, selecione primeiro um arquivo de imagem.');
      return;
    }

    try {
      playMechanicalClick('click');
      setIsUploadingImgur(true);
      setImgurError('');

      const result = await CloudImageService.uploadSmart(target);
      setImage(result.url);
      setImagePreview(result.url);
      setCloudProvider(result.provider);
      playMechanicalClick('modal');
    } catch (err: any) {
      setImgurError(err?.message || 'Erro ao hospedar na nuvem. Verifique sua conexão.');
    } finally {
      setIsUploadingImgur(false);
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

  const fillPreset = (presetKey: 'fusca' | 'porsche' | 'kombi') => {
    playMechanicalClick('click');
    if (presetKey === 'fusca') {
      setTitle('VW Fusca Itamar');
      setYear('1994');
      setSubtitle('Edição Especial de Coleção • 1994');
      setShareId('SRL-FSC-1994');
      setEngine('1600cc Catalisado Air-Cooled');
      setTransmission('Manual 4 Marchas Original');
      setColor('Verde Tahiti Metálico');
      setPower('58 cv SAE @ 4.200 RPM');
      setDescription('Fusca Itamar 1994 em raro estado de conservação, estofamento cinza aveludado original, volante espumado e motor 1600 catalisado impecável.');
      setImage('/assets/images/vw-fusca-cal-style-1968.jpg');
      setImagePreview('/assets/images/vw-fusca-cal-style-1968.jpg');
    } else if (presetKey === 'porsche') {
      setTitle('Porsche 911 Carrera 3.2');
      setYear('1989');
      setSubtitle('Matching Numbers G-Series • 1989');
      setShareId('SRL-911-1989');
      setEngine('3.2L Flat-6 Air-Cooled Boxer');
      setTransmission('Manual 5 Marchas G50');
      setColor('Preto Guards Black / Couro Preto');
      setPower('217 cv @ 5.900 RPM');
      setDescription('Exemplar final da lendária série G com câmbio Getrag G50, teto solar elétrico original e histórico de manutenção documentado.');
      setImage('/assets/images/porsche-911-classic-1973.jpg');
      setImagePreview('/assets/images/porsche-911-classic-1973.jpg');
    } else if (presetKey === 'kombi') {
      setTitle('VW Kombi Last Edition');
      setYear('2013');
      setSubtitle('Série Numerada N° 1200 • 2013');
      setShareId('SRL-KMB-2013');
      setEngine('1.4L TotalFlex Refrigeração Líquida');
      setTransmission('Manual 4 Marchas');
      setColor('Saia e Blusa Azul Boreal e Branco');
      setPower('80 cv @ 4.800 RPM');
      setDescription('Edição de despedida numerada de fábrica, cortinas azuis originais, pneus faixa branca e certificado de autenticidade da montadora.');
      setImage('/assets/images/vw-kombi-corujinha-1970.jpg');
      setImagePreview('/assets/images/vw-kombi-corujinha-1970.jpg');
    }
  };

  const handleAddVehicle = (e: FormEvent) => {
    e.preventDefault();
    playMechanicalClick('click');

    if (!title.trim() || !year.trim()) {
      alert('Por favor, preencha pelo menos o Título e o Ano do veículo.');
      return;
    }

    const defaultShareId = shareId.trim() || `SRL-${title.substring(0, 3).toUpperCase()}-${year.trim()}`;
    const defaultImage = image || '/assets/images/vw-fusca-cal-style-1968.jpg';

    const newVehicle = CustomVehicleService.addCustomVehicle({
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

    setCustomVehicles(CustomVehicleService.getCustomVehicles());
    setSuccessMsg(`Veículo "${newVehicle.title}" cadastrado com sucesso!`);

    // Reset form
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

    if (onVehicleAdded) onVehicleAdded();

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('Tem certeza que deseja remover este veículo do acervo?')) {
      playMechanicalClick('click');
      CustomVehicleService.deleteCustomVehicle(id);
      setCustomVehicles(CustomVehicleService.getCustomVehicles());
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
          className="relative w-full max-w-2xl bg-surface-container-low border border-secondary/50 rounded-2xl shadow-2xl overflow-hidden my-8"
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
                  {isAuthenticated ? 'Cadastrar e Gerenciar Acervo' : 'Área Restrita do Sistema'}
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
              /* ADMIN DASHBOARD & ADD FORM */
              <div className="space-y-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between bg-surface-container-high/40 p-3 rounded-xl border border-surface-variant/30">
                  <span className="font-label-caps text-xs text-secondary font-bold">
                    Sessão Ativa como Curador
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-label-caps text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sair</span>
                  </button>
                </div>



                {successMsg && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-label-caps flex items-center space-x-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Add Form */}
                <form onSubmit={handleAddVehicle} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-variant/40 pb-3">
                    <h4 className="font-headline-md text-base text-parchment font-bold">
                      Incluir Novo Veículo no Acervo
                    </h4>

                    {/* Preenchimento Automático / Presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-label-caps text-[10px] text-secondary font-bold mr-1 flex items-center space-x-1">
                        <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                        <span>Preencher Exemplo:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => fillPreset('fusca')}
                        className="bg-secondary/15 hover:bg-secondary text-secondary hover:text-deep-charcoal border border-secondary/40 font-label-caps text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold"
                        title="Preencher com exemplo do Fusca Itamar 1994"
                      >
                        ⚡ Fusca 1994
                      </button>
                      <button
                        type="button"
                        onClick={() => fillPreset('porsche')}
                        className="bg-secondary/15 hover:bg-secondary text-secondary hover:text-deep-charcoal border border-secondary/40 font-label-caps text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold"
                        title="Preencher com exemplo do Porsche 911 1989"
                      >
                        ⚡ Porsche 1989
                      </button>
                      <button
                        type="button"
                        onClick={() => fillPreset('kombi')}
                        className="bg-secondary/15 hover:bg-secondary text-secondary hover:text-deep-charcoal border border-secondary/40 font-label-caps text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold"
                        title="Preencher com exemplo da Kombi 2013"
                      >
                        ⚡ Kombi 2013
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Título do Veículo *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: VW Fusca Itamar 1994"
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

                  {/* Image Upload & Preview with Imgur CDN */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-label-caps text-xs text-on-surface-variant">Foto do Veículo (Upload do Computador ou Nuvem Imgur)</label>
                      <span className="text-[10px] text-secondary font-mono flex items-center space-x-1">
                        <span className="material-symbols-outlined text-[13px]">cloud</span>
                        <span>Imgur Cloud API Ready</span>
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
                          disabled={isUploadingImgur}
                          onClick={handleUploadToCloud}
                          className="bg-sky-900/40 hover:bg-sky-800/60 border border-sky-400/50 text-sky-200 font-label-caps text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center space-x-1.5 font-bold disabled:opacity-50"
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isUploadingImgur ? 'animate-spin' : ''}`}>
                            {isUploadingImgur ? 'sync' : 'cloud_upload'}
                          </span>
                          <span>{isUploadingImgur ? 'Enviando...' : 'Hospedar na Nuvem'}</span>
                        </button>
                      )}
                    </div>

                    {imgurError && (
                      <p className="text-xs text-rose-400 font-label-caps pt-1">{imgurError}</p>
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

                  <button
                    type="submit"
                    className="w-full bg-secondary hover:bg-amber-glow text-deep-charcoal font-label-caps font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2 mt-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Salvar e Adicionar ao Acervo</span>
                  </button>
                </form>

                {/* Custom Vehicles List */}
                {customVehicles.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-surface-variant/40">
                    <h4 className="font-headline-md text-sm text-parchment font-bold">
                      Veículos Cadastrados Recentemente ({customVehicles.length})
                    </h4>

                    <div className="space-y-2">
                      {customVehicles.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between bg-surface-container p-3 rounded-xl border border-surface-variant/30"
                        >
                          <div className="flex items-center space-x-3">
                            <img src={v.image} alt={v.title} className="w-12 h-12 object-cover rounded-lg" />
                            <div>
                              <div className="font-headline-md text-xs text-parchment font-bold">{v.title}</div>
                              <div className="font-mono text-[10px] text-secondary">#{v.shareId} • {v.year}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteVehicle(v.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Remover veículo"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
