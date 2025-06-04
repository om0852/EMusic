import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  paymentType: {
    type: String,
    enum: ["card", "upi", "wallet", "cash", "other"],
    required: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.models.subscription ||mongoose.model("Subscription", SubscriptionSchema);
