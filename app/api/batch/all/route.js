import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Batch from '@/app/models/Batch';
import Subject from '@/app/models/Subject';
import Level from '@/app/models/Level';
import User from '@/app/models/User';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await connectDB();

    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch all batches with populated references
    const batches = await Batch.find()
      .populate('subject', 'name description')
      .populate('level', 'name description price schedule')
      .populate('teacher', 'name email')
      .populate('students.userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      batches: batches 
    });

  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { message: 'Error fetching batches', error: error.message },
      { status: 500 }
    );
  }
} 