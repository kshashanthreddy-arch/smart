import { NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/ai-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, count, apiKey } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text or subject topic is required' }, { status: 400 });
    }

    const questions = await generateQuiz(text, Number(count) || 5, apiKey);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('AI quiz generation error:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
