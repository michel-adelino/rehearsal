import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

const SALT_ROUNDS = 10;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';
const SESSION_COOKIE_NAME = 'session_token';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session management
export async function createSession(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(SESSION_SECRET);
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
  
  return token;
}

export async function verifySession(token: string): Promise<{ userId: string } | null> {
  try {
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string };
  } catch (error) {
    return null;
  }
}

// Get session from request
export async function getSessionFromRequest(req: NextRequest): Promise<{ userId: string } | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySession(token);
}

// Get current user from request
export async function getCurrentUser(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
  });
  
  return user;
}

// Set session cookie
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

// Clear session cookie
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
}

// Require authentication helper
export async function requireAuth(req: NextRequest): Promise<{ userId: string; user: any }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return { userId: session.userId, user };
}
