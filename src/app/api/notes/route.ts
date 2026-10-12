import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const search = searchParams.get('q');

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        ...(subjectId ? { subjectId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { content: { contains: search } },
                { tags: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        subject: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { title, content, subjectId, summary, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content: content.trim(),
        subjectId: subjectId || null,
        summary: summary || null,
        tags: tags || null,
      },
      include: { subject: true },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
