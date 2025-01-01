import express from "express";
import { Character } from "../models/Character";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const characters = await Character.find();
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const character = new Character(req.body);
    await character.save();
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const character = await Character.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Character.findOneAndDelete({ id: req.params.id });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const character = await Character.findOneAndUpdate(
      { id: req.params.id },
      { name: req.body.name },
      { new: true }
    );
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
