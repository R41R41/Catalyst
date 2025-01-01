import express from "express";
import { Scenario } from "../models/Scenario";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const scenarios = await Scenario.find();
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const scenario = new Scenario(req.body);
    await scenario.save();
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const scenario = await Scenario.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Scenario.findOneAndDelete({ id: req.params.id });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const scenario = await Scenario.findOneAndUpdate(
      { id: req.params.id },
      { name: req.body.name },
      { new: true }
    );
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
