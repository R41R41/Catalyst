import mongoose from "mongoose";

const promptSchema = new mongoose.Schema({
  id: String,
  name: String,
  content: String,
});

export const Prompt = mongoose.model("Prompt", promptSchema);
