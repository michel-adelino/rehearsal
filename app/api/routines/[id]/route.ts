import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const routine = await prisma.routine.findUnique({
    where: { id: params.id },
    include: { teacher: true, genre: true, level: true, dancers: true },
  });
  if (!routine) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(routine);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { songTitle, duration, notes, levelId, color, teacherId, genreId, dancerIds, isInactive } = body;

  const updateData: {
    songTitle?: string;
    duration?: number;
    notes?: string | null;
    levelId?: string | null;
    color?: string;
    teacherId?: string;
    genreId?: string;
    isInactive?: boolean;
    dancers?: { set: { id: string }[] };
  } = {};
  if (songTitle !== undefined) updateData.songTitle = songTitle;
  if (duration !== undefined) updateData.duration = duration;
  if (notes !== undefined) updateData.notes = notes;
  if (levelId !== undefined) updateData.levelId = levelId || null;
  if (color !== undefined) updateData.color = color;
  if (teacherId !== undefined) updateData.teacherId = teacherId;
  if (genreId !== undefined) updateData.genreId = genreId;
  if (isInactive !== undefined) updateData.isInactive = isInactive;
  if (Array.isArray(dancerIds)) {
    updateData.dancers = { set: dancerIds.map((id: string) => ({ id })) };
  }

  const routine = await prisma.routine.update({
    where: { id: params.id },
    data: updateData,
    include: { teacher: true, genre: true, level: true, dancers: true },
  });
  return NextResponse.json(routine);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.routine.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}


