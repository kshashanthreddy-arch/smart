import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { answers } = body; // Record<questionId, selectedOptionIndex>

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

    let correctCount = 0;
    const total = quiz.questions.length;

    // Update each question's userAnswer
    for (const q of quiz.questions) {
      const userSelected = answers[q.id];
      if (userSelected !== undefined) {
        if (Number(userSelected) === q.correctAnswer) {
          correctCount++;
        }
        await prisma.quizQuestion.update({
          where: { id: q.id },
          data: { userAnswer: Number(userSelected) },
        });
      }
    }

    const percentageScore = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        score: percentageScore,
        completedAt: new Date(),
      },
      include: {
        subject: true,
        questions: true,
      },
    });

    // Reward user with 15 focus minutes and update study stats
    await prisma.user.update({
      where: { id: quiz.userId },
      data: {
        totalStudyMinutes: { increment: 15 },
      },
    });

    return NextResponse.json({
      quiz: updatedQuiz,
      score: percentageScore,
      correctCount,
      total,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz results' }, { status: 500 });
  }
}
