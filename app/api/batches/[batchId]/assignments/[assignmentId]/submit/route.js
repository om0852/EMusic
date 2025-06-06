import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Assignment from '@/app/models/Assignment';
import { verifyAuth } from '@/app/utils/auth';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    const { batchId, assignmentId } = params;
    const { file } = await request.json();

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      batchId
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if user has already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student?.toString() === user.userId?.toString()
    );

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this assignment' },
        { status: 400 }
      );
    }

    // Add submission with the user's ID from auth
    assignment.submissions.push({
      student: user.userId, // Use userId from verified auth
      file,
      submittedAt: new Date()
    });

    await assignment.save();

    return NextResponse.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Error in POST /api/batches/[batchId]/assignments/[assignmentId]/submit:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 