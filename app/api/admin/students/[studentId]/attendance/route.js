import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import User from '@/app/models/User';
import Batch from '@/app/models/Batch';
import { verifyAdmin } from '@/app/utils/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const studentId = params.studentId;
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Get the student
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get all batches where the student is enrolled with populated fields
    const batches = await Batch.find({
      'students.userId': studentId,
      status: 'Active'
    })
    .populate('subject', 'name')
    .populate('level', 'name')
    .select('subject level schedule attendance')
    .lean();

    // Process attendance for each batch
    const attendance = batches.map((batch) => {
      // Get all sessions where attendance was marked
      const sessions = [];
      
      if (batch.attendance && batch.attendance.length > 0) {
        batch.attendance.forEach(a => {
          const studentAttendance = a.students.find(s => 
            s.userId.toString() === studentId.toString()
          );

          if (studentAttendance) {
            const scheduleItem = batch.schedule.find(s => s.startTime === a.startTime);
            sessions.push({
              date: a.date,
              startTime: a.startTime,
              endTime: scheduleItem ? scheduleItem.endTime : null,
              status: studentAttendance.status
            });
          }
        });
      }

      return {
        batchId: batch._id,
        subject: batch.subject,
        level: batch.level,
        sessions: sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
      };
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error('Error in GET /api/admin/students/[studentId]/attendance:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 