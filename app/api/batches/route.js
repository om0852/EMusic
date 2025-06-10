import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import User from '@/app/models/User';
import Batch from '@/app/models/Batch';
import Level from '@/app/models/Level'
import Subject from '@/app/models/Subject';
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
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Find all batches where the user is enrolled
    const batches = await Batch.find({
      'students.userId': user._id
    })
    .populate('subject', 'name description image')
    .populate('level', 'name description')
    .populate('teacher', 'name email');

    return NextResponse.json({ batches: batches || [] });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { message: 'Error fetching batches' },
      { status: 500 }
    );
  }
} 