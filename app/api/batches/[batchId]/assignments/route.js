import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Assignment from '@/app/models/Assignment';
import { verifyAuth } from '@/app/utils/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    const { batchId } = params;

    const assignments = await Assignment.find({ batchId })
      .populate('submissions.student', 'name email')
      .sort({ createdAt: -1 });

    // Filter submissions to only show the current user's submission
    const filteredAssignments = assignments.map(assignment => ({
      ...assignment.toObject(),
      submissions: assignment.submissions.filter(sub => sub.student._id.toString() === user._id.toString())
    }));

    return NextResponse.json({ assignments: filteredAssignments });
  } catch (error) {
    console.error('Error in GET /api/batches/[batchId]/assignments:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 