import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import Batch from '@/app/models/Batch';
import User from '@/app/models/User';
import { verifyAdmin } from '@/app/utils/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    await verifyAdmin(request);

    // params is already an object, no need to await it
    const { batchId } = params;
    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // Get the batch with populated students
    const batch = await Batch.findById(batchId)
      .populate({
        path: 'students',
        select: 'name email',
        match: { role: 'student' }
      })
      .lean();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }
    let arr=[]
    for(let i=0;i<batch.students.length;i++){

      const userData =await User.findById(batch.students[i].userId);
      arr.push(userData)
    }

    // Extract students from the populated batch

    return NextResponse.json({ students:arr });
  } catch (error) {
    console.error('Error in GET /api/admin/batches/[batchId]/students:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 