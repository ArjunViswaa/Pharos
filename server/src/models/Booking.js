import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
      index: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
      unique: true,
    },
    mentorName: {
      type: String,
      required: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
  },
  { timestamps: true }
);

bookingSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Booking = mongoose.model("Booking", bookingSchema);
