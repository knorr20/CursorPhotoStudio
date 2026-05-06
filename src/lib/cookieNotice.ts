export type CookieNoticeChoice = 'all' | 'essential' | 'dismissed';

const STORAGE_KEY = 'studio_cookie_notice_v2';

export function loadCookieNotice(): CookieNoticeChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'all' || raw === 'essential' || raw === 'dismissed') return raw;
    return null;
  } catch {
    return null;
  }
}

export function saveCookieNotice(choice: CookieNoticeChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* ignore */
  }
}
