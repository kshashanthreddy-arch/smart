import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { mastered, reviewCountIncrement } = body;

    const card = await prisma.flashcard.update({
      where: { id },
      data: {
        ...(mastered !== undefined && { mastered: Boolean(mastered) }),
        ...(reviewCountIncrement && {
          reviewCount: { increment: 1 },
          lastReviewed: new Date(),
        }),
      },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}
