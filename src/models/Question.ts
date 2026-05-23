import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion extends Document {
  pertanyaan: string;
  tipe: 'yes_no' | 'open_ended';
  is_primary: boolean;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema<IQuestion> = new Schema(
  {
    pertanyaan: {
      type: String,
      required: [true, "Pertanyaan wajib diisi"],
      trim: true,
    },
    tipe: {
      type: String,
      required: [true, "Tipe pertanyaan wajib diisi"],
      enum: {
        values: ["yes_no", "open_ended"],
        message: "Tipe pertanyaan harus berupa yes_no atau open_ended",
      },
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
