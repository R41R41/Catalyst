import express from "express";
import { Prompt } from "../models/Prompt";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const prompts = await Prompt.find();
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const prompt = new Prompt(req.body);
    await prompt.save();
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const prompt = await Prompt.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Prompt.findOneAndDelete({ id: req.params.id });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
