import express from "express";
import { Setting } from "../models/Setting.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const setting = new Setting(req.body);
    await setting.save();
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Setting.findOneAndDelete({ id: req.params.id });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { id: req.params.id },
      { name: req.body.name },
      { new: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
