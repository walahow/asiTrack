import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  content: string;
  excerpt: string;
  cover_image_url?: string;
  kategori?: string;
  published: boolean;
  created_by: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema<IArticle> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Judul artikel wajib diisi"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Konten artikel wajib diisi"],
    },
    excerpt: {
      type: String,
      required: [true, "Kutipan (excerpt) wajib ditentukan"],
      trim: true,
    },
    cover_image_url: {
      type: String,
      trim: true,
    },
    kategori: {
      type: String,
      trim: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Pembuat artikel (Admin ID) wajib ditentukan"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to extract excerpt from rich text HTML content automatically
ArticleSchema.pre("validate", function (this: IArticle) {
  if (this.content && !this.excerpt) {
    const plainText = this.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? "..." : "");
  }
});

const Article: Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
