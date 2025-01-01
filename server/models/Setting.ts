import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    content: String,
  },
  { timestamps: true }
);

export const Setting = mongoose.model("Setting", settingSchema);
