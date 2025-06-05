import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Assignment from '@/app/models/Assignment';
import { verifyAdmin } from '@/app/utils/auth';

export async function POST(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId, assignmentId } = params;
    const data = await request.json();

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

    // Find the submission for the student
    const submission = assignment.submissions.find(
      s => s.student.toString() === data.studentId
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Add feedback to the submission
    submission.feedback.push({
      type: data.type,
      content: data.content,
      file: data.file,
      createdAt: new Date()
    });

    await assignment.save();

    return NextResponse.json({ message: 'Feedback added successfully' });
  } catch (error) {
    console.error('Error in POST /api/admin/batches/[batchId]/assignments/[assignmentId]/feedback:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 