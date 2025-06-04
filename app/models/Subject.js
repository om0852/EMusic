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
image: {
    type: String,
    required: true
},
status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
},
createdAt:{
    type:Date,
    default:Date.now()
},
});


const SubjectModel = mongoose.model('subjects',SubjectSchema);
export default SubjectModel;