import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Assignment from '@/app/models/Assignment';
import { verifyAdmin } from '@/app/utils/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId } = await params;

    const assignments = await Assignment.find({ batchId })
      .populate('submissions.student', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error in GET /api/admin/batches/[batchId]/assignments:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId } = params;
    const data = await request.json();

    const assignment = new Assignment({
      batchId,
      title: data.title,
      description: data.description,
      files: {
        document: data.files?.document || null,
        audio: data.files?.audio || null,
        video: data.files?.video || null
      },
      dueDate: data.dueDate
    });

    await assignment.save();

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Error in POST /api/admin/batches/[batchId]/assignments:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId } = params;
    const { assignmentId } = await request.json();

    await Assignment.findOneAndDelete({
      _id: assignmentId,
      batchId
    });

    return NextResponse.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 