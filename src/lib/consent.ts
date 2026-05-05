/**
 * Cookie notice preference — stored for UI / trust only.
 * Does not gate loading of scripts, widgets, or payments (see App.tsx).
 */

export type CookieNoticePreset = 'all' | 'essential' | 'dismissed';

export type CookieNoticeState = {
  preset: CookieNoticePreset;
  updatedAt: string;
};

const NOTICE_KEY = 'studio_cookie_notice_v1';
const LEGACY_CONSENT_KEY = 'studio_cookie_consent_v1';

export function loadCookieNotice(): CookieNoticeState | null {
  try {
    const raw = localStorage.getItem(NOTICE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CookieNoticeState>;
      if (
        parsed.preset &&
        ['all', 'essential', 'dismissed'].includes(parsed.preset) &&
        typeof parsed.updatedAt === 'string'
      ) {
        return {
          preset: parsed.preset as CookieNoticePreset,
          updatedAt: parsed.updatedAt,
        };
      }
    }

    const legacyRaw = localStorage.getItem(LEGACY_CONSENT_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw) as {
        analytics?: boolean;
        marketing?: boolean;
        updatedAt?: string;
      };
      const migrated: CookieNoticeState = {
        preset: parsed.analytics && parsed.marketing ? 'all' : 'essential',
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      };
      saveCookieNotice(migrated);
      localStorage.removeItem(LEGACY_CONSENT_KEY);
      return migrated;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveCookieNotice(next: CookieNoticeState): void {
  localStorage.setItem(NOTICE_KEY, JSON.stringify(next));
}
