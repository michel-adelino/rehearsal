import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const routines = await prisma.routine.findMany({
    include: { teacher: true, genre: true, level: true, dancers: true },
    orderBy: { songTitle: 'asc' },
  });
  return NextResponse.json(routines);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    songTitle,
    duration,
    notes,
    levelId,
    color,
    teacherId,
    genreId,
    dancerIds = [],
    isInactive = false,
  } = body;

  // Create new routine (PATCH is used for updates)
  const routine = await prisma.routine.create({
    data: {
      songTitle,
      duration,
      notes,
      levelId: levelId || null,
      color,
      teacherId,
      genreId,
      isInactive,
      dancers: { connect: dancerIds.map((id: string) => ({ id })) },
    },
    include: { teacher: true, genre: true, level: true, dancers: true },
  });

  return NextResponse.json(routine, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const {
    id,
    songTitle,
    duration,
    notes,
    levelId,
    color,
    teacherId,
    genreId,
    dancerIds = [],
    isInactive,
  } = body;

  if (!id) {
    return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 });
  }

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
  } = {
    ...(songTitle !== undefined && { songTitle }),
    ...(duration !== undefined && { duration }),
    ...(notes !== undefined && { notes }),
    ...(levelId !== undefined && { levelId: levelId || null }),
    ...(color !== undefined && { color }),
    ...(teacherId !== undefined && { teacherId }),
    ...(genreId !== undefined && { genreId }),
    ...(isInactive !== undefined && { isInactive }),
  };

  // Always update dancers if dancerIds is provided
  if (dancerIds !== undefined && Array.isArray(dancerIds)) {
    updateData.dancers = {
      set: dancerIds.map((id: string) => ({ id })),
    };
  }

  const routine = await prisma.routine.update({
    where: { id },
    data: updateData,
    include: { teacher: true, genre: true, level: true, dancers: true },
  });

  return NextResponse.json(routine);
}


