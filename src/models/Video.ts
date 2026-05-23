import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVideo extends Document {
  title: string;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url: string;
  kategori: 'relaksasi' | 'terapi';
  deskripsi: string;
  published: boolean;
  created_by: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema<IVideo> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Judul video wajib diisi"],
      trim: true,
    },
    youtube_url: {
      type: String,
      required: [true, "URL YouTube wajib diisi"],
      trim: true,
    },
    youtube_id: {
      type: String,
      required: [true, "YouTube ID wajib ditentukan"],
      trim: true,
    },
    thumbnail_url: {
      type: String,
      required: [true, "Thumbnail URL wajib ditentukan"],
      trim: true,
    },
    kategori: {
      type: String,
      required: [true, "Kategori video wajib dipilih"],
      enum: {
        values: ["relaksasi", "terapi"],
        message: "Kategori video harus berupa relaksasi atau terapi",
      },
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi video wajib diisi"],
      trim: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Pembuat video (Admin ID) wajib ditentukan"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to extract youtube_id and generate thumbnail_url automatically
VideoSchema.pre("validate", function (this: IVideo) {
  if (this.youtube_url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = this.youtube_url.match(regExp);
    const id = match && match[2].length === 11 ? match[2] : "";

    if (id) {
      this.youtube_id = id;
      this.thumbnail_url = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
  }
});

const Video: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>("Video", VideoSchema);

export default Video;
