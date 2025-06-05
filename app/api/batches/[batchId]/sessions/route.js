import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Batch from '@/app/models/Batch';
import { verifyAuth } from '../../../../utils/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    const { batchId } = params;

    // Get the batch and verify user is enrolled
    const batch = await Batch.findOne({
      _id: batchId,
      students: user._id
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found or user not enrolled' },
        { status: 404 }
      );
    }

    // Generate sessions based on schedule
    const sessions = [];
    const now = new Date();
    const startDate = new Date(batch.startDate);
    const endDate = new Date(batch.endDate);

    // Loop through each day from start to end
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Find schedule items for this day
      const scheduleItems = batch.schedule.filter(item => item.day === dayOfWeek);
      
      for (const item of scheduleItems) {
        const sessionDate = new Date(date);
        const [hours, minutes] = item.startTime.split(':');
        sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        sessions.push({
          _id: `${batch._id}-${sessionDate.toISOString()}`,
          date: sessionDate,
          startTime: item.startTime,
          endTime: item.endTime,
          meetLink: batch.meetLink,
          recordingUrl: null // You would need to implement recording storage
        });
      }
    }

    // Sort sessions by date
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in GET /api/batches/[batchId]/sessions:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 