import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rooms = await prisma.room.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(rooms);
}


