/**
 * Client-side auth rate limiting with exponential backoff.
 * Prevents brute-force login attempts by tracking failure counts per email.
 */

const ATTEMPT_KEY_PREFIX = 'auth_attempts_';
const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 30_000; // 30 seconds

interface AttemptRecord {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}

function getKey(email: string): string {
  return ATTEMPT_KEY_PREFIX + email.toLowerCase().trim();
}

function getRecord(email: string): AttemptRecord {
  try {
    const raw = globalThis.localStorage?.getItem(getKey(email));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, lastAttempt: 0, lockedUntil: 0 };
}

function saveRecord(email: string, record: AttemptRecord): void {
  try {
    globalThis.localStorage?.setItem(getKey(email), JSON.stringify(record));
  } catch {}
}

export function isRateLimited(email: string): { limited: boolean; retryAfterMs: number } {
  const record = getRecord(email);
  const now = Date.now();

  if (record.lockedUntil > now) {
    return { limited: true, retryAfterMs: record.lockedUntil - now };
  }

  // Reset stale record (no attempt in last 10 minutes = fresh start)
  if (now - record.lastAttempt > 10 * 60 * 1000) {
    saveRecord(email, { count: 0, lastAttempt: 0, lockedUntil: 0 });
    return { limited: false, retryAfterMs: 0 };
  }

  return { limited: false, retryAfterMs: 0 };
}

export function recordFailedAttempt(email: string): { limited: boolean; retryAfterMs: number } {
  const record = getRecord(email);
  const now = Date.now();
  const newCount = record.count + 1;

  let lockedUntil = 0;
  if (newCount >= MAX_ATTEMPTS) {
    // Exponential backoff: 30s, 60s, 120s, ...
    const multiplier = Math.pow(2, newCount - MAX_ATTEMPTS);
    const lockoutMs = BASE_LOCKOUT_MS * multiplier;
    lockedUntil = now + lockoutMs;
  }

  saveRecord(email, { count: newCount, lastAttempt: now, lockedUntil });

  if (lockedUntil > 0) {
    return { limited: true, retryAfterMs: lockedUntil - now };
  }
  return { limited: false, retryAfterMs: 0 };
}

export function clearAttempts(email: string): void {
  try {
    globalThis.localStorage?.removeItem(getKey(email));
  } catch {}
}

export function formatLockoutMessage(retryAfterMs: number): string {
  const seconds = Math.ceil(retryAfterMs / 1000);
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `บัญชีถูกล็อกชั่วคราว กรุณารอ ${minutes} นาที`;
  }
  return `พยายามเข้าสู่ระบบมากเกินไป กรุณารอ ${seconds} วินาที`;
}
