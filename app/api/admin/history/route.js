import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Batch from '@/app/models/Batch';
import { verifyAdmin } from '@/app/utils/auth';

export async function GET(request) {
  try {
    await connectDB();
    await verifyAdmin(request);

    // Get current date and time
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Get all active batches with populated fields
    const batches = await Batch.find({
      status: 'Active'
    })
    .populate('subject', 'name description')
    .populate('level', 'name description')
    .populate('teacher', 'name email')
    .lean();

    // Process batches to get completed sessions
    const sessions = [];

    for (const batch of batches) {
      // Get all past sessions
      batch.schedule.forEach(schedule => {
        const [hours, minutes] = schedule.endTime.split(':').map(Number);
        const sessionEndTime = new Date(today);
        sessionEndTime.setHours(hours, minutes, 0, 0);

        // Only include sessions that have ended
        if (sessionEndTime < now) {
          // Find attendance for this session
          const attendance = batch.attendance?.find(a => 
            a.date.toDateString() === today.toDateString() &&
            a.startTime === schedule.startTime
          );

          sessions.push({
            _id: `${batch._id}-${schedule.day}-${schedule.startTime}`,
            batchId: batch._id,
            subject: batch.subject,
            level: batch.level,
            teacher: batch.teacher,
            currentStudents: batch.students?.length || 0,
            maxStudents: batch.maxStudents,
            date: today,
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            attendance: attendance ? attendance.students : null
          });
        }
      });
    }

    // Sort sessions by date and time
    sessions.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare === 0) {
        return a.startTime.localeCompare(b.startTime);
      }
      return dateCompare;
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in GET /api/admin/history:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 