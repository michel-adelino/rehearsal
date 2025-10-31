import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const levels = await prisma.level.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(levels);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name } = body as { name: string };
  if (!name || name.trim() === '') {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }
  const level = await prisma.level.create({ data: { name: name.trim() } });
  return NextResponse.json(level, { status: 201 });
}

