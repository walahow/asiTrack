import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  password?: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username wajib diisi"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password wajib diisi"],
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Format email tidak valid"],
    },
    role: {
      type: String,
      required: [true, "Role wajib ditentukan"],
      enum: {
        values: ["admin", "super_admin"],
        message: "Role harus berupa admin atau super_admin",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
