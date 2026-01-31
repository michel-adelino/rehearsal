import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to parse YYYY-MM-DD to UTC Date (midnight UTC)
// This ensures dates are stored consistently regardless of server timezone
function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    console.log('[SCHEDULED API] GET request received', { from, to });

    const where: { date?: { gte?: Date; lte?: Date } } = {};
    if (from || to) {
      where.date = {};
      if (from) {
        try {
          where.date.gte = parseDateString(from);
          console.log('[SCHEDULED API] Parsed "from" date:', where.date.gte);
        } catch (error) {
          console.error('[SCHEDULED API] Error parsing "from" date:', from, error);
          return NextResponse.json({ error: 'Invalid "from" date format. Expected YYYY-MM-DD' }, { status: 400 });
        }
      }
      if (to) {
        try {
          const [year, month, day] = to.split('-').map(Number);
          where.date.lte = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
          console.log('[SCHEDULED API] Parsed "to" date:', where.date.lte);
        } catch (error) {
          console.error('[SCHEDULED API] Error parsing "to" date:', to, error);
          return NextResponse.json({ error: 'Invalid "to" date format. Expected YYYY-MM-DD' }, { status: 400 });
        }
      }
    }

    const items = await prisma.scheduledRoutine.findMany({
      where,
      include: { routine: { include: { teacher: true, genre: true, level: true, dancers: true } }, room: true },
      orderBy: [{ date: 'asc' }, { startMinutes: 'asc' }],
    });

    console.log('[SCHEDULED API] Successfully fetched scheduled routines:', { count: items.length });
    return NextResponse.json(items);
  } catch (error) {
    console.error('[SCHEDULED API] Error in GET request:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled routines' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, startMinutes, duration, routineId, roomId } = body;

    console.log('[SCHEDULED API] POST request received:', { date, startMinutes, duration, routineId, roomId });

    // Validation checks
    if (!date) {
      console.error('[SCHEDULED API] Validation error: Missing date');
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    if (typeof startMinutes !== 'number' || startMinutes < 0) {
      console.error('[SCHEDULED API] Validation error: Invalid startMinutes', startMinutes);
      return NextResponse.json({ error: 'Valid startMinutes is required' }, { status: 400 });
    }
    if (typeof duration !== 'number' || duration <= 0) {
      console.error('[SCHEDULED API] Validation error: Invalid duration', duration);
      return NextResponse.json({ error: 'Valid duration is required' }, { status: 400 });
    }
    if (!routineId) {
      console.error('[SCHEDULED API] Validation error: Missing routineId');
      return NextResponse.json({ error: 'routineId is required' }, { status: 400 });
    }
    if (!roomId) {
      console.error('[SCHEDULED API] Validation error: Missing roomId');
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    // Verify routine exists
    const routine = await prisma.routine.findUnique({ where: { id: routineId } });
    if (!routine) {
      console.error('[SCHEDULED API] Validation error: Routine not found', { routineId });
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    // Verify room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      console.error('[SCHEDULED API] Validation error: Room not found', { roomId });
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check for existing conflicts before creating
    const parsedDate = parseDateString(date);
    const existingSchedules = await prisma.scheduledRoutine.findMany({
      where: {
        date: parsedDate,
        roomId: roomId,
      },
    });

    // Check for time slot overlaps
    const endMinutes = startMinutes + duration;
    const hasConflict = existingSchedules.some(existing => {
      const existingEnd = existing.startMinutes + existing.duration;
      return (
        (startMinutes >= existing.startMinutes && startMinutes < existingEnd) ||
        (endMinutes > existing.startMinutes && endMinutes <= existingEnd) ||
        (startMinutes <= existing.startMinutes && endMinutes >= existingEnd)
      );
    });

    if (hasConflict) {
      console.warn('[SCHEDULED API] Conflict detected: Time slot overlap', {
        date,
        roomId,
        startMinutes,
        duration,
        existingSchedules: existingSchedules.map(s => ({
          id: s.id,
          startMinutes: s.startMinutes,
          duration: s.duration,
        })),
      });
      return NextResponse.json({ error: 'Time slot already occupied for this room and date.' }, { status: 409 });
    }

    const created = await prisma.scheduledRoutine.create({
      data: {
        date: parsedDate,
        startMinutes,
        duration,
        routineId,
        roomId,
      },
      include: { routine: { include: { teacher: true, genre: true, level: true, dancers: true } }, room: true },
    });

    console.log('[SCHEDULED API] Successfully created scheduled routine:', { id: created.id, date, roomId, routineId });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        console.error('[SCHEDULED API] Database conflict error (P2002): Unique constraint violation', {
          meta: e.meta,
          target: e.meta?.target,
        });
        return NextResponse.json({ error: 'Time slot already occupied for this room and date.' }, { status: 409 });
      }
      if (e.code === 'P2003') {
        console.error('[SCHEDULED API] Database error (P2003): Foreign key constraint violation', {
          meta: e.meta,
        });
        return NextResponse.json({ error: 'Invalid routineId or roomId reference' }, { status: 400 });
      }
      console.error('[SCHEDULED API] Prisma error:', { code: e.code, meta: e.meta });
    } else if (e instanceof SyntaxError) {
      console.error('[SCHEDULED API] JSON parsing error:', e.message);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    } else {
      console.error('[SCHEDULED API] Unexpected error in POST request:', e);
    }
    return NextResponse.json({ error: 'Failed to create scheduled routine' }, { status: 500 });
  }
}


