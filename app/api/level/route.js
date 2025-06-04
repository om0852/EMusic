import LevelTypeModel from "@/app/models/LevelType";
import SubjectModel from "@/app/models/Subject";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
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
    const body = await request.json();
    const level = await LevelTypeModel.create(body);
    return NextResponse.json({ data: level }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;
    
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