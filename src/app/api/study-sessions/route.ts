import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Fetch sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch study sessions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { subjectId, durationMinutes, sessionType, notes } = body;

    const minutes = Number(durationMinutes) || 25;

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        subjectId: subjectId || null,
        durationMinutes: minutes,
        sessionType: sessionType || 'POMODORO',
        notes: notes || null,
      },
      include: { subject: true },
    });

    // Update user's study metrics
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalStudyMinutes: { increment: minutes },
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Record session error:', error);
    return NextResponse.json({ error: 'Failed to record study session' }, { status: 500 });
  }
}
