const { mongo, default: mongoose } = require("mongoose");

const BatchSchema = new mongoose.Schema({
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    levelType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    batchType: {
      type: String,
      enum: ['individual', 'group'],
      required: true
    },
    maxCapacity: {
      type: Number,
      required: function() { return this.batchType === 'group'; }
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    meetingLink: {
      type: String
    },
    paymentStatus: {
      type: Boolean,
      required: true,
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    schedule: [
      {
        day: String,
        startTime: Date,
        endTime: Date,
        topic: String,
        meetingLink: String
      }
    ],
    upComingLecture: {
      topic: String,
      date: Date,
      meetingLink: String
    },
  }, { timestamps: true });

  
  const BatchModel = mongoose.models.batch || mongoose.model("batch", BatchSchema);
  export default BatchModel