import express from "express";
import { DefaultPrompt } from "../models/Prompt.js";

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const prompts = await DefaultPrompt.find();
		res.json(prompts);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
});

export default router;
