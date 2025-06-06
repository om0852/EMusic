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
      'students.userId': user.userId
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found or user not enrolled' },
        { status: 404 }
      );
    }

    // Generate sessions based on schedule with stored dates
    const sessions = [];
    const now = new Date();

    // For each schedule item
    for (const item of batch.schedule) {
      let currentDate = new Date(item.date);
      const [startHours, startMinutes] = item.startTime.split(':');
      
      // Set the correct time for the first session
      currentDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      // Create recurring sessions until the end date
      while (currentDate <= batch.endDate) {
        // Create a new date object for this session
        const sessionDate = new Date(currentDate);

        sessions.push({
          _id: `${batch._id}-${sessionDate.toISOString()}`,
          date: sessionDate,
          startTime: item.startTime,
          endTime: item.endTime,
          meetLink: batch.meetLink,
          recordingUrl: null // You would need to implement recording storage
        });

        // Move to next week
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 7);
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