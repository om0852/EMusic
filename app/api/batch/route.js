import { NextResponse } from 'next/server';
import BatchModel from '@/app/models/Batch';
import { connectDB } from '@/app/utils/db';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Calculate end date based on subscription duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + body.subscriptionPlan.duration);

    const batchData = {
      ...body,
      startDate,
      endDate
    };

    const batch = await BatchModel.create(batchData);
    return NextResponse.json({ data: batch }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Find batches where the email matches any student's email
    const batches = await BatchModel.find({
      'students.email': email
    })
    .populate('subject')
    .populate('level')
    .sort({ createdAt: -1 });

    return NextResponse.json({ data: batches }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 