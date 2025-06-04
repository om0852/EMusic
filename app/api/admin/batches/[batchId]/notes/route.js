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
    const noteData = await request.json();

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      );
    }

    batch.notes.push(noteData);
    await batch.save();

    return NextResponse.json({ message: 'Note added successfully', note: noteData });
  } catch (error) {
    console.error('Error adding note:', error);
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
    const { noteId } = await request.json();

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      );
    }

    batch.notes = batch.notes.filter(note => note._id.toString() !== noteId);
    await batch.save();

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 