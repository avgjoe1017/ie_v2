import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import type { Role } from '@/domain/contracts';

const SESSION_COOKIE = 'ie-session';
const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  name: string;
  role: Role;
  exp?: number;
}

/**
 * Creates a session token for a user
 */
export async function createSession(user: { id: string; name: string; role: Role }): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_EXPIRY}s`)
    .setIssuedAt()
    .sign(getSecretKey());

  return token;
}

/**
 * Verifies and decodes a session token
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Gets the current session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!token) {
    return null;
  }
  
  return verifySession(token);
}

/**
 * Sets the session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY,
    path: '/',
  });
}

/**
 * Clears the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Validates a PIN and returns the user if valid
 */
export async function validatePin(pin: string) {
  // Get all users and check PIN
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const isValid = await bcrypt.compare(pin, user.pinHash);
    if (isValid) {
      return user;
    }
  }
  
  return null;
}

/**
 * Hashes a PIN for storage
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

/**
 * Requires authentication and returns the session
 * Throws if not authenticated
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Requires admin role
 * Throws if not authenticated or not admin
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return session;
}

