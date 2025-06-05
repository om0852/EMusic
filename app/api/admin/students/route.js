import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import User from '@/app/models/User';
import Batch from '@/app/models/Batch';
import { verifyAdmin } from '@/app/utils/auth';

export async function GET(request) {
  try {
    await connectDB();
    await verifyAdmin(request);

    // Get all students
    const students = await User.find({ role: 'student' })
      .select('name email')
      .lean();

    // Process each student to get their batch information
    const studentsWithBatches = await Promise.all(students.map(async (student) => {
      // Find all batches where this student is enrolled
      const studentBatches = await Batch.find({
        'students.userId': student._id,
        status: 'Active'
      })
      .populate('subject', 'name')
      .populate('level', 'name')
      .select('subject level price subscription students')
      .lean();

      // Calculate total paid
      const totalPaid = studentBatches.reduce((sum, batch) => sum + (batch.price || 0), 0);

      // Format batch data
      const formattedBatches = studentBatches.map(batch => {
        // Find student's specific subscription data from the batch
        const studentData = batch.students.find(s => 
          s.userId.toString() === student._id.toString()
        );

        return {
          _id: batch._id,
          subject: batch.subject,
          level: batch.level,
          subscription: batch.subscription,
          joinedAt: studentData?.joinedAt,
          price: batch.price
        };
      });

      return {
        ...student,
        batches: formattedBatches,
        totalPaid
      };
    }));

    return NextResponse.json({ students: studentsWithBatches });
  } catch (error) {
    console.error('Error in GET /api/admin/students:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 