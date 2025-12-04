import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthPayload;
    return decoded;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
}

export function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || null;
  return token;
}

export function verifyAdmin(decoded: AuthPayload | null): boolean {
  return decoded?.role === 'admin';
}

export function verifyAuth(decoded: AuthPayload | null): boolean {
  return decoded?.id !== null && decoded?.id !== undefined;
}
