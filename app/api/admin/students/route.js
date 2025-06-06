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
    let studentsWithBatches = [];

    for (const student of students) {
      // Find all batches where this student is enrolled
      const studentBatches = await Batch.find({
        'students.userId': student._id,
        status: 'Active'
      })
      .populate('subject', 'name')
      .populate('level', 'name')
      .select('subject level price subscription students')
      .lean();

      // Create separate entries for each batch
      for (const batch of studentBatches) {
        // Find student's specific subscription data from the batch
        const studentData = batch.students.find(s => 
          s.userId.toString() === student._id.toString()
        );

        studentsWithBatches.push({
          _id: `${student._id}-${batch._id}`, // Create unique ID for each student-batch combination
          studentId: student._id,
          name: student.name,
          email: student.email,
          batch: {
            _id: batch._id,
            subject: batch.subject,
            level: batch.level,
            subscription: batch.subscription,
            joinedAt: studentData?.joinedAt,
            price: batch.price
          }
        });
      }
    }

    // Sort by student name and then by subject name
    studentsWithBatches.sort((a, b) => {
      if (a.name === b.name) {
        return a.batch.subject.name.localeCompare(b.batch.subject.name);
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ students: studentsWithBatches });
  } catch (error) {
    console.error('Error in GET /api/admin/students:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
} 