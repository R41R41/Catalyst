import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    content: String,
  },
  { timestamps: true }
);

export const File = mongoose.model("File", fileSchema);
