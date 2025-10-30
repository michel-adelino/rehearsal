import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, email } = body as { name?: string; email?: string | null };
  const data: { name?: string; email?: string | null } = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  const updated = await prisma.teacher.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // If there are dependent routines, you may wish to prevent delete or cascade. For now, let it throw if FK fails.
  await prisma.teacher.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}


