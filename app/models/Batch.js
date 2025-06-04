import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LevelType',
    required: true
  },
  type: {
    type: String,
    enum: ['individual', 'group'],
    required: true
  },
  students: [{
    name: String,
    email: String
  }],
  schedule: [{
    day: String,
    time: String
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  subscriptionPlan: {
    duration: Number,
    name: String,
    price: Number
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

const BatchModel = mongoose.models.Batch || mongoose.model('Batch', batchSchema);

export default BatchModel;