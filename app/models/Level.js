import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    individual: {
      type: Number,
      required: true
    },
    group: {
      type: Number,
      required: true
    }
  },
  subject:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "subjects",
    required: true
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Level = mongoose.models.Level || mongoose.model('Level', levelSchema);

export default Level; 