import mongoose from 'mongoose';

const CancelledSessionSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure uniqueness of cancelled sessions
CancelledSessionSchema.index({ batchId: 1, date: 1, startTime: 1 }, { unique: true });

export default mongoose.models.CancelledSession || mongoose.model('CancelledSession', CancelledSessionSchema); 