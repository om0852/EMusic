import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
name:{
    type:String,
    required:true,
    unique:true
},
description:{
    type:String,
    required:true,
    unique:true
},
createdAt:{
    type:Date,
    default:Date.now()
},
});


const SubjectModel = mongoose.model('subjects',SubjectSchema);
export default SubjectModel;