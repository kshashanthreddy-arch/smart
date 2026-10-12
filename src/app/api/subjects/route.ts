import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const subjects = await prisma.subject.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { tasks: true, notes: true, flashcardDecks: true, quizzes: true },
        },
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Fetch subjects error:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { code, title, color, instructor, room, credits, targetGrade, attendancePresent, attendanceTotal } = body;

    if (!code || !title) {
      return NextResponse.json({ error: 'Code and title are required' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        userId: user.id,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        color: color || '#4f46e5',
        instructor: instructor || '',
        room: room || '',
        credits: Number(credits) || 3,
        targetGrade: targetGrade || 'A',
        attendancePresent: Number(attendancePresent) || 0,
        attendanceTotal: Number(attendanceTotal) || 0,
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error('Create subject error:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
