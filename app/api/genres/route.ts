import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(genres);
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body as { name: string };
  if (!name || name.trim() === '') {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }
  const genre = await prisma.genre.create({ data: { name: name.trim() } });
  return NextResponse.json(genre, { status: 201 });
}


