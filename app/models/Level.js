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
    ref: "Subject",
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  sessionDates: [{
    date: {
      type: Date,
      required: true
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Level = mongoose.models.Level || mongoose.model('Level', levelSchema);

export default Level; 