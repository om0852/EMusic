import mongoose from "mongoose";

const LevelTypeSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  schedule: [
    {
      day: String,
      time: String,
    },
  ],
  price: {
    individual: {
      type: Number,
      required: true,
    },
    group: {
      type: Number,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});


const LevelTypeModel = mongoose.models.levels || mongoose.model("levels", LevelTypeSchema);
export default LevelTypeModel;
