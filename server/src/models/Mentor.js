import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
    {
        // One-to-one link to the User. unique:true enforces "one profile per user"
        // at the index level, even if our route logic has a race window.
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        headline: {
            type: String,
            trim: true,
            maxlength: 120,
        },

        bio: {
            type: String,
            required: true,
            trim: true,
            minlength: 30,
            maxlength: 1000,
        },

        skills: {
            type: [String],
            required: true,
            validate: {
                validator: (arr) => arr.length >= 1 && arr.length <= 10,
                message: "Mentor must list between 1 and 10 skills",
            },
            // Normalize on write: trim, lowercase, drop empties. Searching is much
            // easier when "React", "react ", "REACT" all become "react".
            set: (arr) => arr.map((s) => s.trim().toLowerCase()).filter(Boolean),
        },

        yearsOfExperience: {
            type: Number,
            required: true,
            min: 0,
            max: 60,
        },

        // Stored in INR per hour. Range floor avoids "₹1/hr" trolling.
        hourlyRate: {
            type: Number,
            required: true,
            min: 100,
            max: 100000,
        },

        linkedIn: {
            type: String,
            trim: true,
            match: [/^https?:\/\/(www\.)?linkedin\.com\//i, "Must be a valid LinkedIn URL"],
        },

        // Admin-controlled flag — set to true only by manual review. Defaults false
        // so we never accidentally show unreviewed mentors as "verified".
        verified: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

mentorSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
    },
});

export const Mentor = mongoose.model("Mentor", mentorSchema);