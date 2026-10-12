import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let user = await prisma.user.findFirst({
      where: { email: 'alex@university.edu' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'demo-student-id',
          name: 'Alex Morgan',
          email: 'alex@university.edu',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          targetGpa: 3.85,
          studyStreak: 5,
          totalStudyMinutes: 840,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
