import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    publishedOn: {
      type: String,
      required: true,
    },
    accent: {
      type: String,
      default: "from-brandMainColor via-emerald-600 to-emerald-800",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Text index for search
BlogSchema.index({
  title: "text",
  excerpt: "text",
  category: "text",
  tags: "text",
});

const Blog = mongoose.model("Blog", BlogSchema);

export default Blog;
