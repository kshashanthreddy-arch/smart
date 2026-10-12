import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { code, title, color, instructor, room, credits, targetGrade, attendancePresent, attendanceTotal } = body;

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        ...(code && { code: code.trim().toUpperCase() }),
        ...(title && { title: title.trim() }),
        ...(color && { color }),
        ...(instructor !== undefined && { instructor }),
        ...(room !== undefined && { room }),
        ...(credits !== undefined && { credits: Number(credits) }),
        ...(targetGrade !== undefined && { targetGrade }),
        ...(attendancePresent !== undefined && { attendancePresent: Number(attendancePresent) }),
        ...(attendanceTotal !== undefined && { attendanceTotal: Number(attendanceTotal) }),
      },
    });

    return NextResponse.json({ subject: updated });
  } catch (error) {
    console.error('Update subject error:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.subject.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete subject error:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
