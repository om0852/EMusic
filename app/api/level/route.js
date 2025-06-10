import LevelTypeModel from "@/app/models/Level";
import SubjectModel from "@/app/models/Subject";
import { connectDB } from "@/app/utils/db";
import { NextResponse } from "next/server";
import User from '@/app/models/User';
import Batch from '@/app/models/Batch';
import Level from '@/app/models/Level'
import Subject from '@/app/models/Subject';
// Helper function to calculate session dates
function calculateSessionDates(startDate, schedule, durationMonths) {
  const dates = [];
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  const start = new Date(startDate);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  while (start <= endDate) {
    schedule.forEach(slot => {
      const dayIndex = days.indexOf(slot.day);
      if (dayIndex === start.getDay()) {
        const sessionDate = new Date(start);
        const [startHours, startMinutes] = slot.startTime.split(':');
        
        sessionDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
        
        dates.push({
          date: new Date(sessionDate),
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    });
    
    // Move to next day
    start.setDate(start.getDate() + 1);
  }

  return dates;
}

export async function GET(request) {
  try {
    connectDB();

    const subjectId = request.nextUrl.searchParams.get("subjectId");
    
    if (subjectId) {
      const subject = await SubjectModel.findById(subjectId);
      if (!subject) {
        return NextResponse.json({ message: "Subject not found" }, { status: 404 });
      }
      const levels = await LevelTypeModel.find({ subject: subjectId });
      return NextResponse.json({ data: levels }, { status: 200 });
    } else {
      const levels = await LevelTypeModel.find().populate('subject');
      return NextResponse.json({ data: levels }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    connectDB();
    const body = await request.json();

    // Calculate session dates
    const sessionDates = calculateSessionDates(
      new Date(body.startDate),
      body.schedule,
      body.duration
    );

    // Set end date
    const endDate = new Date(body.startDate);
    endDate.setMonth(endDate.getMonth() + body.duration);

    // Create level with dates
    const levelData = {
      ...body,
      endDate,
      sessionDates
    };

    const level = await LevelTypeModel.create(levelData);
    return NextResponse.json({ data: level }, { status: 201 });
  } catch (error) {
    //console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    connectDB();

    const body = await request.json();
    const { _id, ...updateData } = body;

    // If schedule or dates are being updated, recalculate session dates
    if (updateData.startDate || updateData.schedule || updateData.duration) {
      const sessionDates = calculateSessionDates(
        new Date(updateData.startDate),
        updateData.schedule,
        updateData.duration
      );

      // Set end date
      const endDate = new Date(updateData.startDate);
      endDate.setMonth(endDate.getMonth() + updateData.duration);

      updateData.sessionDates = sessionDates;
      updateData.endDate = endDate;
    }
    
    const level = await LevelTypeModel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );
    
    if (!level) {
      return NextResponse.json({ message: "Level not found" }, { status: 404 });
    }
    
    return NextResponse.json({ data: level }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    connectDB();

    const id = request.nextUrl.searchParams.get("id");
    const level = await LevelTypeModel.findByIdAndDelete(id);
    
    if (!level) {
      return NextResponse.json({ message: "Level not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Level deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}