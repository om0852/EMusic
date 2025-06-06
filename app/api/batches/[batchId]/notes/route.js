import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Batch from '@/app/models/Batch';
import { verifyAuth } from '@/app/utils/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    const { batchId } = params;

    // Get the batch and verify user is enrolled
    const batch = await Batch.findOne({
      _id: batchId,
      'students.userId': user.userId
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found or user not enrolled' },
        { status: 404 }
      );
    }

    return NextResponse.json({ notes: batch.notes || [] });
  } catch (error) {
    console.error('Error in GET /api/batches/[batchId]/notes:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 