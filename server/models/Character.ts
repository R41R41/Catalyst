import mongoose from "mongoose";

const characterSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    content: String,
  },
  { timestamps: true }
);

export const Character = mongoose.model("Character", characterSchema);
