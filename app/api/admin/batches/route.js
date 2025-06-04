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
  return true;
};

export async function GET(request) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const batches = await Batch.find()
      .populate('subject', 'name description image')
      .populate('level', 'name description price schedule')
      .populate('teacher', 'name email')
      .populate('students.userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ batches });
  } catch (error) {
    console.error('Error in admin batches GET:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const data = await request.json();
    const batch = new Batch(data);
    await batch.save();

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    console.error('Error in admin batches POST:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 