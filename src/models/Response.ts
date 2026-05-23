import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResponse extends Document {
  user_id: mongoose.Types.ObjectId;
  question_id: mongoose.Types.ObjectId;
  response_date: Date;
  hari_ke: number;
  jawaban: string;
  auto_filled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResponseSchema: Schema<IResponse> = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID wajib ditentukan"],
    },
    question_id: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question ID wajib ditentukan"],
    },
    response_date: {
      type: Date,
      required: [true, "Tanggal respon wajib diisi"],
    },
    hari_ke: {
      type: Number,
      required: [true, "Hari ke laktasi wajib diisi"],
      min: [1, "Hari laktasi minimal 1"],
    },
    jawaban: {
      type: String,
      required: [true, "Jawaban wajib diisi"],
      trim: true,
    },
    auto_filled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce compound unique index for user_id + question_id + response_date
ResponseSchema.index({ user_id: 1, question_id: 1, response_date: 1 }, { unique: true });

const Response: Model<IResponse> = mongoose.models.Response || mongoose.model<IResponse>("Response", ResponseSchema);

export default Response;
