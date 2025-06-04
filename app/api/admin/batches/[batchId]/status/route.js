import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Batch from '@/app/models/Batch';
import jwt from 'jsonwebtoken';

// Helper function to verify admin role
const verifyAdmin = async (request) => {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    throw new Error('Not authenticated');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || decoded.role !== 'admin') {
    throw new Error('Not authorized');
  }

  return decoded;
};

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId } = params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ['Active', 'Upcoming', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    const batch = await Batch.findByIdAndUpdate(
      batchId,
      { status },
      { new: true }
    )
    .populate('subject', 'name description image')
    .populate('level', 'name description price schedule')
    .populate('teacher', 'name email')
    .populate('students.userId', 'name email');

    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ batch });
  } catch (error) {
    console.error('Error in batch status update:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 