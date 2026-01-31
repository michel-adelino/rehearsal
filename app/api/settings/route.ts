import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get or create settings with default values
    let settings = await prisma.settings.findUnique({
      where: { id: 'settings' },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.settings.create({
        data: {
          id: 'settings',
          visibleRooms: 4,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (e: unknown) {
    console.error('Failed to get settings:', e);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { visibleRooms } = body;

    if (visibleRooms === undefined) {
      return NextResponse.json(
        { error: 'visibleRooms is required' },
        { status: 400 }
      );
    }

    if (typeof visibleRooms !== 'number' || visibleRooms < 1 || visibleRooms > 8) {
      return NextResponse.json(
        { error: 'visibleRooms must be a number between 1 and 8' },
        { status: 400 }
      );
    }

    // Upsert settings (create if doesn't exist, update if it does)
    const settings = await prisma.settings.upsert({
      where: { id: 'settings' },
      update: { visibleRooms },
      create: {
        id: 'settings',
        visibleRooms,
      },
    });

    return NextResponse.json(settings);
  } catch (e: unknown) {
    console.error('Failed to update settings:', e);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

