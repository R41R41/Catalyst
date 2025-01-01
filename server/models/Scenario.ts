import mongoose from "mongoose";

const scenarioSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    content: String,
  },
  { timestamps: true }
);

export const Scenario = mongoose.model("Scenario", scenarioSchema);
