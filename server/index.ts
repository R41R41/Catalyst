import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Prompt, defaultPrompts } from "./models/Prompt.js";
import scenarioRoutes from "./routes/scenarios.js";
import settingRoutes from "./routes/settings.js";
import characterRoutes from "./routes/characters.js";
import promptRoutes from "./routes/prompts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type"],
		credentials: true,
	})
);

app.use(express.json());

// 初期プロンプトの読み込みと保存
const initializePrompts = async () => {
	try {
		// プロンプトが既に存在するか確認
		const existingPrompts = await Prompt.find();

		// default_promptsディレクトリからファイルを読み込む
		const promptsDir = path.join(__dirname, "default_prompts");
		const files = fs.readdirSync(promptsDir);

		// 既存のプロンプト名を取得
		const existingPromptNames = existingPrompts.map((prompt) => prompt.name);

		// 重複するプロンプトを削除
		await Prompt.deleteMany({ name: { $in: existingPromptNames } });

		const existingPrompts2 = await Prompt.find();
		const existingPromptNames2 = existingPrompts2.map((prompt) => prompt.name);

		for (const file of files) {
			if (file.endsWith(".txt")) {
				const name = path.basename(file, ".txt");

				// 既存のプロンプトに存在しない場合のみ追加
				if (!existingPromptNames2.includes(name)) {
					const content = fs.readFileSync(path.join(promptsDir, file), "utf-8");
					await Prompt.create({
						id: new mongoose.Types.ObjectId().toString(),
						name,
						content,
					});
				}
			}
		}
		console.log("Prompts initialized successfully");
	} catch (error) {
		console.error("Failed to initialize prompts:", error);
	}
};

// 初期プロンプトの読み込みと保存
const initializeDefaultPrompts = async () => {
	try {
		// プロンプトが既に存在するか確認
		const existingPrompts = await defaultPrompts.find();

		// default_promptsディレクトリからファイルを読み込む
		const promptsDir = path.join(__dirname, "default_prompts");
		const files = fs.readdirSync(promptsDir);

		// 既存のプロンプト名を取得
		const existingPromptNames = existingPrompts.map((prompt) => prompt.name);

		// 重複するプロンプトを削除
		await defaultPrompts.deleteMany({ name: { $in: existingPromptNames } });

		for (const file of files) {
			if (file.endsWith(".txt")) {
				const content = fs.readFileSync(path.join(promptsDir, file), "utf-8");
				const name = path.basename(file, ".txt"); // 拡張子を除いたファイル名

				await defaultPrompts.create({
					id: new mongoose.Types.ObjectId().toString(),
					name,
					content,
				});
			}
		}

		console.log("Default prompts initialized successfully");
	} catch (error) {
		console.error("Failed to initialize prompts:", error);
	}
};

// MongoDBに接続後、初期プロンプトを設定
mongoose.connect("mongodb://localhost:27017/editor_db").then(() => {
	initializePrompts();
	initializeDefaultPrompts();
});

// ルーターをマウント
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/prompts", promptRoutes);

app.listen(5000, () => {
	console.log("Server running on port 5000");
});
