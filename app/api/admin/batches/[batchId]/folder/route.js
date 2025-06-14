import Batch from "@/app/models/Batch";
import { connectDB } from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { folderName, id } = await request.json();
    await connectDB();

    const batch = await Batch.findById(id);

    if (!batch) {
        return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    // Check if folder array exists and if folderName already exists
    if (batch.folder && batch.folder.includes(folderName)) {
        return NextResponse.json({ message: "Folder name already exists" }, { status: 400 });
    }

    // Push the new folder name
    batch.folder.push(folderName);

    // Update the batch
    await Batch.findByIdAndUpdate(id, { folder: batch.folder });

    return NextResponse.json({ message: "Folder added successfully" }, { status: 200 });
}



export async function GET(request) {
    const { id } = await request.json();
    const data = await Batch.findById(id);
    if (data) {
        return NextResponse.json({ data: data }, { status: 200 })
    }
    else {
        return NextResponse.json({ message: "Batch not found" }, { status: 404 })
    }
}

export async function DELETE(request){
    const {id,folderName} = await request.json();
    await connectDB();
    const batch = await Batch.findById(id);
    if(!batch){
        return NextResponse.json({message:"Batch not found"},{status:404})
    }
    batch.folder = batch.folder.filter((folder)=>folder!==folderName);
    await batch.save();
    return NextResponse.json({message:"Folder deleted successfully"},{status:200})
}