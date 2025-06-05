import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'audio', 'video'],
    required: true
  },
  content: String,
  file: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  file: String,
  feedback: [feedbackSchema]
});

const assignmentSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  files: {
    document: String,
    audio: String,
    video: String
  },
  dueDate: {
    type: Date,
    required: true
  },
  submissions: [submissionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);

export default Assignment; 