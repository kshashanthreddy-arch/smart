import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'alex@university.edu' },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [subjects, tasks, notes, decks, quizzes, studySessions] = await Promise.all([
      prisma.subject.findMany({
        where: { userId: user.id },
        include: {
          _count: {
            select: { tasks: true, notes: true, flashcardDecks: true },
          },
        },
      }),
      prisma.task.findMany({
        where: { userId: user.id },
        include: { subject: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.note.findMany({
        where: { userId: user.id },
        select: { id: true },
      }),
      prisma.flashcardDeck.findMany({
        where: { userId: user.id },
        include: { _count: { select: { cards: true } } },
      }),
      prisma.quiz.findMany({
        where: { userId: user.id },
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.studySession.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        include: { subject: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Compute weekly study minutes by day
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyDataMap: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    let totalWeekMinutes = 0;
    studySessions.forEach((session) => {
      const dayName = daysOfWeek[new Date(session.createdAt).getDay()];
      weeklyDataMap[dayName] = (weeklyDataMap[dayName] || 0) + session.durationMinutes;
      totalWeekMinutes += session.durationMinutes;
    });

    // Compute subject study minutes
    const subjectMinutesMap: Record<string, { title: string; color: string; minutes: number }> = {};
    studySessions.forEach((session) => {
      if (session.subject) {
        if (!subjectMinutesMap[session.subject.id]) {
          subjectMinutesMap[session.subject.id] = {
            title: session.subject.title,
            color: session.subject.color,
            minutes: 0,
          };
        }
        subjectMinutesMap[session.subject.id].minutes += session.durationMinutes;
      }
    });

    const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

    return NextResponse.json({
      user,
      stats: {
        totalSubjects: subjects.length,
        totalTasks: tasks.length,
        pendingTasks: pendingTasks.length,
        completedTasks: completedTasks.length,
        totalNotes: notes.length,
        totalDecks: decks.length,
        totalCards: decks.reduce((acc, d) => acc + d._count.cards, 0),
        studyStreak: user.studyStreak,
        totalStudyHours: Math.round(user.totalStudyMinutes / 60 * 10) / 10,
        weekStudyHours: Math.round(totalWeekMinutes / 60 * 10) / 10,
        targetGpa: user.targetGpa,
      },
      weeklyChart: Object.entries(weeklyDataMap).map(([day, minutes]) => ({
        day,
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10,
      })),
      subjectBreakdown: Object.values(subjectMinutesMap),
      upcomingDeadlines: pendingTasks.slice(0, 5),
      subjects,
      recentQuizzes: quizzes,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
