export const MODE_STORAGE_KEY = 'ki-pate-demo-mode';

const VALID_MODES = new Set(['full', 'lite', 'static']);

function normalizeMode(value) {
  return VALID_MODES.has(value) ? value : null;
}

function storedMode(session) {
  if (!session) return null;

  if (typeof session.getItem === 'function') {
    return normalizeMode(session.getItem(MODE_STORAGE_KEY));
  }

  return normalizeMode(session.mode ?? session.storedMode);
}

export function resolveMode(environment = {}, session, explicit) {
  if (environment.mediaError) {
    return { mode: 'static', reason: 'media-error', needsSaveDataConsent: false };
  }

  if (environment.reducedMotion) {
    return { mode: 'static', reason: 'reduced-motion', needsSaveDataConsent: false };
  }

  if (environment.animationOff) {
    return { mode: 'static', reason: 'animation-off', needsSaveDataConsent: false };
  }

  const requested = normalizeMode(explicit) ?? storedMode(session) ?? 'full';

  if (requested === 'static') {
    return {
      mode: 'static',
      reason: normalizeMode(explicit) ? 'explicit' : 'session',
      needsSaveDataConsent: false,
    };
  }

  if (environment.saveData && !environment.saveDataConsent) {
    return { mode: 'static', reason: 'save-data', needsSaveDataConsent: true };
  }

  return {
    mode: requested,
    reason: normalizeMode(explicit) ? 'explicit' : (storedMode(session) ? 'session' : 'default'),
    needsSaveDataConsent: false,
  };
}
