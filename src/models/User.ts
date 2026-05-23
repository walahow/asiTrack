import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  nama_lengkap: string;
  username: string;
  password?: string;
  tgl_melahirkan: Date;
  usia?: number;
  anak_ke_berapa?: number;
  alamat?: string;
  pendidikan?: 'SD' | 'SMP' | 'SMA' | 'D3' | 'S1' | 'S2' | 'S3';
  pekerjaan?: string;
  fcm_token?: string | null;
  notif_enabled: boolean;
  profile_completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    nama_lengkap: {
      type: String,
      required: [true, "Nama lengkap wajib diisi"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username wajib diisi"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]+$/, "Username hanya boleh berisi huruf kecil, angka, dan underscore"],
    },
    password: {
      type: String,
      required: [true, "Password wajib diisi"],
    },
    tgl_melahirkan: {
      type: Date,
      required: [true, "Tanggal melahirkan wajib diisi"],
    },
    usia: {
      type: Number,
    },
    anak_ke_berapa: {
      type: Number,
    },
    alamat: {
      type: String,
      trim: true,
    },
    pendidikan: {
      type: String,
      enum: {
        values: ["SD", "SMP", "SMA", "D3", "S1", "S2", "S3"],
        message: "Pendidikan harus berupa SD, SMP, SMA, D3, S1, S2, atau S3",
      },
    },
    pekerjaan: {
      type: String,
      trim: true,
    },
    fcm_token: {
      type: String,
      default: null,
    },
    notif_enabled: {
      type: Boolean,
      default: false,
    },
    profile_completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent Next.js duplicate compile error
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
