import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import path from "path";
import { Prompt } from "./models/Prompt";
import scenarioRoutes from "./routes/scenarios";
import settingRoutes from "./routes/settings";
import characterRoutes from "./routes/characters";
import promptRoutes from "./routes/prompts";

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
    if (existingPrompts.length > 0) {
      console.log("Prompts already exist in DB");
      return;
    }

    // default_promptsディレクトリからファイルを読み込む
    const promptsDir = path.join(__dirname, "default_prompts");
    const files = fs.readdirSync(promptsDir);

    for (const file of files) {
      if (file.endsWith(".txt")) {
        const content = fs.readFileSync(path.join(promptsDir, file), "utf-8");
        const name = path.basename(file, ".txt"); // 拡張子を除いたファイル名

        await Prompt.create({
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
});

// ルーターをマウント
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/prompts", promptRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
