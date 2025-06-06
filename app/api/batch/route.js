import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Batch from '@/app/models/Batch';
import User from '@/app/models/User';
import Subject from '@/app/models/Subject';
import Level from '@/app/models/Level';
import jwt from 'jsonwebtoken';

// Helper function to calculate schedule dates
function calculateScheduleDates(startDate, schedule, durationMonths) {
  const dates = [];
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  const start = new Date(startDate);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  while (start <= endDate) {
    schedule.forEach(slot => {
      const dayIndex = days.indexOf(slot.day);
      if (dayIndex === start.getDay()) {
        const sessionDate = new Date(start);
        const [startHours, startMinutes] = slot.startTime.split(':');
        const [endHours, endMinutes] = slot.endTime.split(':');
        
        sessionDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
        
        dates.push({
          date: new Date(sessionDate),
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    });
    
    // Move to next day
    start.setDate(start.getDate() + 1);
  }

  return dates;
}

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

    // Create new batch using level's dates
    const startDate = new Date(); // Current date
    let durationMonths;
    
    // Set duration based on subscription plan
    switch (batchData.subscription) {
      case 'Monthly':
        durationMonths = 1;
        break;
      case 'Quarterly':
        durationMonths = 3;
        break;
      case 'Semi-Annual':
        durationMonths = 6;
        break;
      case 'Annual':
        durationMonths = 12;
        break;
      default:
        durationMonths = 1;
    }

    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Calculate all session dates
    const schedule = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      level.schedule.forEach(slot => {
        const dayIndex = days.indexOf(slot.day);
        if (dayIndex === currentDate.getDay()) {
          const sessionDate = new Date(currentDate);
          const [startHours, startMinutes] = slot.startTime.split(':');
          sessionDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

          schedule.push({
            date: new Date(sessionDate),
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        }
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create new batch
    const batch = new Batch({
      subject: batchData.subject,
      level: batchData.level,
      startDate: startDate,
      endDate: endDate,
      schedule: schedule,
      teacher: user._id,
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