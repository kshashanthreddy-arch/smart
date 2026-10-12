import { NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/ai-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, count, apiKey } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content or topic is required' }, { status: 400 });
    }

    const cards = await generateFlashcards(text, Number(count) || 5, apiKey);
    return NextResponse.json({ cards });
  } catch (error) {
    console.error('AI flashcards generation error:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
