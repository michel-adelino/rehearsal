import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
