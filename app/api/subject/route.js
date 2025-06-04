import SubjectModel from "@/app/models/Subject";
import { connectDB } from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    await connectDB();
    if (id) {
      const data = await SubjectModel.findOne({ _id: id });
      if (data) {
        return NextResponse.json({ data: data }, { status: 200 });
      } else {
        return NextResponse.json(
          { message: "Subject not found" },
          { status: 404 }
        );
      }
    } else {
      const data = await SubjectModel.find();
      return NextResponse.json({ data: data }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description, status, image } = await request.json();
    await connectDB();
    const data = await SubjectModel.create({
      name,
      description,
      status,
      image,
    });
    return NextResponse.json({ data: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { id, name, description, status, image } = await request.json();
    const data = await SubjectModel.findOneAndUpdate(
      { _id: id },
      { name, description, status, image },
      { new: true }
    );
    if (data) {
      return NextResponse.json({ data: data }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: error.message });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const data = await SubjectModel.findOneAndDelete({ _id: id });
      if (data) {
        return NextResponse.json({ data: data }, { status: 200 });
      } else {
        return NextResponse.json(
          { message: "Subject not found" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json({ message: "Id is required" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
