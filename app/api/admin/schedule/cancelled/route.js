import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import CancelledSession from '@/app/models/CancelledSession';
import { verifyAdmin } from '@/app/utils/auth';

export async function POST(request) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const { batchId, date, startTime, endTime } = await request.json();

    // Create a new cancelled session record
    const cancelledSession = await CancelledSession.create({
      batchId,
      date,
      startTime,
      endTime
    });

    return NextResponse.json({ success: true, cancelledSession });
  } catch (error) {
    console.error('Error in POST /api/admin/schedule/cancelled:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    await verifyAdmin(request);

    // Get all cancelled sessions for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const cancelledSessions = await CancelledSession.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    return NextResponse.json({ cancelledSessions });
  } catch (error) {
    console.error('Error in GET /api/admin/schedule/cancelled:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
}