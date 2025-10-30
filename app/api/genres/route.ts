import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(genres);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, color } = body as { name: string; color: string };
  if (!name || name.trim() === '') {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }
  if (!color || color.trim() === '') {
    return NextResponse.json({ message: 'Color is required' }, { status: 400 });
  }
  const genre = await prisma.genre.create({ data: { name: name.trim(), color: color.trim() } });
  return NextResponse.json(genre, { status: 201 });
}


