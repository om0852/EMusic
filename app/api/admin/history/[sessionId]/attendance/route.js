import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Batch from '@/app/models/Batch';
import { verifyAdmin } from '@/app/utils/auth';

export async function POST(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const sessionId = params.sessionId;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const [batchId, day, startTime] = sessionId.split('-');
    if (!batchId || !day || !startTime) {
      return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
    }

    const { attendance } = await request.json();

    // Get the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create attendance record with proper format
    const attendanceRecord = {
      date: today,
      day,
      startTime,
      students: attendance.map(student => ({
        userId: student.studentId,
        status: student.status
      }))
    };

    // Initialize attendance array if it doesn't exist
    if (!batch.attendance) {
      batch.attendance = [];
    }

    // Find existing attendance record for this session
    const existingAttendanceIndex = batch.attendance.findIndex(a => 
      a.date.toDateString() === today.toDateString() &&
      a.startTime === startTime
    );

    // Update or add the attendance record
    if (existingAttendanceIndex !== -1) {
      batch.attendance[existingAttendanceIndex] = attendanceRecord;
    } else {
      batch.attendance.push(attendanceRecord);
    }

    // Save the batch
    await batch.save();

    return NextResponse.json({ 
      success: true, 
      attendance: attendanceRecord,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/admin/history/[sessionId]/attendance:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 