import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const teachers = await prisma.teacher.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, email } = body as { name: string; email?: string | null };
  if (!name || name.trim() === '') {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }
  const teacher = await prisma.teacher.create({ data: { name: name.trim(), email: email ?? null } });
  return NextResponse.json(teacher, { status: 201 });
}


