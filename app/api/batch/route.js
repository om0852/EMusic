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
    const [subject, level] = await Promise.all([
      Subject.findById(batchData.subject),
      Level.findById(batchData.level)
    ]);

    if (!subject || !level) {
      return NextResponse.json({ 
        message: 'Invalid subject or level' 
      }, { status: 400 });
    }

    // Set duration based on subscription plan
    const durationMap = {
      'Monthly': 1,
      'Quarterly': 3,
      'Semi-Annual': 6,
      'Annual': 12
    };
    
    const durationMonths = durationMap[batchData.subscription] || 1;

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Check if this is a group enrollment
    if (batchData.type === 'group') {
      // Find an existing batch with the same subject, level, and subscription
      const existingBatch = await Batch.findOne({
        subject: batchData.subject,
        level: batchData.level,
        subscription: batchData.subscription,
        status: 'Active',
        endDate: { $gt: new Date() } // Only consider active batches
      });

      if (existingBatch) {
        // Add student to existing batch
        const studentEmails = batchData.students.map(s => s.email);
        
        // Check if any student is already in this batch
        const existingStudents = existingBatch.students.filter(s => 
          studentEmails.includes(s.email)
        );

        if (existingStudents.length > 0) {
          return NextResponse.json({ 
            message: 'One or more students are already enrolled in this batch' 
          }, { status: 400 });
        }

        // Add new students to the batch
        const newStudents = batchData.students.map(student => ({
          userId: student.userId || user._id,
          email: student.email
        }));

        existingBatch.students.push(...newStudents);
        await existingBatch.save();

        // Update user's batches
        await User.updateMany(
          { _id: { $in: newStudents.map(s => s.userId) } },
          { $addToSet: { batches: existingBatch._id } }
        );

        const populatedBatch = await Batch.findById(existingBatch._id)
          .populate('subject', 'name description')
          .populate('level', 'name description')
          .populate('teacher', 'name email')
          .populate('students.userId', 'name email');

        return NextResponse.json({
          message: 'Students added to existing batch successfully',
          batch: populatedBatch
        });
      }
      // If no existing batch, continue to create a new one
    }

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
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Prepare students array
    let students = [];
    if (batchData.type === 'individual') {
      students = [{
        userId: user._id,
        email: user.email
      }];
    } else if (batchData.type === 'group' && batchData.students) {
      students = batchData.students.map(student => ({
        userId: student.userId || user._id,
        email: student.email
      }));
    }

    // Create new batch
    const batch = new Batch({
      subject: batchData.subject,
      level: batchData.level,
      type: batchData.type || 'individual',
      startDate: startDate,
      endDate: endDate,
      schedule: schedule,
      teacher: user._id,
      subscription: batchData.subscription,
      price: batchData.price,
      status: 'Active',
      description: batchData.description || '',
      students: students
    });

    await batch.save();

    // Add batch to users' batches
    const userIds = students.map(s => s.userId);
    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { batches: batch._id } }
    );

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