import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { CalendarPlus, Check, ChevronLeft, ChevronRight, ExternalLink, ImagePlus, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { SocialSource, StudioUpdate, StudioUpdateCounts, StudioUpdateService, UpdateContentType } from '../services/studioUpdateService';
import { SupabaseService } from '../services/supabaseService';
import { dateTimeLocalToIso, toDateTimeLocalInput } from '../utils/dateTimeLocal';

type DisplayAspect = 'portrait' | 'landscape' | 'square';
type EditableUpdate = StudioUpdate & { displayAspect?: DisplayAspect };

const PAGE_SIZE = 12;
const EMPTY_COUNTS: StudioUpdateCounts = { featured: 0, archived: 0, hidden: 0 };
const EMPTY_FORM = {
  title: '', summary: '', authorName: 'Studio SenhorEle', contentType: 'note' as UpdateContentType,
  publishedAt: '', thumbnailUrl: '', canonicalUrl: '',
  eventStartsAt: '', eventEndsAt: '', location: '', ctaLabel: '', ctaUrl: '', displayAspect: 'landscape' as DisplayAspect,
};

const inputClass = 'w-full rounded-xl border border-surface-variant/45 bg-surface-container px-3 py-2.5 text-base text-parchment outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary focus-visible:ring-1 focus-visible:ring-secondary';

export default function DiaryAdminPanel() {
  const editorTitleRef = useRef<HTMLHeadingElement>(null);
  const contentListRef = useRef<HTMLDivElement>(null);
  const focusListAfterLoad = useRef(false);
  const [updates, setUpdates] = useState<EditableUpdate[]>([]);
  const [sources, setSources] = useState<SocialSource[]>([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<EditableUpdate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!coverFile) { setCoverPreview(''); return; }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const selectCover = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Escolha uma imagem JPG, PNG ou WebP.'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5 MB.'); return;
    }
    setError('');
    setCoverFile(file);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [updatePage, nextSources, nextCounts] = await Promise.all([
        StudioUpdateService.fetchAdminPage(page, PAGE_SIZE),
        StudioUpdateService.fetchSources(),
        StudioUpdateService.fetchAdminCounts(),
      ]);
      setUpdates(updatePage.items as EditableUpdate[]);
      setTotal(updatePage.total);
      setSources(nextSources);
      setCounts(nextCounts);
      if (focusListAfterLoad.current) {
        focusListAfterLoad.current = false;
        window.requestAnimationFrame(() => contentListRef.current?.focus());
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar o Diário.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { void refresh(); }, [refresh]);

  const resetForm = () => {
    if (busy === 'save') return;
    setEditing(null);
    setCoverFile(null);
    setEditorOpen(false);
  };

  const startNew = (contentType: 'event' | 'note') => {
    if (busy === 'save') return;
    setCoverFile(null);
    setEditing(null);
    setNotice('');
    setError('');
    setForm({ ...EMPTY_FORM, contentType, publishedAt: toDateTimeLocalInput() });
    setEditorOpen(true);
    window.requestAnimationFrame(() => editorTitleRef.current?.focus());
  };

  const startEdit = (item: EditableUpdate) => {
    if (busy === 'save') return;
    setCoverFile(null);
    setEditing(item);
    setEditorOpen(true);
    setForm({
      title: item.title, summary: item.summary, authorName: item.authorName, contentType: item.contentType,
      publishedAt: toDateTimeLocalInput(item.publishedAt), thumbnailUrl: item.thumbnailUrl || '', canonicalUrl: item.canonicalUrl || '',
      eventStartsAt: item.eventStartsAt ? toDateTimeLocalInput(item.eventStartsAt) : '', eventEndsAt: item.eventEndsAt ? toDateTimeLocalInput(item.eventEndsAt) : '', location: item.location || '',
      ctaLabel: item.ctaLabel || '', ctaUrl: item.ctaUrl || '', displayAspect: item.displayAspect || 'landscape',
    });
    window.requestAnimationFrame(() => {
      editorTitleRef.current?.focus();
      document.getElementById('diary-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const reloadFromFirstPage = async () => {
    if (page === 1) await refresh();
    else setPage(1);
  };

  const isEvent = form.contentType === 'event';
  // Older manual entries could be saved as events without a date, or as notes with dates.
  const hasLegacyDates = editing && editing.contentType !== 'event' && (editing.eventStartsAt || editing.eventEndsAt);
  const showEventDates = isEvent || Boolean(hasLegacyDates && editing.contentType === form.contentType);
  const startRequired = isEvent && (editing?.contentType !== 'event' || Boolean(editing.eventStartsAt || form.eventEndsAt));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy('save'); setError(''); setNotice('');
    try {
      const eventStartsAt = showEventDates && form.eventStartsAt ? dateTimeLocalToIso(form.eventStartsAt) : '';
      const eventEndsAt = showEventDates && form.eventEndsAt ? dateTimeLocalToIso(form.eventEndsAt) : '';
      if (startRequired && !eventStartsAt) throw new Error('Informe a data e a hora de início do evento.');
      if (eventStartsAt && eventEndsAt && eventEndsAt < eventStartsAt) throw new Error('O término precisa ser igual ou posterior ao início do evento.');
      let thumbnailUrl = form.thumbnailUrl;
      if (coverFile) {
        const uploaded = await SupabaseService.uploadImage(coverFile, `diary-${crypto.randomUUID()}.${coverFile.type === 'image/png' ? 'png' : coverFile.type === 'image/webp' ? 'webp' : 'jpg'}`);
        if (!uploaded) throw new Error('Não foi possível enviar a imagem. Tente novamente; seus dados foram mantidos.');
        thumbnailUrl = uploaded;
        setForm((current) => ({ ...current, thumbnailUrl }));
        setCoverFile(null);
      }
      const payload = { ...form, thumbnailUrl, publishedAt: dateTimeLocalToIso(form.publishedAt), eventStartsAt, eventEndsAt };
      if (editing) await StudioUpdateService.update(editing.id, payload);
      else await StudioUpdateService.createManual(payload);
      setNotice(editing ? 'Publicação atualizada.' : isEvent ? 'Evento publicado no Diário.' : 'Novidade publicada no Diário.');
      setEditing(null);
      setCoverFile(null);
      setEditorOpen(false);
      await reloadFromFirstPage();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar.');
    } finally { setBusy(null); }
  };

  const setStatus = async (item: EditableUpdate, status: 'published' | 'rejected') => {
    if (busy) return;
    setBusy(`${status}-${item.id}`); setError(''); setNotice('');
    try {
      await StudioUpdateService.setStatus(item, status);
      setNotice(status === 'published' ? 'Conteúdo publicado.' : 'Conteúdo ocultado do site.');
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível alterar o estado.'); }
    finally { setBusy(null); }
  };

  const remove = async (item: EditableUpdate) => {
    if (busy) return;
    if (!window.confirm(`Excluir definitivamente “${item.title}”?`)) return;
    setBusy(`delete-${item.id}`); setError(''); setNotice('');
    try { await StudioUpdateService.remove(item.id); await reloadFromFirstPage(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível excluir.'); }
    finally { setBusy(null); }
  };

  const sync = async () => {
    if (busy) return;
    setBusy('sync'); setError(''); setNotice('');
    try {
      const result = await StudioUpdateService.syncNow();
      setNotice(`Sincronização concluída: ${result.imported ?? 0} novo(s) item(ns) publicado(s).`);
      await reloadFromFirstPage();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha na sincronização. Verifique as credenciais das fontes.'); }
    finally { setBusy(null); }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const locationField = (
    <label className="text-sm text-parchment">Local (opcional)
      <input maxLength={500} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={`${inputClass} mt-1.5`} />
    </label>
  );

  return (
    <section className="space-y-8" aria-labelledby="diary-admin-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="diary-admin-title" className="font-headline-lg text-3xl text-parchment">Diário do Studio</h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-on-surface-variant">Instagram e YouTube são publicados automaticamente. Use este painel para acompanhar integrações, editar, ocultar ou criar uma novidade manual.</p>
        </div>
        <button type="button" onClick={sync} disabled={busy === 'sync'} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-xs font-bold text-background disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
          <RefreshCw size={16} className={busy === 'sync' ? 'animate-spin' : ''} aria-hidden="true" />{busy === 'sync' ? 'Sincronizando…' : 'Sincronizar agora'}
        </button>
      </div>

      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] bg-surface-variant/30 sm:grid-cols-3">
        {([['Em destaque', counts.featured], ['No arquivo', counts.archived], ['Ocultos', counts.hidden]] as const).map(([label, value]) => (
          <div key={label} className="bg-surface-container-low px-3 py-5 text-center sm:px-6">
            <dt className="text-[10px] font-label-caps uppercase tracking-[0.09em] text-on-surface-variant">{label}</dt>
            <dd className="mt-2 font-headline-lg text-3xl tabular-nums text-parchment">{value}</dd>
          </div>
        ))}
      </dl>

      {(notice || error) && <div role={error ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${error ? 'bg-rose-950/50 text-rose-200' : 'bg-primary-container text-primary-fixed'}`}>{error || notice}</div>}

      <section aria-labelledby="source-status-title">
        <h3 id="source-status-title" className="font-headline-md text-xl text-parchment">Estado das integrações</h3>
        <div className="mt-4 divide-y divide-surface-variant/30 border-y border-surface-variant/30">
          {sources.length === 0 && !loading && <p className="py-5 text-sm text-on-surface-variant">Nenhuma fonte configurada.</p>}
          {sources.map((source) => (
            <div key={source.id} className="flex min-w-0 flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-parchment">{source.displayName} <span className="font-normal text-on-surface-variant">{source.handle}</span></p>
                <p className="mt-1 text-xs text-on-surface-variant">{source.platform === 'youtube' ? 'YouTube' : 'Instagram'} · {source.editorialRole === 'partner' ? 'Parceiro' : 'Oficial'}</p>
              </div>
              <div className="min-w-0 text-xs sm:text-right">
                <p className={source.lastSyncStatus === 'error' ? 'text-rose-300' : 'text-on-surface-variant'}>{source.lastSyncStatus === 'error' ? 'Erro na última sincronização' : source.lastSyncedAt ? `Sincronizado em ${new Date(source.lastSyncedAt).toLocaleString('pt-BR', { calendar: 'gregory' })}` : 'Aguardando primeira sincronização'}</p>
                {source.lastSyncError && <p className="mt-1 max-w-[48ch] break-words text-rose-300">{source.lastSyncError}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="manual-entry-title">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 id="manual-entry-title" className="font-headline-md text-xl text-parchment">Publicação manual</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Publique uma novidade ou adicione um encontro à agenda do Studio.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-expanded={editorOpen} aria-controls="diary-editor" onClick={() => editorOpen ? resetForm() : startNew('note')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-surface-container-high px-4 text-xs font-bold text-parchment hover:bg-surface-container-highest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
              {editorOpen ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{editorOpen ? 'Fechar formulário' : 'Nova publicação manual'}
            </button>
            {!editorOpen && <button type="button" aria-expanded={false} aria-controls="diary-editor" onClick={() => startNew('event')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-secondary/50 px-4 text-sm font-bold text-secondary hover:bg-secondary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
              <CalendarPlus size={17} aria-hidden="true" />Novo evento
            </button>}
          </div>
        </div>

        {editorOpen && (
          <form id="diary-editor" onSubmit={save} className="mt-5 scroll-mt-40 space-y-5 rounded-2xl bg-surface-container-low p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h4 ref={editorTitleRef} tabIndex={-1} className="font-headline-md text-xl text-parchment outline-none">{editing ? 'Editar publicação' : isEvent ? 'Novo evento' : 'Nova publicação manual'}</h4>
              {editing && <button type="button" onClick={() => resetForm()} className="min-h-11 rounded-xl px-3 text-xs text-on-surface-variant hover:text-parchment">Cancelar edição</button>}
            </div>
            <fieldset disabled={busy === 'save'} className="min-w-0 space-y-5 disabled:opacity-60">
            <div className="space-y-2">
              <p className="text-sm text-parchment">Imagem de capa (opcional)</p>
              <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectCover} className="sr-only" tabIndex={-1} aria-label="Arquivo da imagem de capa" />
              <button type="button" onClick={() => coverInputRef.current?.click()} aria-label={coverPreview || form.thumbnailUrl ? 'Trocar imagem de capa' : 'Selecionar imagem de capa'} className="group flex min-h-44 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-secondary/45 bg-surface-container p-4 text-parchment hover:border-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
                {coverPreview || form.thumbnailUrl ? <img src={coverPreview || form.thumbnailUrl} alt="Prévia da capa" className="max-h-64 w-full rounded-lg object-contain" /> : <ImagePlus size={40} className="text-secondary" aria-hidden="true" />}
                <span className="text-base font-semibold">{coverPreview || form.thumbnailUrl ? 'Clique para trocar a imagem' : 'Clique para escolher a imagem'}</span>
                <span className="text-sm text-on-surface-variant">Da galeria ou do computador · JPG, PNG ou WebP · até 5 MB</span>
              </button>
              {(coverFile || form.thumbnailUrl) && <button type="button" onClick={() => { setCoverFile(null); setForm({ ...form, thumbnailUrl: '' }); }} className="min-h-11 rounded-lg px-3 text-sm text-rose-300">Remover imagem</button>}
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant">Título *<input required maxLength={180} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`${inputClass} mt-1.5`} /></label>

            </div>
            {showEventDates && (
              <fieldset className="min-w-0 rounded-xl border border-secondary/35 px-4 pb-4">
                <legend className="px-2 font-headline-md text-lg text-parchment">Data do evento</legend>
                <p className="mt-1 text-sm text-on-surface-variant">Horários no fuso deste dispositivo ({Intl.DateTimeFormat().resolvedOptions().timeZone}). Sem horário de término, o evento sai da agenda quando começa.</p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <label className="min-w-0 text-sm text-parchment">Início do evento{startRequired && ' *'}
                    <input type="datetime-local" required={startRequired} value={form.eventStartsAt} onInput={(e) => setForm({ ...form, eventStartsAt: e.currentTarget.value })} className={`${inputClass} mt-1.5`} />
                  </label>
                  <label className="min-w-0 text-sm text-parchment">Término do evento (opcional)
                    <input type="datetime-local" min={form.eventStartsAt || undefined} value={form.eventEndsAt} onInput={(e) => setForm({ ...form, eventEndsAt: e.currentTarget.value })} className={`${inputClass} mt-1.5`} />
                  </label>
                  {locationField}
                </div>
              </fieldset>
            )}

            <label className="block text-sm text-on-surface-variant">Descrição (opcional)<textarea maxLength={5000} rows={4} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={`${inputClass} mt-1.5 resize-y`} /></label>
            <details className="rounded-xl border border-surface-variant/45 p-4">
              <summary className="cursor-pointer text-base text-parchment">Mais opções</summary>
              <p className="my-3 text-sm text-on-surface-variant">Autor, formato, links e data da publicação. Os valores padrão já permitem publicar.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-on-surface-variant">Data da publicação *<input required type="datetime-local" value={form.publishedAt} onInput={(e) => setForm({ ...form, publishedAt: e.currentTarget.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-sm text-on-surface-variant">Link original<input type="url" value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} placeholder="https://…" className={`${inputClass} mt-1.5`} /></label>
              {!showEventDates && locationField}
              <label className="text-sm text-on-surface-variant">Texto do botão<input maxLength={120} value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-sm text-on-surface-variant">Destino do botão<input type="url" value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} placeholder="https://…" className={`${inputClass} mt-1.5`} /></label>
              <label className="text-sm text-on-surface-variant">Autor *<input required maxLength={180} value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-sm text-on-surface-variant">Tipo<select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value as UpdateContentType })} className={`${inputClass} mt-1.5`}><option value="event">Evento</option><option value="note">Nota</option><option value="video">Vídeo</option><option value="reel">Reel / Short</option><option value="image">Imagem</option><option value="carousel">Carrossel</option></select></label>
              <label className="text-sm text-on-surface-variant">Formato da mídia<select value={form.displayAspect} onChange={(e) => setForm({ ...form, displayAspect: e.target.value as DisplayAspect })} className={`${inputClass} mt-1.5`}><option value="landscape">Horizontal 16:9</option><option value="portrait">Vertical 9:16</option><option value="square">Quadrado 1:1</option></select></label>
            </div>
            </details>
            <button type="submit" disabled={busy === 'save'} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-5 text-xs font-bold text-background disabled:opacity-50"><Check size={16} aria-hidden="true" />{busy === 'save' ? (coverFile ? 'Enviando imagem…' : 'Salvando…') : editing ? 'Salvar alterações' : isEvent ? 'Publicar evento' : 'Publicar agora'}</button>
            </fieldset>
          </form>
        )}
      </section>

      <section aria-labelledby="diary-content-title">
        <h3 id="diary-content-title" className="font-headline-md text-xl text-parchment">Conteúdos do Diário</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Itens novos entram publicados; você ainda pode ocultar ou republicar qualquer conteúdo.</p>
        {loading ? <p role="status" className="py-10 text-center text-on-surface-variant"><LoaderCircle className="mr-2 inline animate-spin" size={18} />Carregando…</p> : updates.length === 0 ? <p className="py-10 text-on-surface-variant">Nenhuma novidade importada ou criada.</p> : (
          <div ref={contentListRef} tabIndex={-1} className="mt-4 divide-y divide-surface-variant/30 border-y border-surface-variant/30 outline-none" aria-live="polite">
            {updates.map((item) => (
              <article key={item.id} className="grid min-w-0 gap-4 py-5 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center">
                <div className={`${item.displayAspect === 'portrait' ? 'aspect-[9/16]' : item.displayAspect === 'square' ? 'aspect-square' : 'aspect-video'} w-24 overflow-hidden rounded-xl bg-surface-container`}>
                  {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" loading="lazy" className={`h-full w-full ${item.displayAspect === 'portrait' ? 'object-contain' : 'object-cover'}`} />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${item.editorialStatus === 'published' ? 'bg-emerald-900/50 text-emerald-200' : 'bg-surface-container-high text-on-surface-variant'}`}>{item.editorialStatus === 'published' ? 'Publicado' : 'Oculto'}</span><span className="break-words text-[10px] uppercase tracking-wider text-on-surface-variant">{item.platform} · {item.authorName}</span></div>
                  <h4 className="mt-2 truncate text-base font-semibold text-parchment">{item.title}</h4>
                  <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{item.summary || 'Sem resumo editorial.'}</p>
                </div>
                <div className="flex flex-wrap gap-1 sm:justify-end">
                  {item.canonicalUrl && <a href={item.canonicalUrl} target="_blank" rel="noopener noreferrer" aria-label={`Abrir publicação original: ${item.title}`} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-parchment"><ExternalLink size={17} /></a>}
                  <button type="button" onClick={() => startEdit(item)} aria-label={`Editar ${item.title}`} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-amber-300 hover:bg-surface-container"><Pencil size={17} /></button>
                  {item.editorialStatus !== 'published' ? <button type="button" disabled={busy === `published-${item.id}`} onClick={() => setStatus(item, 'published')} aria-label={`Publicar ${item.title}`} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-emerald-300 hover:bg-emerald-950/40"><Check size={18} /></button> : <button type="button" disabled={busy === `rejected-${item.id}`} onClick={() => setStatus(item, 'rejected')} aria-label={`Ocultar ${item.title}`} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-on-surface-variant hover:bg-surface-container"><X size={18} /></button>}
                  <button type="button" disabled={busy === `delete-${item.id}`} onClick={() => remove(item)} aria-label={`Excluir ${item.title}`} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-rose-300 hover:bg-rose-950/40"><Trash2 size={17} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && pages > 1 && (
          <nav aria-label="Paginação dos conteúdos do Diário" className="mt-6 flex items-center justify-center gap-3">
            <button type="button" disabled={page === 1} onClick={() => { focusListAfterLoad.current = true; setPage((value) => value - 1); }} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-parchment disabled:opacity-35" aria-label="Página anterior"><ChevronLeft size={18} /></button>
            <span className="text-sm tabular-nums text-on-surface-variant" aria-live="polite">{page} / {pages}</span>
            <button type="button" disabled={page === pages} onClick={() => { focusListAfterLoad.current = true; setPage((value) => value + 1); }} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-parchment disabled:opacity-35" aria-label="Próxima página"><ChevronRight size={18} /></button>
          </nav>
        )}
      </section>
    </section>
  );
}
