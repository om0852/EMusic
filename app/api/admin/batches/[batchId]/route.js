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
console.log(token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || decoded.role !== 'admin') {
    throw new Error('Not authorized');
  }

  return decoded;
};

export async function GET(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId } = params;
    const batch = await Batch.findById(batchId)
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
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId } = params;
    const updateData = await request.json();

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (updateData.schedule) {
      batch.schedule = updateData.schedule;
    }
    if (updateData.status) {
      batch.status = updateData.status;
    }
    if (updateData.maxStudents) {
      batch.maxStudents = updateData.maxStudents;
    }
    if (updateData.price) {
      batch.price = updateData.price;
    }
    if (updateData.description) {
      batch.description = updateData.description;
    }
    if (updateData.teacher) {
      batch.teacher = updateData.teacher;
    }
    if (updateData.startDate) {
      batch.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      batch.endDate = new Date(updateData.endDate);
    }
    if (updateData.meetLink !== undefined) {
      batch.meetLink = updateData.meetLink;
    }
    if (updateData.meetPassword !== undefined) {
      batch.meetPassword = updateData.meetPassword;
    }

    await batch.save();

    // Return updated batch with populated fields
    const updatedBatch = await Batch.findById(batchId)
      .populate('subject', 'name description image')
      .populate('level', 'name description price schedule')
      .populate('teacher', 'name email')
      .populate('students.userId', 'name email');

    return NextResponse.json({ batch: updatedBatch });
  } catch (error) {
    console.error('Error updating batch:', error);
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
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if batch has any students
    if (batch.students.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete batch with enrolled students' },
        { status: 400 }
      );
    }

    await batch.deleteOne();

    return NextResponse.json(
      { message: 'Batch deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in batch deletion:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 