import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const quizzes = await prisma.quiz.findMany({
      where: { userId: user.id },
      include: {
        subject: true,
        questions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Fetch quizzes error:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'alex@university.edu' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { title, topic, subjectId, questions } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Title and questions array are required' }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        userId: user.id,
        title: title.trim(),
        topic: topic || 'General Practice',
        subjectId: subjectId || null,
        totalQuestions: questions.length,
        questions: {
          create: questions.map((q: { question: string; options: string[]; correctAnswer: number; explanation?: string }) => ({
            question: q.question.trim(),
            options: JSON.stringify(q.options),
            correctAnswer: Number(q.correctAnswer) || 0,
            explanation: q.explanation || null,
          })),
        },
      },
      include: {
        subject: true,
        questions: true,
      },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error('Create quiz error:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}
