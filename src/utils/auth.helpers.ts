import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export async function getCurrentSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;

  const expiresAt = session.expires_at;
  if (!expiresAt) return false;

  return expiresAt * 1000 > Date.now();
}

export async function refreshSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error('Error refreshing session:', error);
    return null;
  }

  return session;
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.access_token ?? null;
}

export function getSessionExpiryTime(session: Session | null): Date | null {
  if (!session?.expires_at) return null;
  return new Date(session.expires_at * 1000);
}

export function isSessionExpiringSoon(session: Session | null, minutesThreshold: number = 5): boolean {
  const expiryTime = getSessionExpiryTime(session);
  if (!expiryTime) return false;

  const now = new Date();
  const threshold = minutesThreshold * 60 * 1000;

  return expiryTime.getTime() - now.getTime() < threshold;
}
