import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deck = await prisma.flashcardDeck.findUnique({
      where: { id },
      include: {
        subject: true,
        cards: true,
      },
    });

    if (!deck) return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    return NextResponse.json({ deck });
  } catch (error) {
    console.error('Fetch deck error:', error);
    return NextResponse.json({ error: 'Failed to fetch deck' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.flashcardDeck.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete deck error:', error);
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 });
  }
}
