import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ExternalLink, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { SocialSource, StudioUpdate, StudioUpdateCounts, StudioUpdateService, UpdateContentType } from '../services/studioUpdateService';
import { dateTimeLocalToIso, toDateTimeLocalInput } from '../utils/dateTimeLocal';

type DisplayAspect = 'portrait' | 'landscape' | 'square';
type EditableUpdate = StudioUpdate & { displayAspect?: DisplayAspect };

const PAGE_SIZE = 12;
const EMPTY_COUNTS: StudioUpdateCounts = { featured: 0, archived: 0, hidden: 0 };
const EMPTY_FORM = {
  title: '', summary: '', authorName: 'Studio SenhorEle', contentType: 'event' as UpdateContentType,
  publishedAt: toDateTimeLocalInput(), thumbnailUrl: '', canonicalUrl: '',
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

  const resetForm = (close = true) => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, publishedAt: toDateTimeLocalInput() });
    if (close) setEditorOpen(false);
  };

  const startEdit = (item: EditableUpdate) => {
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

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy('save'); setError(''); setNotice('');
    const payload = {
      ...form,
      publishedAt: dateTimeLocalToIso(form.publishedAt),
      eventStartsAt: form.eventStartsAt ? dateTimeLocalToIso(form.eventStartsAt) : undefined,
      eventEndsAt: form.eventEndsAt ? dateTimeLocalToIso(form.eventEndsAt) : undefined,
    };
    try {
      if (editing) await StudioUpdateService.update(editing.id, payload);
      else await StudioUpdateService.createManual(payload);
      setNotice(editing ? 'Novidade atualizada.' : 'Novidade publicada no Diário.');
      resetForm();
      await reloadFromFirstPage();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar.');
    } finally { setBusy(null); }
  };

  const setStatus = async (item: EditableUpdate, status: 'published' | 'rejected') => {
    setBusy(`${status}-${item.id}`); setError(''); setNotice('');
    try {
      await StudioUpdateService.setStatus(item, status);
      setNotice(status === 'published' ? 'Conteúdo publicado.' : 'Conteúdo ocultado do site.');
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível alterar o estado.'); }
    finally { setBusy(null); }
  };

  const remove = async (item: EditableUpdate) => {
    if (!window.confirm(`Excluir definitivamente “${item.title}”?`)) return;
    setBusy(`delete-${item.id}`); setError(''); setNotice('');
    try { await StudioUpdateService.remove(item.id); await reloadFromFirstPage(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível excluir.'); }
    finally { setBusy(null); }
  };

  const sync = async () => {
    setBusy('sync'); setError(''); setNotice('');
    try {
      const result = await StudioUpdateService.syncNow();
      setNotice(`Sincronização concluída: ${result.imported ?? 0} novo(s) item(ns) publicado(s).`);
      await reloadFromFirstPage();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha na sincronização. Verifique as credenciais das fontes.'); }
    finally { setBusy(null); }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
            <p className="mt-1 text-sm text-on-surface-variant">Para eventos e notas que não vêm das redes sociais.</p>
          </div>
          <button type="button" aria-expanded={editorOpen} aria-controls="diary-editor" onClick={() => { if (editorOpen) resetForm(); else { setEditorOpen(true); window.requestAnimationFrame(() => editorTitleRef.current?.focus()); } }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-surface-container-high px-4 text-xs font-bold text-parchment hover:bg-surface-container-highest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
            {editorOpen ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{editorOpen ? 'Fechar formulário' : 'Nova publicação manual'}
          </button>
        </div>

        {editorOpen && (
          <form id="diary-editor" onSubmit={save} className="mt-5 scroll-mt-40 space-y-5 rounded-2xl bg-surface-container-low p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h4 ref={editorTitleRef} tabIndex={-1} className="font-headline-md text-xl text-parchment outline-none">{editing ? 'Editar novidade' : 'Nova publicação manual'}</h4>
              {editing && <button type="button" onClick={() => resetForm()} className="min-h-11 rounded-xl px-3 text-xs text-on-surface-variant hover:text-parchment">Cancelar edição</button>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-label-caps text-on-surface-variant">Título *<input required maxLength={180} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Autor *<input required maxLength={180} value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Tipo<select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value as UpdateContentType })} className={`${inputClass} mt-1.5`}><option value="event">Evento</option><option value="note">Nota</option><option value="video">Vídeo</option><option value="reel">Reel / Short</option><option value="image">Imagem</option><option value="carousel">Carrossel</option></select></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Formato da mídia<select value={form.displayAspect} onChange={(e) => setForm({ ...form, displayAspect: e.target.value as DisplayAspect })} className={`${inputClass} mt-1.5`}><option value="landscape">Horizontal 16:9</option><option value="portrait">Vertical 9:16</option><option value="square">Quadrado 1:1</option></select></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Data da publicação *<input required type="datetime-local" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Imagem de capa<input type="url" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://…" className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Link original<input type="url" value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} placeholder="https://…" className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Local<input maxLength={500} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Início do evento<input type="datetime-local" value={form.eventStartsAt} onChange={(e) => setForm({ ...form, eventStartsAt: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Fim do evento<input type="datetime-local" value={form.eventEndsAt} onChange={(e) => setForm({ ...form, eventEndsAt: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Texto do botão<input maxLength={120} value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-label-caps text-on-surface-variant">Destino do botão<input type="url" value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} placeholder="https://…" className={`${inputClass} mt-1.5`} /></label>
            </div>
            <label className="block text-xs font-label-caps text-on-surface-variant">Resumo<textarea maxLength={5000} rows={4} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={`${inputClass} mt-1.5 resize-y`} /></label>
            <button type="submit" disabled={busy === 'save'} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-5 text-xs font-bold text-background disabled:opacity-50"><Check size={16} aria-hidden="true" />{busy === 'save' ? 'Salvando…' : editing ? 'Salvar alterações' : 'Publicar agora'}</button>
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
