import { NextResponse } from 'next/server';
import { summarizeContent } from '@/lib/ai-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, topic, apiKey } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    const result = await summarizeContent(text, topic, apiKey);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI summarize error:', error);
    return NextResponse.json({ error: 'Failed to generate AI summary' }, { status: 500 });
  }
}
