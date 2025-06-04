import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Batch from '@/app/models/Batch';
import User from '@/app/models/User';
import Subject from '@/app/models/Subject';
import Level from '@/app/models/Level';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await connectDB();

    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const batchData = await req.json();

    // Validate required fields
    if (!batchData.subject || !batchData.level || !batchData.subscription || !batchData.price) {
      return NextResponse.json({ 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Verify subject and level exist
    const subject = await Subject.findById(batchData.subject);
    const level = await Level.findById(batchData.level);

    if (!subject || !level) {
      return NextResponse.json({ 
        message: 'Invalid subject or level' 
      }, { status: 400 });
    }

    // Create new batch
    const batch = new Batch({
      subject: batchData.subject,
      level: batchData.level,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      schedule: batchData.schedule || [],
      teacher: user._id, // Current user as teacher for now
      subscription: batchData.subscription,
      price: batchData.price,
      status: 'Active',
      description: batchData.description || ''
    });

    // Add the enrolled student(s)
    if (batchData.type === 'individual') {
      batch.students.push({
        userId: user._id,
        email: user.email
      });
    } else if (batchData.type === 'group') {
      // Validate minimum group size
      if (!batchData.students || batchData.students.length < 2) {
        return NextResponse.json({ 
          message: 'Group classes require at least 2 students' 
        }, { status: 400 });
      }

      // Add all group members
      batch.students = batchData.students.map(student => ({
        userId: student.userId || user._id,
        email: student.email
      }));
    } else {
      return NextResponse.json({ 
        message: 'Invalid class type' 
      }, { status: 400 });
    }

    await batch.save();

    // Add batch to user's batches
    if (!user.batches) {
      user.batches = [];
    }
    user.batches.push(batch._id);
    await user.save();

    // Populate the batch with referenced data
    const populatedBatch = await Batch.findById(batch._id)
      .populate('subject', 'name description')
      .populate('level', 'name description')
      .populate('teacher', 'name email')
      .populate('students.userId', 'name email');

    return NextResponse.json({
      message: 'Batch created successfully',
      batch: populatedBatch
    });

  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { message: 'Error creating batch', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Find all batches where the user is enrolled
    const batches = await Batch.find({
      'students.userId': user._id
    })
    .populate('subject', 'name description')
    .populate('level', 'name description')
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