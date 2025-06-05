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

export async function GET(request) {
  try {
    await connectDB();
    await verifyAdmin(request);

    // Get current date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get current time for comparing with session times
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');

    // Get all active batches
    const batches = await Batch.find({
      status: 'Active',
      endDate: { $gte: today }
    })
    .populate('subject', 'name description')
    .populate('level', 'name description')
    .populate('teacher', 'name email')
    .lean();

    // Process batches to get upcoming sessions
    const sessions = [];

    for (const batch of batches) {
      batch.schedule.forEach(schedule => {
        const todayDay = today.getDay();
        const tomorrowDay = tomorrow.getDay();
        const scheduleDay = days.indexOf(schedule.day);

        // Check if session is for today and hasn't ended
        if (todayDay === scheduleDay && schedule.endTime > currentTime) {
          sessions.push({
            _id: `${batch._id}-${schedule.day}-${schedule.startTime}`,
            batchId: batch._id,
            subject: batch.subject,
            level: batch.level,
            teacher: batch.teacher,
            currentStudents: batch.currentStudents,
            maxStudents: batch.maxStudents,
            meetLink: batch.meetLink,
            date: new Date(today),
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime
          });
        }
        // Check if session is for tomorrow
        else if (tomorrowDay === scheduleDay) {
          sessions.push({
            _id: `${batch._id}-${schedule.day}-${schedule.startTime}`,
            batchId: batch._id,
            subject: batch.subject,
            level: batch.level,
            teacher: batch.teacher,
            currentStudents: batch.currentStudents,
            maxStudents: batch.maxStudents,
            meetLink: batch.meetLink,
            date: new Date(tomorrow),
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime
          });
        }
      });
    }

    // Sort sessions by date and time
    sessions.sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare === 0) {
        return a.startTime.localeCompare(b.startTime);
      }
      return dateCompare;
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in GET /api/admin/schedule:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper function to get the next occurrence of a day
function getNextDayOccurrence(fromDate, dayName) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const fromDateDay = fromDate.getDay();
  const targetDay = days.indexOf(dayName);
  
  let daysUntilTarget = targetDay - fromDateDay;
  
  // If it's the same day, keep it. If it's in the past, add 7 days
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7;
  }

  const targetDate = new Date(fromDate);
  targetDate.setDate(fromDate.getDate() + daysUntilTarget);
  return targetDate;
} 