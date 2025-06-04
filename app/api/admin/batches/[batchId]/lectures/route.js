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
    const lectureData = await request.json();

    // Validate required fields
    if (!lectureData.title || !lectureData.notes || !lectureData.date) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      );
    }

    // Add new lecture
    batch.lectures.push({
      title: lectureData.title,
      notes: lectureData.notes,
      assignment: lectureData.assignment,
      date: new Date(lectureData.date)
    });

    await batch.save();

    return NextResponse.json({
      message: 'Lecture added successfully',
      lecture: batch.lectures[batch.lectures.length - 1]
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding lecture:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId } = params;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lectures: batch.lectures });

  } catch (error) {
    console.error('Error fetching lectures:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 