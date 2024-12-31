import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { File } from "./models/File";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/editor_db");

// ファイル一覧の取得
app.get("/api/files", async (req, res) => {
  try {
    console.log("GET /api/files リクエストを受信");
    const files = await File.find();
    console.log("取得したファイル:", files);
    res.json(files);
  } catch (error) {
    console.error("ファイル取得エラー:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ファイルの作成
app.post("/api/files", async (req, res) => {
  const file = new File(req.body);
  await file.save();
  res.json(file);
});

// ファイルの更新
app.put("/api/files/:id", async (req, res) => {
  const file = await File.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
  });
  res.json(file);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
