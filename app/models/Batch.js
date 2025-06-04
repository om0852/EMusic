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
    },
    endTime: {
      type: Date,
    },
    schedule: [
      {
        day: String,
        startTime: Date,
        endTime: Date,
        topic: String,
      }
    ],
    upComingLecture: {
      topic: String,
      date: Date,
    },
  }, { timestamps: true });

  
  const BatchModel = mongoose.model("batch",BatchSchema);
  export default BatchModel