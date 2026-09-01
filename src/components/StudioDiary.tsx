import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronRight, ExternalLink, Instagram, Play, RefreshCw, Share2, Youtube } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { DisplayAspect, SocialSource, StudioUpdate, StudioUpdateService } from '../services/studioUpdateService';
import { buildShareUrl } from '../utils/share';
import PostMediaLayout from './PostMediaLayout';

const PAGE_SIZE = 6;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const PORTRAIT_YOUTUBE_IDS = new Set(['zpCgm9P83Iw', 'zM4Xta25FZk', 'WRqgdPP1GwY', 't70DJ_HYyEM', 'dl3WJcEyr0Q']);

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

export function resolveDisplayAspect(update: Pick<StudioUpdate, 'id' | 'canonicalUrl' | 'displayAspect' | 'contentType'>, detected?: DisplayAspect): DisplayAspect {
  const canonicalVideoId = youtubeId(update.canonicalUrl);
  if (canonicalVideoId && PORTRAIT_YOUTUBE_IDS.has(canonicalVideoId)) return 'portrait';
  return detected || update.displayAspect || (update.contentType === 'reel' ? 'portrait' : 'landscape');
}

function parseSummary(text: string) {
  if (!text) return { paragraphs: [], tags: [] };
  const tagRegex = /(#[a-zA-Z0-9_áàâãéèêíóôõúçÁÀÂÃÉÈÊÍÓÔÕÚÇ-]+)/g;
  const rawTags = text.match(tagRegex) || [];
  const tags = Array.from(new Set(rawTags.map((t) => t.trim())));
  const cleanText = text.replace(tagRegex, '').replace(/[\r\n]{3,}/g, '\n\n').trim();
  const paragraphs = cleanText.split(/\n\s*\n/).filter(Boolean);
  return { paragraphs, tags };
}

const normalizeSourceIdentity = (value: string) => value.trim().replace(/^@/, '').toLowerCase();

export function resolveSocialSource(
  update: Pick<StudioUpdate, 'sourceId' | 'platform' | 'authorName'>,
  sources: SocialSource[],
): SocialSource | undefined {
  if (update.sourceId !== undefined) {
    const exactSource = sources.find((source) => source.id === update.sourceId);
    if (exactSource) return exactSource;
  }

  const authorIdentity = normalizeSourceIdentity(update.authorName);
  return sources.find((source) => source.platform === update.platform && (
    normalizeSourceIdentity(source.displayName) === authorIdentity
    || normalizeSourceIdentity(source.handle) === authorIdentity
  ));
}

interface DiaryMediaProps {
  update: StudioUpdate;
  aspect: DisplayAspect;
  playLabel: string;
  isPreviewActive: boolean;
  onHoverStart: (id: number) => void;
  onHoverEnd: (id: number) => void;
  onAspectDetected: (id: number, aspect: DisplayAspect) => void;
}

function DiaryMedia({ update, aspect, playLabel, isPreviewActive, onHoverStart, onHoverEnd, onAspectDetected }: DiaryMediaProps) {
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoId = youtubeId(update.canonicalUrl);
  const shouldReduceMotion = useReducedMotion();

  const frameClass = aspect === 'portrait'
    ? 'aspect-[9/16] w-full max-w-[25rem] mx-auto rounded-2xl'
    : aspect === 'square'
      ? 'aspect-square max-w-[42rem] mx-auto rounded-2xl'
      : 'aspect-video w-full max-w-[68.75rem] mx-auto rounded-2xl';

  const detectImageAspect = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (videoId || !['image', 'carousel'].includes(update.contentType)) return;
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = naturalWidth / naturalHeight;
    const detected: DisplayAspect = ratio < 0.9 ? 'portrait' : ratio > 1.1 ? 'landscape' : 'square';
    onAspectDetected(update.id, detected);
  };

  useEffect(() => {
    if (playing) playerRef.current?.focus();
  }, [playing]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (playing || shouldReduceMotion || !videoId) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      onHoverStart(update.id);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (isPreviewActive) {
      onHoverEnd(update.id);
    }
  };

  if (playing && videoId) {
    return (
      <div className={`${frameClass} overflow-hidden bg-surface-container-lowest border border-secondary/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)]`}>
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
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${frameClass} group relative overflow-hidden bg-surface-container border transition-all duration-300 ${
        isPreviewActive
          ? 'border-secondary/60 shadow-[0_20px_50px_rgba(230,175,46,0.2)] scale-[1.005]'
          : 'border-surface-variant/40 shadow-[0_16px_40px_rgba(0,0,0,0.5)] hover:border-secondary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
      }`}
    >
      {/* HOVER PREVIEW LAYER */}
      {isPreviewActive && videoId && (
        <div className="absolute inset-0 z-0 bg-surface-container-lowest transition-opacity duration-300">
          <iframe
            className="h-full w-full pointer-events-none"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${encodeURIComponent(videoId)}&enablejsapi=1&rel=0&playsinline=1`}
            title={`${update.title} - Preview`}
            allow="autoplay; encrypted-media"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      )}

      {/* STATIC THUMBNAIL LAYER */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          isPreviewActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {update.thumbnailUrl ? (
          <img
            src={update.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={detectImageAspect}
            className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.02] ${
              aspect === 'portrait' && update.platform !== 'youtube' ? 'object-contain' : 'object-cover'
            }`}
          />
        ) : (
          <div className="grid h-full min-h-64 place-items-center text-secondary/70 bg-surface-container-high/30" aria-hidden="true">
            {update.platform === 'youtube' ? <Youtube size={56} strokeWidth={1.2} /> : <CalendarDays size={56} strokeWidth={1.2} />}
          </div>
        )}
      </div>

      {/* PLAY BUTTON OVERLAY */}
      {videoId && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className={`absolute inset-0 z-10 grid cursor-pointer place-items-center transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary ${
            isPreviewActive ? 'bg-transparent hover:bg-transparent' : 'bg-background/30 hover:bg-background/40'
          }`}
          aria-label={`${playLabel}: ${update.title}`}
        >
          <div
            aria-hidden="true"
            className={`flex flex-col items-center gap-3 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
              isPreviewActive ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-secondary text-background shadow-[0_0_35px_rgba(230,175,46,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-glow motion-reduce:transform-none">
              <Play className="ml-1.5 h-8 w-8" fill="currentColor" aria-hidden="true" />
            </span>
            <span className="font-label-caps text-xs font-bold uppercase tracking-widest text-parchment drop-shadow-md bg-background/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-secondary/30">
              {playLabel}
            </span>
          </div>
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
  const [sources, setSources] = useState<SocialSource[]>([]);
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
  const [activeHoverPreviewId, setActiveHoverPreviewId] = useState<number | null>(null);
  const [detectedAspects, setDetectedAspects] = useState<Record<number, DisplayAspect>>({});
  const deepLinkedShareId = useMemo(() => new URLSearchParams(window.location.search).get('d'), []);
  const locale = language === 'pt' ? 'pt-BR' : language === 'de' ? 'de-DE' : 'en-US';

  const handleHoverStart = useCallback((id: number) => {
    setActiveHoverPreviewId(id);
  }, []);

  const handleHoverEnd = useCallback((id: number) => {
    setActiveHoverPreviewId((current) => (current === id ? null : current));
  }, []);

  const handleAspectDetected = useCallback((id: number, aspect: DisplayAspect) => {
    setDetectedAspects((current) => (current[id] === aspect ? current : { ...current, [id]: aspect }));
  }, []);

  useEffect(() => {
    let active = true;
    StudioUpdateService.fetchSources()
      .then((data) => { if (active) setSources(data); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

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

    const { paragraphs, tags } = parseSummary(update.summary);
    const sourceMeta = resolveSocialSource(update, sources);

    const authorAvatar = sourceMeta?.avatarUrl;
    const authorDesc = sourceMeta?.description || (isPartner ? t.diary.partnerFallbackDescription : undefined);
    const channelUrl = sourceMeta?.publicUrl || update.ctaUrl || update.canonicalUrl;
    const originalUrl = update.ctaUrl || update.canonicalUrl;
    const aspect = resolveDisplayAspect(update, detectedAspects[update.id]);
    const publishedDate = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      calendar: 'gregory',
    }).format(new Date(update.publishedAt));

    const media = (
      <DiaryMedia
        update={update}
        aspect={aspect}
        playLabel={t.diary.playVideo}
        isPreviewActive={activeHoverPreviewId === update.id}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        onAspectDetected={handleAspectDetected}
      />
    );

    const author = (
      <div className="flex items-center gap-3.5 border-b border-surface-variant/35 pb-5">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={update.authorName}
            className="h-11 w-11 rounded-full border border-secondary/40 object-cover shadow-sm"
          />
        ) : (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-secondary/30 bg-secondary/10 text-secondary">
            {update.platform === 'youtube' ? <Youtube size={20} /> : update.platform === 'instagram' ? <Instagram size={20} /> : <CalendarDays size={20} />}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="truncate text-base font-bold leading-snug text-parchment">{update.authorName}</h4>
          <p className="truncate text-xs text-on-surface-variant">
            {sourceMeta?.handle || (isPartner ? t.diary.channelPartner : sourceLabel)}
          </p>
        </div>
      </div>
    );

    const summary = (paragraphs.length > 0 || update.summary) ? (
      <div>
        <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.16em] text-secondary/85">
          {t.diary.captionTitle}
        </span>
        {paragraphs.length > 0 ? (
          <div className="max-w-[65ch] space-y-4 font-body-lg text-base leading-relaxed text-parchment/90 md:text-lg">
            {paragraphs.map((paragraph, pIdx) => (
              <p key={pIdx} className="whitespace-pre-line break-words">{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className="max-w-[65ch] whitespace-pre-line break-words font-body-lg text-base leading-relaxed text-parchment/90 md:text-lg">
            {update.summary}
          </p>
        )}
      </div>
    ) : null;

    const metadata = (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-label-caps uppercase tracking-[0.12em] text-on-surface-variant">
        <time dateTime={update.publishedAt}>{publishedDate}</time>
        <span aria-hidden="true" className="text-secondary/55">•</span>
        <span>{update.platform}</span>
        <span aria-hidden="true" className="text-secondary/55">•</span>
        <span>{t.diary.contentTypes[update.contentType]}</span>
        {update.location && (
          <>
            <span aria-hidden="true" className="text-secondary/55">•</span>
            <span>{update.location}</span>
          </>
        )}
      </div>
    );

    const eventDetails = update.eventStartsAt ? (
      <div className="flex items-center gap-3 border-l-2 border-secondary/45 pl-4 text-sm text-parchment/90">
        <CalendarDays className="shrink-0 text-secondary" size={19} />
        <time dateTime={update.eventStartsAt}>
          {new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short', calendar: 'gregory' }).format(new Date(update.eventStartsAt))}
        </time>
      </div>
    ) : null;

    const tagList = tags.length > 0 ? (
      <div>
        <span className="mb-2.5 block text-[11px] font-bold uppercase tracking-wider text-secondary/80">
          {t.diary.hashtagsTitle}
        </span>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {tags.map((tag) => (
            <span key={tag} className="text-xs font-mono tracking-tight text-secondary">
              {tag}
            </span>
          ))}
        </div>
      </div>
    ) : null;

    const actions = (
      <div className="flex flex-wrap gap-2.5">
        {channelUrl && (
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-secondary/30 px-4 py-2.5 text-xs font-bold text-parchment transition-colors hover:bg-secondary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            {update.platform === 'youtube' ? <Youtube size={15} aria-hidden="true" /> : update.platform === 'instagram' ? <Instagram size={15} aria-hidden="true" /> : <ExternalLink size={15} aria-hidden="true" />}
            {update.platform === 'youtube' ? 'YouTube' : update.platform === 'instagram' ? 'Instagram' : t.diary.openOriginal}
          </a>
        )}
        {originalUrl && originalUrl !== channelUrl && (
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-secondary/30 px-4 py-2.5 text-xs font-bold text-parchment transition-colors hover:bg-secondary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            {update.ctaLabel || t.diary.openOriginal}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        )}
        <button
          type="button"
          onClick={() => share(update)}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-surface-container-high px-4 py-2.5 text-xs font-bold text-parchment transition-colors hover:bg-surface-container-highest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
        >
          <Share2 size={15} aria-hidden="true" />
          {copiedId === update.id ? t.diary.copied : t.diary.share}
        </button>
      </div>
    );

    return (
      <motion.article
        key={update.id}
        id={`diary-${update.shareId}`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.2) }}
        className="border-t border-surface-variant/35 py-10 lg:py-14 first:border-t-0 first:pt-4"
      >
        {/* HEADER EDITORIAL (LARGURA TOTAL) */}
        <header className="mb-5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-label-caps uppercase tracking-[0.12em] text-secondary">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 border border-secondary/25 px-3 py-1 text-secondary font-bold">
              {update.platform === 'instagram' ? <Instagram size={14} aria-hidden="true" /> : update.platform === 'youtube' ? <Youtube size={14} aria-hidden="true" /> : <CalendarDays size={14} aria-hidden="true" />}
              <span>{sourceLabel}</span>
            </span>
            <span aria-hidden="true" className="text-surface-variant">/</span>
            <time dateTime={update.publishedAt} className="text-on-surface-variant font-medium">
              {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', calendar: 'gregory' }).format(new Date(update.publishedAt))}
            </time>
            {update.location && (
              <>
                <span aria-hidden="true" className="text-surface-variant">/</span>
                <span className="text-on-surface-variant break-words">{update.location}</span>
              </>
            )}
          </div>

          <h3 className="mt-4 max-w-[900px] break-words text-balance font-headline-lg text-[clamp(1.75rem,3vw,2.875rem)] font-bold leading-[1.02] text-parchment tracking-tight">
            {update.title}
          </h3>
        </header>

        <PostMediaLayout
          orientation={aspect}
          media={media}
          portraitDetails={(
            <div className="space-y-5">
              {author}
              {summary}
              {metadata}
              {eventDetails}
              {tagList}
              {actions}
              {authorDesc && <p className="max-w-[65ch] text-xs leading-relaxed text-on-surface-variant">{authorDesc}</p>}
            </div>
          )}
          landscapeContent={(
            <div className="space-y-6">
              {summary}
              {metadata}
              {eventDetails}
              {tagList}
            </div>
          )}
          landscapeAside={(
            <div className="space-y-5 lg:sticky lg:top-28">
              {author}
              {authorDesc && <p className="text-xs leading-relaxed text-on-surface-variant">{authorDesc}</p>}
              {actions}
            </div>
          )}
        />
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
    <nav aria-label={label} className="flex items-center justify-center gap-3 pt-8">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="min-h-11 rounded-xl px-4 text-sm text-parchment hover:bg-surface-container-high disabled:opacity-35 transition-colors">{t.diary.previous}</button>
      <span className="text-sm tabular-nums text-on-surface-variant font-medium" aria-live="polite">{page} / {pages}</span>
      <button type="button" disabled={page === pages} onClick={() => onChange(page + 1)} className="min-h-11 rounded-xl px-4 text-sm text-parchment hover:bg-surface-container-high disabled:opacity-35 transition-colors">{t.diary.next}</button>
    </nav>
  );

  return (
    <section id="diario" aria-labelledby="diary-title" className="scroll-mt-24 bg-surface-container-lowest/55 px-4 sm:px-6 py-20 md:px-margin-desktop lg:py-section-gap">
      <div className="mx-auto max-w-[1180px]">
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
          <div className="mt-8 border-t border-surface-variant/35 pt-10">
            <button type="button" onClick={() => setArchiveOpen((value) => !value)} aria-expanded={archiveOpen} aria-controls="diary-archive" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-surface-container-high px-5 py-3 text-xs font-bold text-parchment hover:bg-surface-container-highest transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
              {archiveOpen ? t.diary.hideArchive : t.diary.viewArchive}
              <ChevronRight className={`transition-transform ${archiveOpen ? 'rotate-90' : ''}`} size={16} aria-hidden="true" />
            </button>
            {archiveOpen && (
              <div id="diary-archive" ref={archiveListRef} tabIndex={-1} className="mt-6 outline-none" aria-busy={archiveLoading}>
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
