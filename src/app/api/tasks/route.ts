import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const subjectId = searchParams.get('subjectId');

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        subject: true,
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { title, description, subjectId, dueDate, priority, status, estimatedMinutes, weight } = body;

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description || null,
        subjectId: subjectId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : 45,
        weight: weight ? Number(weight) : 10,
      },
      include: { subject: true },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
