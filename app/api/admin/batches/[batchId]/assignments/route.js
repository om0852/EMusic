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

export async function POST(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId } = params;
    const assignmentData = await request.json();

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      );
    }

    batch.assignments.push(assignmentData);
    await batch.save();

    return NextResponse.json({ message: 'Assignment added successfully', assignment: assignmentData });
  } catch (error) {
    console.error('Error adding assignment:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
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

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      );
    }

    batch.assignments = batch.assignments.filter(assignment => assignment._id.toString() !== assignmentId);
    await batch.save();

    return NextResponse.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 