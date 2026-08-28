import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronRight, ExternalLink, Instagram, Play, RefreshCw, Share2, Youtube } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { StudioUpdate, StudioUpdateService } from '../services/studioUpdateService';
import { buildShareUrl } from '../utils/share';

const PAGE_SIZE = 6;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

export function youtubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase())) return null;
    const candidate = parsed.hostname.toLowerCase() === 'youtu.be'
      ? parsed.pathname.split('/')[1]
      : parsed.pathname.startsWith('/shorts/')
        ? parsed.pathname.split('/')[2]
        : parsed.searchParams.get('v');
    return candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

function DiaryMedia({ update, playLabel }: { update: StudioUpdate; playLabel: string }) {
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const videoId = youtubeId(update.canonicalUrl);
  const aspect = update.displayAspect || (update.contentType === 'reel' ? 'portrait' : 'landscape');
  const frameClass = aspect === 'portrait'
    ? 'aspect-[9/16] max-h-[72vh] max-w-[25rem] mx-auto'
    : aspect === 'square'
      ? 'aspect-square max-w-[38rem] mx-auto'
      : 'aspect-video w-full';

  useEffect(() => {
    if (playing) playerRef.current?.focus();
  }, [playing]);

  if (playing && videoId) {
    return (
      <div className={`${frameClass} overflow-hidden rounded-[14px] bg-surface-container-lowest`}>
        <iframe
          ref={playerRef}
          tabIndex={0}
          className="h-full w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
          title={update.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`${frameClass} relative overflow-hidden rounded-[14px] bg-surface-container`}>
      {update.thumbnailUrl ? (
        <img
          src={update.thumbnailUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className={`h-full w-full ${aspect === 'portrait' ? 'object-contain' : 'object-cover'}`}
        />
      ) : (
        <div className="grid h-full min-h-56 place-items-center text-secondary/70" aria-hidden="true">
          {update.platform === 'youtube' ? <Youtube size={42} strokeWidth={1.4} /> : <CalendarDays size={42} strokeWidth={1.4} />}
        </div>
      )}
      {videoId && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 grid cursor-pointer place-items-center bg-background/20 transition-colors hover:bg-background/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          aria-label={`${playLabel}: ${update.title}`}
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-parchment text-background shadow-[0_12px_34px_rgba(8,12,9,0.45)] transition-transform hover:scale-105 motion-reduce:transform-none">
            <Play className="ml-1" fill="currentColor" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}

export default function StudioDiary() {
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const featuredListRef = useRef<HTMLDivElement>(null);
  const archiveListRef = useRef<HTMLDivElement>(null);
  const focusFeaturedAfterLoad = useRef(false);
  const focusArchiveAfterLoad = useRef(false);
  const [featured, setFeatured] = useState<StudioUpdate[]>([]);
  const [featuredTotal, setFeaturedTotal] = useState(0);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(false);
  const [archived, setArchived] = useState<StudioUpdate[]>([]);
  const [archivedTotal, setArchivedTotal] = useState(0);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [archiveError, setArchiveError] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archivePage, setArchivePage] = useState(1);
  const [deepLinkedUpdate, setDeepLinkedUpdate] = useState<StudioUpdate | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const deepLinkedShareId = useMemo(() => new URLSearchParams(window.location.search).get('d'), []);
  const locale = language === 'pt' ? 'pt-BR' : language === 'de' ? 'de-DE' : 'en-US';

  const loadFeatured = useCallback(async (page: number) => {
    setFeaturedLoading(true);
    setFeaturedError(false);
    try {
      const result = await StudioUpdateService.fetchFeaturedPage(page, PAGE_SIZE);
      setFeatured(result.items);
      setFeaturedTotal(result.total);
      if (focusFeaturedAfterLoad.current) {
        focusFeaturedAfterLoad.current = false;
        window.requestAnimationFrame(() => featuredListRef.current?.focus());
      }
    } catch {
      setFeaturedError(true);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  const loadArchive = useCallback(async (page: number) => {
    setArchiveLoading(true);
    setArchiveError(false);
    try {
      const result = await StudioUpdateService.fetchArchivePage(page, PAGE_SIZE);
      setArchived(result.items);
      setArchivedTotal(result.total);
      if (focusArchiveAfterLoad.current) {
        focusArchiveAfterLoad.current = false;
        window.requestAnimationFrame(() => archiveListRef.current?.focus());
      }
    } catch {
      setArchiveError(true);
    } finally {
      setArchiveLoading(false);
    }
  }, []);

  useEffect(() => { void loadFeatured(featuredPage); }, [featuredPage, loadFeatured]);
  useEffect(() => { void loadArchive(archivePage); }, [archivePage, loadArchive]);

  useEffect(() => {
    if (!deepLinkedShareId) return;
    let active = true;
    StudioUpdateService.fetchPublishedByShareId(deepLinkedShareId)
      .then((item) => {
        if (!active || !item) return;
        setDeepLinkedUpdate(item);
        const isArchived = !item.featuredUntil || new Date(item.featuredUntil).getTime() < Date.now();
        if (isArchived) setArchiveOpen(true);
        window.setTimeout(() => {
          document.getElementById(`diary-${item.shareId}`)?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'center' });
        }, 100);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [deepLinkedShareId, shouldReduceMotion]);

  const share = async (update: StudioUpdate) => {
    const url = buildShareUrl(update.shareId);
    try {
      if (navigator.share) await navigator.share({ title: update.title, text: update.summary, url });
      else await navigator.clipboard.writeText(url);
      setCopiedId(update.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch (cause) {
      if ((cause as DOMException)?.name !== 'AbortError') window.open(`https://wa.me/?text=${encodeURIComponent(`${update.title} ${url}`)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const card = (update: StudioUpdate, index: number) => {
    const isPartner = update.editorialRole === 'partner';
    const sourceLabel = isPartner
      ? `${t.diary.recommendation} · ${update.authorName}`
      : update.platform === 'instagram' ? 'Instagram · Studio SenhorEle'
        : update.platform === 'youtube' ? 'YouTube · Studio SenhorEle' : t.diary.manual;
    return (
      <motion.article
        key={update.id}
        id={`diary-${update.shareId}`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.2) }}
        className="grid min-w-0 gap-6 border-t border-surface-variant/35 py-8 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(18rem,1.1fr)] lg:items-center lg:gap-10"
      >
        <DiaryMedia update={update} playLabel={t.diary.playVideo} />
        <div className="min-w-0 max-w-[68ch]">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-label-caps uppercase tracking-[0.1em] text-secondary">
            {update.platform === 'instagram' ? <Instagram size={15} aria-hidden="true" /> : update.platform === 'youtube' ? <Youtube size={16} aria-hidden="true" /> : <CalendarDays size={15} aria-hidden="true" />}
            <span>{sourceLabel}</span>
            <span aria-hidden="true" className="text-surface-variant">/</span>
            <time dateTime={update.publishedAt}>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(update.publishedAt))}</time>
          </div>
          <h3 className="mt-4 break-words text-balance font-headline-lg text-2xl leading-tight text-parchment md:text-3xl">{update.title}</h3>
          {update.summary && <p className="mt-4 whitespace-pre-line break-words font-body-md text-base leading-relaxed text-on-surface-variant">{update.summary}</p>}
          {(update.eventStartsAt || update.location) && (
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-parchment/85">
              {update.eventStartsAt && <time dateTime={update.eventStartsAt}>{new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(update.eventStartsAt))}</time>}
              {update.location && <span className="break-words">{update.location}</span>}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {(update.ctaUrl || update.canonicalUrl) && (
              <a href={update.ctaUrl || update.canonicalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-background transition-colors hover:bg-amber-glow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
                {update.ctaLabel || t.diary.openOriginal}<ExternalLink size={15} aria-hidden="true" />
              </a>
            )}
            <button type="button" onClick={() => share(update)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2.5 text-xs font-bold text-parchment transition-colors hover:bg-surface-container-highest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
              <Share2 size={15} aria-hidden="true" />{copiedId === update.id ? t.diary.copied : t.diary.share}
            </button>
          </div>
        </div>
      </motion.article>
    );
  };

  const featuredPages = Math.max(1, Math.ceil(featuredTotal / PAGE_SIZE));
  const archivePages = Math.max(1, Math.ceil(archivedTotal / PAGE_SIZE));
  const deepLinkedIsArchived = deepLinkedUpdate && (!deepLinkedUpdate.featuredUntil || new Date(deepLinkedUpdate.featuredUntil).getTime() < Date.now());
  const visibleFeatured = deepLinkedUpdate && !deepLinkedIsArchived && !featured.some((item) => item.id === deepLinkedUpdate.id)
    ? [deepLinkedUpdate, ...featured]
    : featured;
  const visibleArchive = deepLinkedUpdate && deepLinkedIsArchived && !archived.some((item) => item.id === deepLinkedUpdate.id)
    ? [deepLinkedUpdate, ...archived]
    : archived;

  const pagination = (page: number, pages: number, onChange: (page: number) => void, label: string) => pages > 1 && (
    <nav aria-label={label} className="flex items-center justify-center gap-3 pt-6">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="min-h-11 rounded-xl px-4 text-sm text-parchment disabled:opacity-35">{t.diary.previous}</button>
      <span className="text-sm tabular-nums text-on-surface-variant" aria-live="polite">{page} / {pages}</span>
      <button type="button" disabled={page === pages} onClick={() => onChange(page + 1)} className="min-h-11 rounded-xl px-4 text-sm text-parchment disabled:opacity-35">{t.diary.next}</button>
    </nav>
  );

  return (
    <section id="diario" aria-labelledby="diary-title" className="scroll-mt-24 bg-surface-container-lowest/55 px-margin-mobile py-20 md:px-margin-desktop lg:py-section-gap">
      <div className="mx-auto max-w-[1280px]">
        <header className="max-w-[72ch]">
          <h2 id="diary-title" className="text-balance font-headline-lg text-headline-lg-mobile text-parchment md:text-headline-lg">{t.diary.title}</h2>
          <p className="mt-5 font-body-lg text-base leading-relaxed text-on-surface-variant md:text-lg">{t.diary.description}</p>
        </header>

        <div ref={featuredListRef} tabIndex={-1} className="mt-10 outline-none" aria-busy={featuredLoading} aria-live="polite">
          {featuredLoading && <p role="status" className="py-14 text-center text-on-surface-variant">{t.diary.loading}</p>}
          {featuredError && (
            <div role="alert" className="border-t border-surface-variant/35 py-14 text-center text-rose-300">
              <p>{t.diary.error}</p>
              <button type="button" onClick={() => loadFeatured(featuredPage)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-surface-container-high px-4 text-sm text-parchment"><RefreshCw size={15} aria-hidden="true" />{t.diary.retry}</button>
            </div>
          )}
          {!featuredLoading && !featuredError && visibleFeatured.length === 0 && <p className="border-t border-surface-variant/35 py-14 text-on-surface-variant">{t.diary.empty}</p>}
          {!featuredLoading && !featuredError && visibleFeatured.map(card)}
          {!featuredLoading && !featuredError && pagination(featuredPage, featuredPages, (next) => { focusFeaturedAfterLoad.current = true; setFeaturedPage(next); }, t.diary.featuredPagination)}
        </div>

        {!archiveLoading && (archivedTotal > 0 || archiveError) && (
          <div className="mt-6 border-t border-surface-variant/35 pt-8">
            <button type="button" onClick={() => setArchiveOpen((value) => !value)} aria-expanded={archiveOpen} aria-controls="diary-archive" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-surface-container-high px-5 py-3 text-xs font-bold text-parchment focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
              {archiveOpen ? t.diary.hideArchive : t.diary.viewArchive}
              <ChevronRight className={`transition-transform ${archiveOpen ? 'rotate-90' : ''}`} size={16} aria-hidden="true" />
            </button>
            {archiveOpen && (
              <div id="diary-archive" ref={archiveListRef} tabIndex={-1} className="mt-5 outline-none" aria-busy={archiveLoading}>
                {archiveError ? (
                  <div role="alert" className="py-10 text-center text-rose-300">
                    <p>{t.diary.error}</p>
                    <button type="button" onClick={() => loadArchive(archivePage)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-surface-container-high px-4 text-sm text-parchment"><RefreshCw size={15} aria-hidden="true" />{t.diary.retry}</button>
                  </div>
                ) : visibleArchive.map(card)}
                {!archiveError && pagination(archivePage, archivePages, (next) => { focusArchiveAfterLoad.current = true; setArchivePage(next); }, t.diary.archivePagination)}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
