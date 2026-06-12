import { timingSafeEqual } from 'crypto';
import { getSupabase } from './supabase';
import { audit } from './audit';
import type { NextRequest } from 'next/server';

// ─── Configuration ────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'maison2024';
const MAX_FAILED_ATTEMPTS = 10; // per IP per window
const RATE_WINDOW_MINUTES = 15;

// ─── IP extraction ────────────────────────────────────────────────────────────

export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

// ─── Timing-safe password comparison ─────────────────────────────────────────
// Prevents timing oracle attacks where response latency reveals password length
// or partial matches. Always performs the same number of operations regardless
// of where the comparison fails.

export function verifyPassword(token: string): boolean {
  if (!token || token.length === 0) return false;

  const expected = Buffer.from(ADMIN_PASSWORD, 'utf8');
  const provided = Buffer.from(token, 'utf8');

  // If lengths differ, do a dummy constant-time compare then return false.
  // Without this, an attacker could detect the correct password length via timing.
  if (provided.length !== expected.length) {
    const dummy = Buffer.alloc(expected.length, 0);
    timingSafeEqual(expected, dummy); // discard result, keep timing constant
    return false;
  }

  return timingSafeEqual(expected, provided);
}

// ─── Brute-force rate limiting ────────────────────────────────────────────────
// Uses audit_log table when Supabase is available (persistent across instances).
// Falls back to in-memory map for serverless instances without Supabase.

const memoryStore = new Map<string, { count: number; resetAt: number }>();

async function isBruteForceBlocked(ip: string): Promise<boolean> {
  const db = getSupabase();

  if (db) {
    const windowStart = new Date(
      Date.now() - RATE_WINDOW_MINUTES * 60 * 1000
    ).toISOString();

    const { count, error } = await db
      .from('audit_log')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'admin_login_failed')
      .eq('ip_address', ip)
      .gte('created_at', windowStart);

    if (error) return false; // Fail open — never lock out legitimate admins
    return (count ?? 0) >= MAX_FAILED_ATTEMPTS;
  }

  // In-memory fallback (resets on cold-start, better than nothing)
  const now = Date.now();
  const entry = memoryStore.get(ip);
  if (!entry || entry.resetAt < now) return false;
  return entry.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttemptInMemory(ip: string): void {
  const now = Date.now();
  const entry = memoryStore.get(ip);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(ip, {
      count: 1,
      resetAt: now + RATE_WINDOW_MINUTES * 60 * 1000,
    });
  } else {
    entry.count++;
  }
}

// ─── Main auth function ───────────────────────────────────────────────────────
// Returns { ok: true } on success, { ok: false, reason } on failure.
// Handles rate limiting, password verification, and audit logging in one call.

interface AuthResult {
  ok: boolean;
  ip: string;
  reason?: 'blocked' | 'invalid';
}

export async function authenticate(
  request: NextRequest,
  endpoint?: string
): Promise<AuthResult> {
  const ip = getClientIP(request);

  // 1. Rate limit check
  const blocked = await isBruteForceBlocked(ip);
  if (blocked) {
    // Log the block attempt itself (metadata distinguishes from normal failures)
    audit({
      action: 'admin_login_failed',
      request,
      metadata: { reason: 'rate_limited', endpoint },
    });
    return { ok: false, ip, reason: 'blocked' };
  }

  // 2. Extract and verify token
  const auth = request.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  const ok = verifyPassword(token);

  if (!ok) {
    // Record failure in memory fallback + audit log
    if (!getSupabase()) recordFailedAttemptInMemory(ip);
    audit({
      action: 'admin_login_failed',
      request,
      metadata: { reason: 'wrong_password', endpoint },
    });
    return { ok: false, ip, reason: 'invalid' };
  }

  // 3. Success — log successful login for audit trail
  audit({
    action: 'admin_login_success',
    request,
    metadata: { endpoint },
  });

  return { ok: true, ip };
}
