import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name } = body as { name?: string };
  const data: { name?: string } = {};
  if (name !== undefined) data.name = name;
  const updated = await prisma.level.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.level.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

