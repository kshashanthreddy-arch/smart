import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const decks = await prisma.flashcardDeck.findMany({
      where: { userId: user.id },
      include: {
        subject: true,
        cards: true,
        _count: { select: { cards: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Fetch decks error:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcard decks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { title, description, subjectId, cards } = body;

    if (!title) {
      return NextResponse.json({ error: 'Deck title is required' }, { status: 400 });
    }

    const deck = await prisma.flashcardDeck.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description || null,
        subjectId: subjectId || null,
        cards: {
          create: Array.isArray(cards)
            ? cards.map((c: { front: string; back: string; difficulty?: string }) => ({
                front: c.front.trim(),
                back: c.back.trim(),
                difficulty: c.difficulty || 'MEDIUM',
              }))
            : [],
        },
      },
      include: {
        subject: true,
        cards: true,
      },
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    console.error('Create deck error:', error);
    return NextResponse.json({ error: 'Failed to create flashcard deck' }, { status: 500 });
  }
}
