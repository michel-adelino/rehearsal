import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, color } = body as { name?: string; color?: string };
  const data: { name?: string; color?: string } = {};
  if (name !== undefined) data.name = name;
  if (color !== undefined) data.color = color;
  const updated = await prisma.level.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.level.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

