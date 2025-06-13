import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  file: {
    type: String // URL to the PDF file
  },
  folder:{
    type:String,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  file: {
    type: String // URL to the PDF file
  },
  dueDate: {
    type: Date,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: true
  },
  notesFile: {
    type: String, // URL to the PDF file
  },
  assignment: {
    type: String
  },
  assignmentFile: {
    type: String, // URL to the PDF file
  },
  date: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  students: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: true
    }
  }]
});

const batchSchema = new mongoose.Schema({
    subject: {
      type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
      required: true,
    },
  level: {
      type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
      required: true,
    },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
    },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
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
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  }],
  meetLink: {
    type: String,
    trim: true
    },
  meetPassword: {
    type: String,
    trim: true
  },
  students: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folder:{
    type:[String]
  },
  maxStudents: {
    type: Number,
    default: 30
  },
  currentStudents: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled', 'Upcoming'],
    default: 'Upcoming'
  },
  subscription: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  notes: [noteSchema],
  assignments: [assignmentSchema],
  lectures: [lectureSchema],
  attendance: [attendanceSchema],
  createdAt: {
      type: Date,
    default: Date.now
  }
});

// Update currentStudents when students are added or removed
batchSchema.pre('save', function(next) {
  if (this.isModified('students')) {
    this.currentStudents = this.students.length;
  }
  next();
});

const Batch = mongoose.models.Batch || mongoose.model('Batch', batchSchema);

export default Batch;