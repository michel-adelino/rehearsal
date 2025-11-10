import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const levels = await prisma.level.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(levels);
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
  const level = await prisma.level.create({ data: { name: name.trim(), color: color.trim() } });
  return NextResponse.json(level, { status: 201 });
}

