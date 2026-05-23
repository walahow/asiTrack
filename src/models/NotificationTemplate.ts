import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationTemplate extends Document {
  message: string;
  tipe: 'morning' | 'afternoon' | 'evening';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema: Schema<INotificationTemplate> = new Schema(
  {
    message: {
      type: String,
      required: [true, "Pesan notifikasi wajib diisi"],
      trim: true,
    },
    tipe: {
      type: String,
      required: [true, "Tipe notifikasi wajib ditentukan"],
      enum: {
        values: ["morning", "afternoon", "evening"],
        message: "Tipe notifikasi harus berupa morning, afternoon, atau evening",
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationTemplate: Model<INotificationTemplate> =
  mongoose.models.NotificationTemplate ||
  mongoose.model<INotificationTemplate>("NotificationTemplate", NotificationTemplateSchema);

export default NotificationTemplate;
