import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
      index: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 60,
      min: 15,
      max: 240,
    },
    status: {
      type: String,
      enum: ["open", "booked"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

slotSchema.index({ mentorId: 1, startsAt: 1 }, { unique: true });

slotSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Slot = mongoose.model("Slot", slotSchema);
