import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/app/lib/auth';

// Helper to parse YYYY-MM-DD to UTC Date (midnight UTC)
// This ensures dates are stored consistently regardless of server timezone
function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
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

  try {
    const body = await req.json();
    const { date, startMinutes, duration, routineId, roomId } = body;

    console.log('[SCHEDULED API] PATCH request received:', { id: params.id, date, startMinutes, duration, routineId, roomId });

    // Check if scheduled routine exists
    const existing = await prisma.scheduledRoutine.findUnique({
      where: { id: params.id },
      include: { routine: true, room: true },
    });

    if (!existing) {
      console.error('[SCHEDULED API] Validation error: Scheduled routine not found', { id: params.id });
      return NextResponse.json({ error: 'Scheduled routine not found' }, { status: 404 });
    }

    // Validate numeric fields if provided
    if (startMinutes !== undefined && (typeof startMinutes !== 'number' || startMinutes < 0)) {
      console.error('[SCHEDULED API] Validation error: Invalid startMinutes', startMinutes);
      return NextResponse.json({ error: 'Valid startMinutes is required' }, { status: 400 });
    }
    if (duration !== undefined && (typeof duration !== 'number' || duration <= 0)) {
      console.error('[SCHEDULED API] Validation error: Invalid duration', duration);
      return NextResponse.json({ error: 'Valid duration is required' }, { status: 400 });
    }

    // Verify routine exists if routineId is being updated
    if (routineId && routineId !== existing.routineId) {
      const routine = await prisma.routine.findUnique({ where: { id: routineId } });
      if (!routine) {
        console.error('[SCHEDULED API] Validation error: Routine not found', { routineId });
        return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
      }
    }

    // Verify room exists if roomId is being updated
    if (roomId && roomId !== existing.roomId) {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        console.error('[SCHEDULED API] Validation error: Room not found', { roomId });
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
    }

    // Determine the values that will be used after update
    const finalDate = date ? parseDateString(date) : existing.date;
    const finalStartMinutes = typeof startMinutes === 'number' ? startMinutes : existing.startMinutes;
    const finalDuration = typeof duration === 'number' ? duration : existing.duration;
    const finalRoomId = roomId || existing.roomId;

    // Check for conflicts with other scheduled routines
    const existingSchedules = await prisma.scheduledRoutine.findMany({
      where: {
        date: finalDate,
        roomId: finalRoomId,
        id: { not: params.id }, // Exclude current schedule
      },
    });

    const endMinutes = finalStartMinutes + finalDuration;
    const hasConflict = existingSchedules.some(existingSchedule => {
      const existingEnd = existingSchedule.startMinutes + existingSchedule.duration;
      return (
        (finalStartMinutes >= existingSchedule.startMinutes && finalStartMinutes < existingEnd) ||
        (endMinutes > existingSchedule.startMinutes && endMinutes <= existingEnd) ||
        (finalStartMinutes <= existingSchedule.startMinutes && endMinutes >= existingEnd)
      );
    });

    if (hasConflict) {
      console.warn('[SCHEDULED API] Conflict detected: Time slot overlap', {
        id: params.id,
        date: finalDate,
        roomId: finalRoomId,
        startMinutes: finalStartMinutes,
        duration: finalDuration,
        existingSchedules: existingSchedules.map(s => ({
          id: s.id,
          startMinutes: s.startMinutes,
          duration: s.duration,
        })),
      });
      return NextResponse.json({ error: 'Time slot already occupied for this room and date.' }, { status: 409 });
    }

    const updated = await prisma.scheduledRoutine.update({
      where: { id: params.id },
      data: {
        ...(date ? { date: parseDateString(date) } : {}),
        ...(typeof startMinutes === 'number' ? { startMinutes } : {}),
        ...(typeof duration === 'number' ? { duration } : {}),
        ...(routineId ? { routineId } : {}),
        ...(roomId ? { roomId } : {}),
      },
      include: { routine: { include: { teacher: true, genre: true, dancers: true } }, room: true },
    });

    console.log('[SCHEDULED API] Successfully updated scheduled routine:', { id: params.id });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        console.error('[SCHEDULED API] Database conflict error (P2002): Unique constraint violation', {
          id: params.id,
          meta: e.meta,
          target: e.meta?.target,
        });
        return NextResponse.json({ error: 'Time slot already occupied for this room and date.' }, { status: 409 });
      }
      if (e.code === 'P2025') {
        console.error('[SCHEDULED API] Database error (P2025): Record not found', {
          id: params.id,
          meta: e.meta,
        });
        return NextResponse.json({ error: 'Scheduled routine not found' }, { status: 404 });
      }
      if (e.code === 'P2003') {
        console.error('[SCHEDULED API] Database error (P2003): Foreign key constraint violation', {
          id: params.id,
          meta: e.meta,
        });
        return NextResponse.json({ error: 'Invalid routineId or roomId reference' }, { status: 400 });
      }
      console.error('[SCHEDULED API] Prisma error:', { id: params.id, code: e.code, meta: e.meta });
    } else if (e instanceof SyntaxError) {
      console.error('[SCHEDULED API] JSON parsing error:', e.message);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    } else {
      console.error('[SCHEDULED API] Unexpected error in PATCH request:', { id: params.id, error: e });
    }
    return NextResponse.json({ error: 'Failed to update scheduled routine' }, { status: 500 });
  }
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

  try {
    console.log('[SCHEDULED API] DELETE request received:', { id: params.id });

    // Check if scheduled routine exists before attempting to delete
    const existing = await prisma.scheduledRoutine.findUnique({
      where: { id: params.id },
      include: { routine: true, room: true },
    });

    if (!existing) {
      console.error('[SCHEDULED API] Validation error: Scheduled routine not found for deletion', { id: params.id });
      return NextResponse.json({ error: 'Scheduled routine not found' }, { status: 404 });
    }

    await prisma.scheduledRoutine.delete({ where: { id: params.id } });
    console.log('[SCHEDULED API] Successfully deleted scheduled routine:', { id: params.id });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        console.error('[SCHEDULED API] Database error (P2025): Record not found for deletion', {
          id: params.id,
          meta: e.meta,
        });
        return NextResponse.json({ error: 'Scheduled routine not found' }, { status: 404 });
      }
      console.error('[SCHEDULED API] Prisma error in DELETE:', { id: params.id, code: e.code, meta: e.meta });
    } else {
      console.error('[SCHEDULED API] Unexpected error in DELETE request:', { id: params.id, error: e });
    }
    return NextResponse.json({ error: 'Failed to delete scheduled routine' }, { status: 500 });
  }
}


