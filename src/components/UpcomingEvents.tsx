import { useEffect, useRef, useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { StudioUpdateService, type StudioUpdatePage } from '../services/studioUpdateService';

export function EventDates({ start, end, format }: { start: string; end?: string; format: Intl.DateTimeFormat }) {
  return (
    <span>
      <time dateTime={start}>{format.format(new Date(start))}</time>
      {end && end !== start && <> – <time dateTime={end}>{format.format(new Date(end))}</time></>}
    </span>
  );
}

export default function UpcomingEvents({ dateFormat }: { dateFormat: Intl.DateTimeFormat }) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<StudioUpdatePage | null>(null);
  const [failed, setFailed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    let expiryTimer: number | undefined;
    setResult(null);
    setFailed(false);
    StudioUpdateService.fetchUpcomingEventsPage(page).then((data) => {
      if (!active) return;
      if (page > 1 && data.items.length === 0) {
        setPage(1);
        return;
      }
      setResult(data);
      const expiries = data.items.map((item) => Date.parse(item.eventEndsAt || item.eventStartsAt || ''));
      const nextExpiry = Math.min(...expiries);
      if (Number.isFinite(nextExpiry)) {
        const delay = Math.max(1, nextExpiry - Date.now() + 1);
        expiryTimer = window.setTimeout(() => setRevision((value) => value + 1), Math.min(delay, 2_147_483_647));
      }
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; window.clearTimeout(expiryTimer); };
  }, [page, revision]);

  const pages = result ? Math.ceil(result.total / result.pageSize) : 0;
  const buttonClass = 'min-h-11 rounded-xl px-4 text-sm text-parchment hover:bg-surface-container-high disabled:opacity-35 focus-visible:outline-secondary';
  const changePage = (next: number) => {
    headingRef.current?.focus();
    setPage(next);
  };

  return (
    <section aria-labelledby="upcoming-events-title" className="mt-10 rounded-2xl border border-secondary/30 bg-surface-container-low px-5 py-5 sm:px-7">
      <h3 id="upcoming-events-title" ref={headingRef} tabIndex={-1} className="flex scroll-mt-24 items-center gap-3 font-headline-md text-2xl text-parchment">
        <CalendarDays size={23} className="shrink-0 text-secondary" aria-hidden="true" />{t.diary.upcomingEvents}
      </h3>
      {failed ? (
        <div role="alert" className="mt-3 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
          {t.diary.eventsError}
          <button type="button" className={buttonClass} onClick={() => setRevision((value) => value + 1)}>{t.diary.retry}</button>
        </div>
      ) : !result ? (
        <p role="status" className="mt-3 text-sm text-on-surface-variant">{t.diary.eventsLoading}</p>
      ) : result.items.length === 0 ? (
        <p className="mt-3 text-base text-on-surface-variant">{t.diary.noUpcomingEvents}</p>
      ) : (
        <ul className="mt-4 divide-y divide-surface-variant/35 border-t border-surface-variant/35">
          {result.items.map((item) => (
            <li key={item.id} className="grid min-w-0 gap-1 py-4 sm:grid-cols-2 sm:items-center sm:gap-5">
              <div className="min-w-0">
                <a href={`/?d=${encodeURIComponent(item.shareId)}#diary-${encodeURIComponent(item.shareId)}`} className="inline-block min-h-11 max-w-full break-words py-2 font-headline-md text-xl text-parchment underline decoration-secondary/50 underline-offset-4 hover:text-secondary focus-visible:outline-secondary">{item.title}</a>
                {item.location && <p className="flex items-start gap-2 text-sm text-on-surface-variant"><MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="min-w-0 break-words">{item.location}</span></p>}
              </div>
              {item.eventStartsAt && <p className="text-sm font-medium text-secondary sm:text-right"><EventDates start={item.eventStartsAt} end={item.eventEndsAt} format={dateFormat} /></p>}
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <nav aria-labelledby="upcoming-events-title" className="flex items-center justify-center gap-3 border-t border-surface-variant/35 pt-3">
          <button type="button" className={buttonClass} disabled={page === 1} onClick={() => changePage(page - 1)}>{t.diary.previous}</button>
          <span className="text-sm tabular-nums text-on-surface-variant" aria-live="polite">{page} / {pages}</span>
          <button type="button" className={buttonClass} disabled={page === pages} onClick={() => changePage(page + 1)}>{t.diary.next}</button>
        </nav>
      )}
    </section>
  );
}
