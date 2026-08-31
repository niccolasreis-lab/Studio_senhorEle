import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { youtubeId } from '../src/components/StudioDiary';

const service = readFileSync(resolve('src/services/studioUpdateService.ts'), 'utf8');
const admin = readFileSync(resolve('src/components/DiaryAdminPanel.tsx'), 'utf8');
const publicDiary = readFileSync(resolve('src/components/StudioDiary.tsx'), 'utf8');
const navigation = readFileSync(resolve('src/components/Navigation.tsx'), 'utf8');
const languageSwitcher = readFileSync(resolve('src/components/LanguageSwitcher.tsx'), 'utf8');

describe('automatic Studio Diary workflow', () => {
  it('publishes manual entries immediately and paginates database reads', () => {
    expect(service).toContain("editorialStatus: 'published'");
    expect(service).toContain('.range(range.from, range.to)');
    expect(service).toContain(".gte('featured_until', now)");
    expect(service).toContain('featured_until.is.null,featured_until.lt.');
  });

  it('keeps the manual form collapsed and removes queue-first copy', () => {
    expect(admin).toContain('const [editorOpen, setEditorOpen] = useState(false)');
    expect(admin).toContain('aria-controls="diary-editor"');
    expect(admin).toContain("'Publicar agora'");
    expect(admin).not.toContain('Adicionar à fila');
    expect(admin).not.toContain('Fila editorial');
  });

  it('exposes recoverable errors and accessible archive disclosure', () => {
    expect(publicDiary).toContain('aria-controls="diary-archive"');
    expect(publicDiary).toContain('t.diary.retry');
    expect(publicDiary).toContain('playerRef.current?.focus()');
  });

  it('always renders diary dates with the Gregorian calendar', () => {
    expect(publicDiary.match(/calendar: 'gregory'/g)).toHaveLength(2);
    expect(admin).toContain("toLocaleString('pt-BR', { calendar: 'gregory' })");
  });
});

describe('YouTube URL validation', () => {
  it('accepts official video and Shorts URLs', () => {
    expect(youtubeId('https://www.youtube.com/watch?v=zpCgm9P83Iw')).toBe('zpCgm9P83Iw');
    expect(youtubeId('https://youtube.com/shorts/zpCgm9P83Iw')).toBe('zpCgm9P83Iw');
    expect(youtubeId('https://youtu.be/zpCgm9P83Iw')).toBe('zpCgm9P83Iw');
  });

  it('rejects lookalike hosts and malformed IDs', () => {
    expect(youtubeId('https://example.com/watch?v=zpCgm9P83Iw')).toBeNull();
    expect(youtubeId('https://youtube.com.evil.test/watch?v=zpCgm9P83Iw')).toBeNull();
    expect(youtubeId('https://youtube.com/watch?v=short')).toBeNull();
  });
});

describe('distilled navigation', () => {
  it('groups institutional links and uses compact language selection', () => {
    expect(navigation).toContain('aria-controls="studio-navigation-menu"');
    expect(navigation).toContain('{t.nav.studio}');
    expect(languageSwitcher).toContain('{language.toUpperCase()}');
    expect(languageSwitcher).not.toContain('🇧🇷');
  });
});
