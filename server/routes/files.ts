import express from "express";
import { File } from "../models/File.js";

const router = express.Router();

// 全ファイルの取得
router.get("/", async (req, res) => {
	try {
		const files = await File.find();
		res.json(files);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// ファイルの作成
router.post("/", async (req, res) => {
	try {
		const file = new File(req.body);
		await file.save();
		res.json(file);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// ファイルの削除
router.delete("/:id", async (req, res) => {
	try {
		await File.findOneAndDelete({ id: req.params.id });
		res.status(200).json({ message: "Deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// 全ファイルの削除
router.delete("/", async (req, res) => {
	try {
		await File.deleteMany({});
		res.status(200).json({ message: "Deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// ファイルの更新
router.patch("/:id", async (req, res) => {
	try {
		const file = await File.findOneAndUpdate(
			{ id: req.params.id },
			{
				name: req.body.name,
				content: req.body.content,
				index: req.body.index,
				parentId: req.body.parentId,
			},
			{ new: true }
		);
		res.json(file);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// 全ファイルの更新
router.put("/", async (req, res) => {
	try {
		// console.log(req.body);
		const files = await File.updateMany({}, { $set: req.body });
		// console.log(files);
		res.json(files);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

export default router;
