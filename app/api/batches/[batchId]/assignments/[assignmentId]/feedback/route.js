import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Assignment from '@/app/models/Assignment';
import { verifyAuth } from '@/app/utils/auth';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    const { batchId, assignmentId } = params;
    const { content, type } = await request.json();

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

    // Find user's submission
    const submission = assignment.submissions.find(
      sub => sub.student.toString() === user._id.toString()
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'You have not submitted this assignment yet' },
        { status: 400 }
      );
    }

    // Add feedback
    submission.feedback.push({
      type,
      content,
      createdAt: new Date()
    });

    await assignment.save();

    return NextResponse.json({ message: 'Feedback added successfully' });
  } catch (error) {
    console.error('Error in POST /api/batches/[batchId]/assignments/[assignmentId]/feedback:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 