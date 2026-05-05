export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export type ConsentPreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const CONSENT_STORAGE_KEY = 'studio_cookie_consent_v1';

export const getDefaultConsent = (): ConsentPreferences => ({
  essential: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
});

export const loadConsentPreferences = (): ConsentPreferences | null => {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

export const saveConsentPreferences = (next: ConsentPreferences): void => {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
};
